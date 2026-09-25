import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = "No items found",
  description = "No matches yet — add more skills to get matched with peers.",
  actionText = "Update Profile Skills",
  actionLink = "/profile"
}) => {
  return (
    <div className="glass-card rounded-3xl p-10 text-center max-w-lg mx-auto my-8 border border-slate-800 space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-8 h-8 text-indigo-400 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && actionLink && (
        <div className="pt-2">
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-medium text-sm border border-indigo-500/40 transition-all hover:scale-105"
          >
            {actionText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
