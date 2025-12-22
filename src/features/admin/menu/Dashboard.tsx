import React, { useState, useEffect } from 'react';
import { Users, Activity, Shield } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { supabase } from '../../../supabase/config';

const Dashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [proUsers, setProUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Get total auth users
      const { count: authCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get profiles with plan info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('subscription_plan');

      setTotalUsers(authCount || 0);
      setTotalProfiles(profiles?.length || 0);
      setProUsers(profiles?.filter(p => (p as any)?.subscription_plan === 'pro').length || 0);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          sub="Registered accounts"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Profiles"
          value={totalProfiles}
          sub="With profile data"
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard
          title="Pro Users"
          value={proUsers}
          sub={`${totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0}% of total`}
          icon={Shield}
          color="bg-emerald-500"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500">Platform</span>
            <p className="text-2xl font-bold text-blue-600">
              Mes Snippets{' '}
              <span className="text-xs font-normal text-slate-400">v1.0.0</span>
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500">Database</span>
            <p className="text-2xl font-bold text-purple-600">
              Supabase{' '}
              <span className="text-xs font-normal text-slate-400">Connected</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl border border-blue-200 dark:border-slate-600">
        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">
          📊 Admin Dashboard
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          This is a minimal admin dashboard for your template. You can customize it to show metrics specific to your application.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Navigate between tabs to manage users, configure plans, adjust LLM settings, and more.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
