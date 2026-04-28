import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function StatCard({ title, value, icon: Icon, description, trend, trendType }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="w-6 h-6 text-slate-600" />
        </div>
        {trend && (
          <span className={twMerge("text-xs font-medium px-2 py-1 rounded-full", 
            trendType === 'up' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </div>
  );
}