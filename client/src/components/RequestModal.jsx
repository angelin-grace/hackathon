import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, X, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RequestModal = ({ isOpen, onClose, targetUser, initialOfferedSkill, initialRequestedSkill, onRequestSent }) => {
  const { user: currentUser } = useAuth();
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);

      // Default offered skill from current user's skills
      if (initialOfferedSkill) {
        setOfferedSkill(initialOfferedSkill);
      } else if (currentUser?.skillsOffered?.length > 0) {
        setOfferedSkill(currentUser.skillsOffered[0].skill);
      } else {
        setOfferedSkill('');
      }

      // Default requested skill from target user's offered skills
      if (initialRequestedSkill) {
        setRequestedSkill(initialRequestedSkill);
      } else if (targetUser?.skillsOffered?.length > 0) {
        setRequestedSkill(targetUser.skillsOffered[0].skill);
      } else {
        setRequestedSkill('');
      }

      setMessage(`Hi ${targetUser?.name || 'there'}! I'd love to exchange skills with you. Let me know if you are open to swapping!`);
    }
  }, [isOpen, targetUser, initialOfferedSkill, initialRequestedSkill, currentUser]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkill) {
      setError('Please select or specify a skill you will teach/offer.');
      return;
    }
    if (!requestedSkill) {
      setError('Please select or specify a skill you want to learn/receive.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const targetId = targetUser._id || targetUser.id;
      const res = await api.post('/requests', {
        toUser: targetId,
        offeredSkill,
        requestedSkill,
        message
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onRequestSent) onRequestSent(res.data.request);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 shadow-2xl border border-indigo-500/20 bg-slate-900/95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white">Exchange Request Sent!</h3>
            <p className="text-sm text-slate-300">
              We notified <span className="text-indigo-300 font-semibold">{targetUser.name}</span>. You can track status in your Requests tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ArrowRightLeft className="w-4 h-4" />
                Initiate Skill Exchange
              </div>
              <h3 className="text-xl font-bold text-white">
                Propose Swap with <span className="text-indigo-300">{targetUser.name}</span>
              </h3>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Exchange Pair Visual Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* What I Offer */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  1. You Teach (Offer)
                </span>
                {currentUser?.skillsOffered?.length > 0 ? (
                  <select
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm bg-slate-900"
                  >
                    {currentUser.skillsOffered.map((s, idx) => (
                      <option key={idx} value={s.skill}>
                        {s.skill} ({s.proficiency || 'Skill'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter skill you will teach"
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>

              {/* What I Learn */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
                  2. They Teach (Learn)
                </span>
                {targetUser?.skillsOffered?.length > 0 ? (
                  <select
                    value={requestedSkill}
                    onChange={(e) => setRequestedSkill(e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm bg-slate-900"
                  >
                    {targetUser.skillsOffered.map((s, idx) => (
                      <option key={idx} value={s.skill}>
                        {s.skill} ({s.proficiency || 'Skill'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter skill you want to learn"
                    value={requestedSkill}
                    onChange={(e) => setRequestedSkill(e.target.value)}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>

            </div>

            {/* Message input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Personalized Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain what you'd like to work on together..."
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Exchange Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestModal;
