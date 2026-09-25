import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Star, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Zap, 
  GraduationCap, 
  BookOpen,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import api from '../services/api';
import RequestModal from '../components/RequestModal';
import { MatchSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReciprocalOnly, setFilterReciprocalOnly] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const [selectedMatchUser, setSelectedMatchUser] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matches');
      if (res.data?.success) {
        setMatches(res.data.matches);
        // Expand first match breakdown by default for demo impact!
        if (res.data.matches.length > 0) {
          setExpandedMatchId(res.data.matches[0].user._id || res.data.matches[0].user.id);
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const handleOpenRequest = (userObj) => {
    setSelectedMatchUser(userObj);
    setIsRequestModalOpen(true);
  };

  const filteredMatches = filterReciprocalOnly
    ? matches.filter(m => m.reciprocal)
    : matches;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Demo Centerpiece Hero Header */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300" />
              Demo Centerpiece — Smart Reciprocal Matching Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Skill Exchange <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Match Matrix</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Our algorithm ranks peers based on 2-way reciprocal skill alignment (You teach what they want, they teach what you want), proficiency levels, schedule availability, and community reputation.
            </p>
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-start md:self-center">
            <button
              onClick={() => setFilterReciprocalOnly(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !filterReciprocalOnly
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Matches ({matches.length})
            </button>
            <button
              onClick={() => setFilterReciprocalOnly(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterReciprocalOnly
                  ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Reciprocal Only ({matches.filter(m => m.reciprocal).length})
            </button>
          </div>
        </div>
      </div>

      {/* Matches Ranked Cards List */}
      {loading ? (
        <div className="space-y-6">
          <MatchSkeleton />
          <MatchSkeleton />
          <MatchSkeleton />
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-6">
          {filteredMatches.map((matchItem, index) => {
            const peer = matchItem.user;
            const peerId = peer._id || peer.id;
            const isExpanded = expandedMatchId === peerId;
            const breakdown = matchItem.reasonBreakdown;

            return (
              <div
                key={peerId}
                className={`glass-card rounded-3xl p-6 sm:p-7 border transition-all duration-300 space-y-6 shadow-xl ${
                  matchItem.reciprocal
                    ? 'border-indigo-500/40 bg-slate-900/80 hover:border-indigo-500/70'
                    : 'border-slate-800 bg-slate-950/70'
                }`}
              >
                
                {/* Header Row: User info + Score Ring */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {peer.name?.charAt(0)}
                      </div>
                      {matchItem.reciprocal && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow">
                          <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">{peer.name}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          Rank #{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {peer.avgRating > 0 ? peer.avgRating.toFixed(1) : 'New'} ({peer.totalRatings || 0})
                        </span>
                        <span className="flex items-center gap-1 text-indigo-300">
                          <Clock className="w-3.5 h-3.5" />
                          {peer.availability || 'Flexible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Match Score Ring / Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                        {matchItem.score}%
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</div>
                    </div>

                    {/* Reciprocal Badge */}
                    {matchItem.reciprocal ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-inner">
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                        Reciprocal Swap
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 font-semibold text-xs">
                        1-Way Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio Snippet */}
                {peer.bio && (
                  <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    "{peer.bio}"
                  </p>
                )}

                {/* Matched Skills Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Matched Skills Breakdown
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {matchItem.matchedSkills.map((chip, chipIdx) => (
                      <span
                        key={chipIdx}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                          chip.includes('(You teach)')
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : chip.includes('(They teach)')
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {chip.includes('(You teach)') && <GraduationCap className="w-3.5 h-3.5" />}
                        {chip.includes('(They teach)') && <BookOpen className="w-3.5 h-3.5" />}
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Breakdown Accordion Section (DEMO CENTERPIECE) */}
                <div className="border-t border-slate-800/80 pt-4">
                  <button
                    onClick={() => toggleExpand(peerId)}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-300 py-1 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                      Visual Score Breakdown ({matchItem.score}/100 Pts)
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400">
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isExpanded && breakdown && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-4 animate-fadeIn">
                      <p className="text-xs text-indigo-200 font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{breakdown.summary}</span>
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">2-Way Reciprocal</span>
                          <div className="text-lg font-bold text-emerald-400">+{breakdown.reciprocalPoints} / 50 pts</div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(breakdown.reciprocalPoints / 50) * 100}%` }} />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Skill Level Fit</span>
                          <div className="text-lg font-bold text-indigo-400">+{breakdown.skillFitPoints} / 25 pts</div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${(breakdown.skillFitPoints / 25) * 100}%` }} />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Schedule Fit</span>
                          <div className="text-lg font-bold text-purple-400">+{breakdown.availabilityPoints} / 15 pts</div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${(breakdown.availabilityPoints / 15) * 100}%` }} />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">User Rating</span>
                          <div className="text-lg font-bold text-amber-400">+{breakdown.ratingPoints} / 10 pts</div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${(breakdown.ratingPoints / 10) * 100}%` }} />
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenRequest(peer)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Propose Skill Swap with {peer.name}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No matches found"
          description="No matches yet — add more skills to get matched with peers."
          actionText="Update Profile Skills"
          actionLink="/profile"
        />
      )}

      {/* Request Modal */}
      {selectedMatchUser && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          targetUser={selectedMatchUser}
        />
      )}
    </div>
  );
};

export default MatchesPage;
