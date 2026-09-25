import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  ArrowRightLeft,
  X,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import RequestModal from '../components/RequestModal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const SearchPage = () => {
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [minRating, setMinRating] = useState('');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (skill) params.append('skill', skill);
      if (category) params.append('category', category);
      if (availability) params.append('availability', availability);
      if (minRating) params.append('minRating', minRating);

      const res = await api.get(`/users/search?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error performing search:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [skill, category, availability, minRating]);

  const handleClearFilters = () => {
    setSkill('');
    setCategory('');
    setAvailability('');
    setMinRating('');
  };

  const handleOpenRequest = (userObj) => {
    setSelectedUser(userObj);
    setIsRequestModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-indigo-400" />
          Skill Explorer & Search
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search peers by specific skill, category, availability schedule, or minimum rating score.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Filter className="w-4 h-4" />
            Search Filters
          </div>
          {(skill || category || availability || minRating) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Skill Keyword */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Search skill (e.g. React, Python)"
              className="w-full glass-input rounded-xl pl-10 pr-3 py-2 text-xs"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Design">Design</option>
              <option value="Language">Language</option>
              <option value="Business">Business</option>
              <option value="Data & AI">Data & AI</option>
              <option value="Music">Music</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="">All Availabilities</option>
              <option value="Flexible">Flexible</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
              <option value="Evenings">Evenings</option>
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars ⭐</option>
              <option value="4.0">4.0+ Stars ⭐</option>
              <option value="3.0">3.0+ Stars ⭐</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((peer) => (
            <div
              key={peer._id}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                
                {/* Peer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {peer.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{peer.name}</h3>
                      <span className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {peer.availability || 'Flexible'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {peer.avgRating > 0 ? peer.avgRating.toFixed(1) : 'New'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {peer.totalRatings || 0} ratings
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 line-clamp-2">
                  {peer.bio || 'Available for peer-to-peer skill swap sessions.'}
                </p>

                {/* Offered Skills Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Teaches (Offered)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.skillsOffered?.length > 0 ? (
                      peer.skillsOffered.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                        >
                          {s.skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Required Skills Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Wants to Learn
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {peer.skillsRequired?.length > 0 ? (
                      peer.skillsRequired.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                        >
                          {s.skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No skills listed</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Action */}
              <button
                onClick={() => handleOpenRequest(peer)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Request Exchange
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No users match your filters"
          description="Try clearing filters or searching for different skill keywords."
          actionText="Clear All Filters"
          actionLink="#"
        />
      )}

      {/* Request Modal */}
      {selectedUser && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          targetUser={selectedUser}
        />
      )}
    </div>
  );
};

export default SearchPage;
