import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-800" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-3 bg-slate-800/60 rounded w-1/4" />
      </div>
    </div>
    <div className="h-12 bg-slate-800/40 rounded-xl" />
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-slate-800 rounded-full" />
      <div className="h-6 w-20 bg-slate-800 rounded-full" />
      <div className="h-6 w-14 bg-slate-800 rounded-full" />
    </div>
  </div>
);

export const MatchSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 space-y-5 animate-pulse border border-slate-800">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-800" />
        <div className="space-y-2">
          <div className="h-5 bg-slate-800 rounded w-40" />
          <div className="h-3 bg-slate-800/60 rounded w-28" />
        </div>
      </div>
      <div className="w-16 h-16 rounded-full bg-slate-800/60" />
    </div>
    <div className="h-14 bg-slate-800/40 rounded-xl" />
    <div className="h-8 bg-slate-800/60 rounded-xl w-full" />
  </div>
);
