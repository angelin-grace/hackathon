import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, User, Mail, Lock, UserPlus, AlertCircle, Clock } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    availability: 'Flexible',
    offeredSkillName: '',
    offeredCategory: 'Technology',
    offeredProficiency: 'Intermediate',
    requiredSkillName: '',
    requiredCategory: 'Design',
    requiredUrgency: 'High'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        availability: formData.availability,
        skillsOffered: formData.offeredSkillName
          ? [{ skill: formData.offeredSkillName, category: formData.offeredCategory, proficiency: formData.offeredProficiency }]
          : [],
        skillsRequired: formData.requiredSkillName
          ? [{ skill: formData.requiredSkillName, category: formData.requiredCategory, urgency: formData.requiredUrgency }]
          : []
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 mx-auto shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ArrowRightLeft className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your SkillSwap Profile
          </h2>
          <p className="text-sm text-slate-400">
            Join the peer-to-peer reciprocal skill exchange network
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-800">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                1. Basic Info
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Jordan Lee"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jordan@example.com"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 chars"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Availability
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm bg-slate-900"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Evenings">Evenings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skill Setup */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                2. Initial Skill Pair
              </h3>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Skill You Can Teach (Offer)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="offeredSkillName"
                    value={formData.offeredSkillName}
                    onChange={handleChange}
                    placeholder="e.g. React, Python, UI Design"
                    className="sm:col-span-2 glass-input rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    name="offeredProficiency"
                    value={formData.offeredProficiency}
                    onChange={handleChange}
                    className="glass-input rounded-lg px-3 py-2 text-sm bg-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                  Skill You Want to Learn (Require)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="requiredSkillName"
                    value={formData.requiredSkillName}
                    onChange={handleChange}
                    placeholder="e.g. Figma, Spanish, Marketing"
                    className="sm:col-span-2 glass-input rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    name="requiredUrgency"
                    value={formData.requiredUrgency}
                    onChange={handleChange}
                    className="glass-input rounded-lg px-3 py-2 text-sm bg-slate-900"
                  >
                    <option value="Low">Low Urgency</option>
                    <option value="Medium">Medium Urgency</option>
                    <option value="High">High Urgency</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Sign In Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
