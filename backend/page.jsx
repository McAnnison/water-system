'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, TrendingDown, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Assuming token is stored in localStorage after CEO login
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        setError('Failed to load financial metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading business metrics...</div>;
  if (error) return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 m-8">
      <AlertCircle className="w-5 h-5" /> {error}
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Financial Work Rate</h1>
        <p className="text-slate-500">Real-time performance metrics for SDK Alkaline Water Ltd.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Income" 
          value={`₵${stats.summary.totalIncome.toLocaleString()}`} 
          icon={DollarSign}
          description="Total revenue (30 days)"
        />
        
        <StatCard 
          title="Total Expenses" 
          value={`₵${stats.summary.totalExpenses.toLocaleString()}`} 
          icon={TrendingDown}
          description="Operations & Production costs"
        />

        <StatCard 
          title="Net Profit" 
          value={`₵${stats.summary.netProfit.toLocaleString()}`} 
          icon={Activity}
          description="Take-home after expenses"
          trend={stats.summary.netProfit > 0 ? "Profitable" : "Deficit"}
          trendType={stats.summary.netProfit > 0 ? 'up' : 'down'}
        />

        <StatCard 
          title="Daily Burn Rate" 
          value={`₵${stats.rates.dailyBurnRate}`} 
          icon={TrendingUp}
          description="Average daily cash outflow"
        />
      </div>

      <div className="mt-8 bg-blue-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-blue-200 text-sm font-medium uppercase tracking-wider">Revenue Velocity</h2>
          <p className="text-3xl font-bold">₵{stats.rates.dailyRevenueRate} / day</p>
        </div>
        <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
      </div>
    </div>
  );
}