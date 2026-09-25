import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Inbox, 
  Star, 
  User, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import api from '../services/api';
import RequestModal from '../components/RequestModal';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Dashboard = () => {
  const { user, pendingRequestsCount } = useAuth();
  const [topMatches, setTopMatches] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [matchesRes, reqsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/requests/incoming')
        ]);

        if (matchesRes.data?.success) {
          setTopMatches(matchesRes.data.matches.slice(0, 3));
        }

        if (reqsRes.data?.success) {
          setIncomingRequests(reqsRes.data.requests.filter(r => r.status === 'Pending'));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenRequest = (target) => {
    setSelectedTargetUser(target);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner / Welcome Header */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active Exchange Participant
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{user?.name}</span>!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Connect with peers, offer your expertise, and gain new skills through reciprocal exchanges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/matches"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              Explore Matches
            </Link>
            <Link
              to="/profile"
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <User className="w-4 h-4 text-indigo-400" />
              Edit Skills
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Incoming Requests Alert Banner */}
      {incomingRequests.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-purple-500/15 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Incoming Request Pending!
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-400 text-slate-950 font-bold">
                  {incomingRequests.length} new
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-indigo-300">{incomingRequests[0]?.fromUser?.name}</span> wants to swap{' '}
                <span className="text-emerald-300 font-medium">{incomingRequests[0]?.offeredSkill}</span> for{' '}
                <span className="text-purple-300 font-medium">{incomingRequests[0]?.requestedSkill}</span>.
              </p>
            </div>
          </div>
          <Link
            to="/requests"
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs flex items-center gap-1.5 self-start sm:self-center shadow-md transition-all"
          >
            Review Requests
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Profile Overview Card & Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{user?.name}</h3>
                <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {user?.availability || 'Flexible'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                {user?.avgRating > 0 ? user.avgRating.toFixed(1) : 'New'}
              </div>
              <span className="text-[10px] text-slate-400">
                {user?.totalRatings || 0} reviews
              </span>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-xs text-slate-300 italic line-clamp-2">
              "{user.bio}"
            </p>
          )}

          {/* Skills Summary */}
          <div className="space-y-3 pt-1">
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Skills Offered ({user?.skillsOffered?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.skillsOffered?.length > 0 ? (
                  user.skillsOffered.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium"
                    >
                      {s.skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No offered skills added yet</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Skills Required ({user?.skillsRequired?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.skillsRequired?.length > 0 ? (
                  user.skillsRequired.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                    >
                      {s.skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No required skills added yet</span>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/profile"
            className="block text-center w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Manage Profile & Skills →
          </Link>
        </div>

        {/* Quick Analytics & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{user?.skillsOffered?.length || 0}</div>
                <div className="text-xs text-slate-400 font-medium">Offered Skills</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{user?.skillsRequired?.length || 0}</div>
                <div className="text-xs text-slate-400 font-medium">Required Skills</div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{user?.avgRating > 0 ? `${user.avgRating}/5` : 'N/A'}</div>
                <div className="text-xs text-slate-400 font-medium">Reputation Score</div>
              </div>
            </div>
          </div>

          {/* Top Suggested Matches Preview Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Top Suggested Matches Preview
              </h2>
              <Link to="/matches" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View All Matches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : topMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topMatches.map((matchItem, idx) => {
                  const target = matchItem.user;
                  return (
                    <div key={idx} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {target.name?.charAt(0)}
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                            {matchItem.score}% Match
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-sm">{target.name}</h4>
                          <span className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {target.avgRating > 0 ? target.avgRating.toFixed(1) : 'New'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2">
                          {target.bio || 'Ready to exchange skills.'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenRequest(target)}
                        className="w-full py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Request Exchange
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-400">No matches found yet.</p>
                <Link to="/profile" className="text-xs text-indigo-400 font-semibold underline">
                  Add more skills to get matched with peers →
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal for initiating request */}
      {selectedTargetUser && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          targetUser={selectedTargetUser}
        />
      )}
    </div>
  );
};

export default Dashboard;
