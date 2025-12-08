// Supabase Edge Function: llm-proxy
// This function acts as a secure proxy for LLM API calls
// It handles authentication, quota checking, and usage logging

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. Verify user authentication
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: true, message: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Parse request body
    const { action, providerId, messages, model, origin, maxTokens } =
      await req.json();

    console.log("LLM Proxy - Request received:", {
      action,
      providerId,
      origin,
      userId: user.id,
      maxTokens,
    });

    if (!origin) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Origin (tool_name) is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Determine User Plan
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("subscription_plan, subscription_expires_at")
      .eq("id", user.id)
      .single();

    const userPlan = profile?.subscription_plan || "free";
    const isProExpired =
      userPlan === "pro" && profile?.subscription_expires_at
        ? new Date(profile.subscription_expires_at) < new Date()
        : false;
    const effectivePlan = isProExpired ? "free" : userPlan;

    console.log("User Plan:", { effectivePlan, userPlan, isProExpired });

    // 5. Load Tool Configuration
    const { data: toolConfig, error: configError } = await supabaseClient
      .from("ia_config")
      .select("*")
      .eq("tool_name", origin)
      .single();

    if (configError || !toolConfig) {
      console.warn(
        `No configuration found for tool: ${origin}. Using defaults.`
      );
      // Fallback defaults if config missing (or return error if strict)
    }

    // 6. Check Permissions & Limits
    if (effectivePlan === "free") {
      if (toolConfig && !toolConfig.free_can_use) {
        return new Response(
          JSON.stringify({
            error: true,
            message: "This feature is available for Pro users only.",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const maxInputTokens =
      effectivePlan === "pro"
        ? toolConfig?.max_input_tokens_pro || 4000
        : toolConfig?.max_input_tokens_free || 1000;

    // Use maxTokens from request if provided (frontend calculated based on real-time plan),
    // otherwise fall back to config-based calculation
    const maxOutputTokens =
      maxTokens ||
      (effectivePlan === "pro"
        ? toolConfig?.max_output_tokens_pro || 2000
        : toolConfig?.max_output_tokens_free || 500);

    // 7. Check Monthly Quota
    // Get plan limits
    const { data: planLimits } = await supabaseClient
      .from("plan_limits")
      .select("max_tokens_llm")
      .eq("plan_name", effectivePlan)
      .single();

    const monthlyLimit = planLimits?.max_tokens_llm || 10000; // Default fallback

    // Calculate current usage for this month
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const { data: usageData, error: usageError } = await supabaseClient
      .from("user_llm_usage")
      .select("tokens_input, tokens_output")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth);

    if (usageError) {
      console.error("Error fetching usage:", usageError);
      // Fail safe? Or block? Let's log and proceed but maybe warn.
    }

    const totalUsed =
      usageData?.reduce(
        (acc, curr) =>
          acc + (curr.tokens_input || 0) + (curr.tokens_output || 0),
        0
      ) || 0;

    if (totalUsed >= monthlyLimit) {
      return new Response(
        JSON.stringify({
          error: true,
          message: `Monthly token limit reached (${totalUsed}/${monthlyLimit}). Please upgrade to Pro or wait for next month.`,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Fetch provider configuration
    const { data: provider, error: providerError } = await supabaseClient
      .from("llm_providers")
      .select("*")
      .eq("id", providerId)
      .eq("is_active", true)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Provider not found or inactive",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 9. Call LLM API based on provider
    let response;
    try {
      if (provider.provider === "openai") {
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${provider.api_key}`,
            },
            body: JSON.stringify({
              model: provider.model_id,
              messages,
              temperature: 0.7,
              max_tokens: maxOutputTokens,
            }),
          }
        );

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
          throw new Error(data.error?.message || "OpenAI API error");
        }

        response = {
          response: data.choices[0].message.content,
          usage: data.usage,
        };
      } else if (provider.provider === "openrouter") {
        const apiUrl = provider.base_url || "https://openrouter.ai/api/v1";
        const openrouterResponse = await fetch(`${apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.api_key}`,
            "HTTP-Referer": "https://messnippets.vercel.app",
            "X-Title": "messnippets",
          },
          body: JSON.stringify({
            model: provider.model_id,
            messages,
            temperature: 0.7,
            max_tokens: maxOutputTokens,
          }),
        });

        const data = await openrouterResponse.json();

        if (!openrouterResponse.ok) {
          // Handle specific OpenRouter errors if needed (e.g. 429)
          if (openrouterResponse.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          }
          throw new Error(data.error?.message || "OpenRouter API error");
        }

        response = {
          response: data.choices[0].message.content,
          usage: data.usage,
        };
      } else {
        throw new Error(`Provider ${provider.provider} not supported yet`);
      }

      // 10. Log usage
      const currentUsage = {
        user_id: user.id,
        model_id: provider.id,
        tokens_input: response.usage?.prompt_tokens || 0,
        tokens_output: response.usage?.completion_tokens || 0,
        origin: origin,
      };

      const { error: insertError } = await supabaseClient
        .from("user_llm_usage")
        .insert(currentUsage);
      if (insertError) console.error("Error logging usage:", insertError);

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (llmError: any) {
      console.error("LLM Call Error:", llmError);
      return new Response(
        JSON.stringify({
          error: true,
          message: llmError.message || "Error calling LLM provider",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in llm-proxy:", error);
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
