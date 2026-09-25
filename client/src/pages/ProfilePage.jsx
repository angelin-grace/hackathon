import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

const ProfilePage = () => {
  const { user, updateProfile, refreshUser } = useAuth();

  const [bio, setBio] = useState(user?.bio || '');
  const [name, setName] = useState(user?.name || '');
  const [availability, setAvailability] = useState(user?.availability || 'Flexible');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Add Offered Skill State
  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newOfferedCategory, setNewOfferedCategory] = useState('Technology');
  const [newOfferedProficiency, setNewOfferedProficiency] = useState('Intermediate');

  // Add Required Skill State
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newRequiredCategory, setNewRequiredCategory] = useState('Design');
  const [newRequiredUrgency, setNewRequiredUrgency] = useState('High');

  // Ratings Received State
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvailability(user.availability || 'Flexible');
      fetchRatings(user._id || user.id);
    }
  }, [user]);

  const fetchRatings = async (userId) => {
    try {
      const res = await api.get(`/ratings/${userId}`);
      if (res.data?.success) {
        setReceivedRatings(res.data.ratings);
      }
    } catch (err) {
      console.warn('Failed to fetch user ratings', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      await updateProfile({ name, bio, availability });
      setProfileMessage({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddOfferedSkill = async (e) => {
    e.preventDefault();
    if (!newOfferedSkill.trim()) return;

    try {
      await api.post('/users/skills/offered', {
        skill: newOfferedSkill,
        category: newOfferedCategory,
        proficiency: newOfferedProficiency
      });
      setNewOfferedSkill('');
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveOfferedSkill = async (skillId) => {
    try {
      await api.delete(`/users/skills/offered/${skillId}`);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  const handleAddRequiredSkill = async (e) => {
    e.preventDefault();
    if (!newRequiredSkill.trim()) return;

    try {
      await api.post('/users/skills/required', {
        skill: newRequiredSkill,
        category: newRequiredCategory,
        urgency: newRequiredUrgency
      });
      setNewRequiredSkill('');
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleRemoveRequiredSkill = async (skillId) => {
    try {
      await api.delete(`/users/skills/required/${skillId}`);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to remove skill');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-indigo-400" />
          Profile & Skill Portfolio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your bio, availability schedule, offered expertise, and requested skills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Settings Form */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-indigo-400" />
              Personal Details
            </h2>

            {profileMessage.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Availability Schedule
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm bg-slate-900"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Overview
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short background about your experience and exchange goals..."
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* User Reputation Score Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              Community Ratings
            </h2>
            <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-3xl font-extrabold text-amber-400">
                {user?.avgRating > 0 ? user.avgRating.toFixed(1) : 'New'}
              </div>
              <div className="text-xs text-slate-300">
                <div className="font-semibold text-white">Average Star Rating</div>
                <div>Based on {user?.totalRatings || 0} completed exchange reviews</div>
              </div>
            </div>

            {/* Received Reviews List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Recent Reviews ({receivedRatings.length})
              </span>
              {loadingRatings ? (
                <div className="text-xs text-slate-500">Loading reviews...</div>
              ) : receivedRatings.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {receivedRatings.map((rating, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{rating.fromUser?.name || 'Peer'}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" /> {rating.stars}/5
                        </span>
                      </div>
                      {rating.feedback && (
                        <p className="text-xs text-slate-300 italic">"{rating.feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No reviews received yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Skills Management */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Skills Offered Section */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Skills You Offer (Teach)</h2>
                  <p className="text-xs text-slate-400">Skills you are willing to teach to peers in exchange</p>
                </div>
              </div>
            </div>

            {/* List of Offered Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user?.skillsOffered?.length > 0 ? (
                user.skillsOffered.map((skillObj) => (
                  <div
                    key={skillObj._id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between group hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{skillObj.skill}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold text-[10px]">
                          {skillObj.proficiency || 'Intermediate'}
                        </span>
                        <span className="text-[10px] text-slate-500">{skillObj.category || 'General'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveOfferedSkill(skillObj._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No skills offered yet. Add your expertise below!
                </div>
              )}
            </div>

            {/* Form to Add Offered Skill */}
            <form onSubmit={handleAddOfferedSkill} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                + Add New Offered Skill
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={newOfferedSkill}
                  onChange={(e) => setNewOfferedSkill(e.target.value)}
                  placeholder="Skill name (e.g. React, Python)"
                  className="sm:col-span-1 glass-input rounded-xl px-3 py-2 text-xs"
                />
                <select
                  value={newOfferedCategory}
                  onChange={(e) => setNewOfferedCategory(e.target.value)}
                  className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Language">Language</option>
                  <option value="Business">Business</option>
                  <option value="Data & AI">Data & AI</option>
                  <option value="Music">Music</option>
                  <option value="General">General</option>
                </select>
                <select
                  value={newOfferedProficiency}
                  onChange={(e) => setNewOfferedProficiency(e.target.value)}
                  className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-semibold text-xs border border-emerald-500/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Offered Skill
              </button>
            </form>
          </div>

          {/* Skills Required Section */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Skills You Require (Learn)</h2>
                  <p className="text-xs text-slate-400">Skills you want to acquire from peers in exchange</p>
                </div>
              </div>
            </div>

            {/* List of Required Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user?.skillsRequired?.length > 0 ? (
                user.skillsRequired.map((skillObj) => (
                  <div
                    key={skillObj._id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between group hover:border-indigo-500/40 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{skillObj.skill}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold text-[10px]">
                          {skillObj.urgency || 'Medium'} Urgency
                        </span>
                        <span className="text-[10px] text-slate-500">{skillObj.category || 'General'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRequiredSkill(skillObj._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No required skills added yet. Add what you want to learn!
                </div>
              )}
            </div>

            {/* Form to Add Required Skill */}
            <form onSubmit={handleAddRequiredSkill} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                + Add New Required Skill
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  placeholder="Skill name (e.g. Figma, Spanish)"
                  className="sm:col-span-1 glass-input rounded-xl px-3 py-2 text-xs"
                />
                <select
                  value={newRequiredCategory}
                  onChange={(e) => setNewRequiredCategory(e.target.value)}
                  className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="Technology">Technology</option>
                  <option value="Design">Design</option>
                  <option value="Language">Language</option>
                  <option value="Business">Business</option>
                  <option value="Data & AI">Data & AI</option>
                  <option value="Music">Music</option>
                  <option value="General">General</option>
                </select>
                <select
                  value={newRequiredUrgency}
                  onChange={(e) => setNewRequiredUrgency(e.target.value)}
                  className="glass-input rounded-xl px-3 py-2 text-xs bg-slate-900"
                >
                  <option value="Low">Low Urgency</option>
                  <option value="Medium">Medium Urgency</option>
                  <option value="High">High Urgency</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Required Skill
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
