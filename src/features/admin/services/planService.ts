import { supabase } from '../../../supabase/config';
import { Database } from '../../../supabase/types';

export type PlanLimits = Database['public']['Tables']['plan_limits']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Fetch plan limits (both free and pro)
export async function getPlanLimits() {
  const { data, error } = await supabase
    .from('plan_limits')
    .select('*')
    .order('plan_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Update plan limits
export async function updatePlanLimits(
  planName: string,
  limits: Database['public']['Tables']['plan_limits']['Update']
) {
  const { data, error } = await supabase
    .from('plan_limits')
    // @ts-ignore
    .update(limits)
    .eq('plan_name', planName)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update user subscription plan
export async function updateUserPlan(
  userId: string,
  plan: 'free' | 'pro',
  expiresAt?: Date | null
) {
  const updates: Database['public']['Tables']['profiles']['Update'] = {
    subscription_plan: plan,
  };

  if (plan === 'pro' && expiresAt) {
    updates.subscription_expires_at = expiresAt.toISOString();
  } else if (plan === 'free') {
    updates.subscription_expires_at = null;
  }

  const { data, error} = await supabase
    .from('profiles')
    // @ts-ignore
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Extend Pro subscription by days
export async function extendProSubscription(userId: string, days: number) {
  // First get current expiration
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_expires_at')
    .eq('id', userId)
    .single();

  if (!profile) throw new Error('User not found');

  // Calculate new expiration date
  // @ts-ignore
  const currentExpiration = profile.subscription_expires_at 
    // @ts-ignore
    ? new Date(profile.subscription_expires_at)
    : new Date();
  
  currentExpiration.setDate(currentExpiration.getDate() + days);

  // Update
  const { data, error } = await supabase
    .from('profiles')
    // @ts-ignore
    .update({ subscription_expires_at: currentExpiration.toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user profile with plan info
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

// Fetch all user profiles (for admin)
export async function getAllUserProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
  return data || [];
}
