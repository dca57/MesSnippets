// lemon-webhook/index.ts (Supabase Edge Function)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// env (définis dans Supabase)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LEMON_SIGNING_SECRET = Deno.env.get("LEMON_SIGNING_SECRET")!; // string you set in Lemon

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function hexFromArrayBuffer(ab: ArrayBuffer) {
  return Array.from(new Uint8Array(ab))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(LEMON_SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const digestHex = hexFromArrayBuffer(sig);
  // timing-safe compare
  if (digestHex.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < digestHex.length; i++) diff |= digestHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  try {
    const signature = req.headers.get("X-Signature") || req.headers.get("x-signature");
    const rawBody = await req.text();

    const ok = await verifySignature(rawBody, signature);
    if (!ok) return new Response("Invalid signature", { status: 401 });

    const payload = JSON.parse(rawBody);

    const event = payload.event || payload.event_name || payload.type; // flexible
    const data = payload.data || payload.attributes || payload;

    // For many subscription events Lemon includes a subscription object under data.subscription or similar.
    // We'll pull common fields defensively:
    const lsSubscription = data.subscription || data || {};
    const lsSubscriptionId = String(lsSubscription.id || lsSubscription.identifier || data.id || "");
    const lsCustomerId = String(lsSubscription.customer_id || lsSubscription.customer || "");
    const planId = String(lsSubscription.plan_id || lsSubscription.price_id || lsSubscription.variant_id || "");
    const status = String(lsSubscription.status || data.status || "");
    const expiresAt = lsSubscription.expires_at || lsSubscription.expires_at || lsSubscription.renews_at || null;
    const renewsAt = lsSubscription.renews_at || null;

    // insert a log row in ls_subscriptions
    await supabase.from("ls_subscriptions").insert({
      user_id: null, // we'll attempt to map user below
      ls_subscription_id: lsSubscriptionId || null,
      ls_customer_id: lsCustomerId || null,
      plan_id: planId || null,
      status: status || null,
      renews_at: renewsAt ? new Date(renewsAt) : null,
      expires_at: expiresAt ? new Date(expiresAt) : null,
      raw_payload: payload,
    });

    // Map Lemon customer -> your user_id if you stored it when creating checkout
    // Strategy: when creating checkout, pass `metadata` or `customer` fields with your user_id (recommended)
    // Here we try to recover user_id from payload (customer metadata or order metadata)
    let userId: string | null = null;
    try {
      // try common places
      if (data.customer && data.customer.metadata && data.customer.metadata.user_id) userId = data.customer.metadata.user_id;
      if (!userId && data.order && data.order.metadata && data.order.metadata.user_id) userId = data.order.metadata.user_id;
      if (!userId && payload.meta && payload.meta.user_id) userId = payload.meta.user_id;
    } catch (e) {
      // ignore
    }

    // If userId set: update profiles subscription
    if (userId) {
      // Determine new subscription_expires_at value:
      let newExpiresAt = null;
      if (expiresAt) newExpiresAt = new Date(expiresAt).toISOString();

      // Update profile: plan & expiry
      const planName = planId && planId.includes("year") ? "pro_yearly" : planId && planId.includes("month") ? "pro_monthly" : "pro";

      await supabase.from("profiles").update({
        subscription_plan: planName,
        subscription_expires_at: newExpiresAt,
      }).eq("id", userId);
      
      // Also patch the previously inserted ls_subscriptions row with user_id (optional)
      await supabase.from("ls_subscriptions").update({ user_id: userId }).eq("ls_subscription_id", lsSubscriptionId);
    } else {
      // if you didn't pass user id into Lemon metadata upon checkout creation, you can later join by email (less reliable)
      // optional: try to map by email if provided
      const email = data.customer?.email || data.order?.email || payload.data?.email;
      if (email) {
        const { data: profiles } = await supabase.from("profiles").select("id").eq("email", email).limit(1);
        if (profiles && profiles.length > 0) {
          const mappedUserId = profiles[0].id;
          await supabase.from("profiles").update({
            subscription_plan: planId ? "pro" : "pro",
            subscription_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          }).eq("id", mappedUserId);
          await supabase.from("ls_subscriptions").update({ user_id: mappedUserId }).eq("ls_subscription_id", lsSubscriptionId);
        }
      }
    }

    // handle specific events (optional fine grain)
    // e.g. subscription_expired -> set profile to free
    if (event === "subscription_expired") {
      if (userId) {
        await supabase.from("profiles").update({
          subscription_plan: "free",
          // subscription_expires_at left as-is (expired in past)
        }).eq("id", userId);
      }
    }

    // Return 200
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("webhook error", err);
    return new Response("error", { status: 500 });
  }
});
