import React, { useState } from 'react';
import { Star, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const RatingModal = ({ isOpen, onClose, matchRequest, onRatingSubmitted }) => {
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !matchRequest) return null;

  // Determine who the target user being rated is
  const targetUser = matchRequest.targetUser || matchRequest.toUser || matchRequest.fromUser;
  const targetName = targetUser?.name || 'Exchange Partner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/ratings', {
        matchRequest: matchRequest._id || matchRequest.id,
        toUser: targetUser._id || targetUser.id,
        stars,
        feedback
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onRatingSubmitted) onRatingSubmitted(res.data.rating);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl border border-indigo-500/20 bg-slate-900/95">
        
        {/* Close button */}
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
            <h3 className="text-xl font-bold text-white">Rating Submitted!</h3>
            <p className="text-sm text-slate-300">
              Thank you for providing feedback to build trust in our community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                Rate Exchange Experience
              </div>
              <h3 className="text-xl font-bold text-white">
                How was your session with <span className="text-indigo-300">{targetName}</span>?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Swapped: <span className="text-slate-200">{matchRequest.offeredSkill}</span> ↔{' '}
                <span className="text-slate-200">{matchRequest.requestedSkill}</span>
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Picker */}
            <div className="space-y-2 text-center py-2 bg-slate-950/40 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Select Rating</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const active = (hoverStars || stars) >= starIndex;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      onClick={() => setStars(starIndex)}
                      onMouseEnter={() => setHoverStars(starIndex)}
                      onMouseLeave={() => setHoverStars(0)}
                      className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-semibold text-amber-400">
                {stars === 5 && '🌟 Exceptional Exchange!'}
                {stars === 4 && '✨ Great Experience'}
                {stars === 3 && '👍 Good Session'}
                {stars === 2 && '😐 Average'}
                {stars === 1 && '👎 Needs Improvement'}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Feedback & Review (Optional)
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={`Share what you learned from ${targetName} or how helpful they were...`}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm resize-none"
              />
            </div>

            {/* Action buttons */}
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
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
