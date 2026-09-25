import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Inbox, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  ArrowRightLeft, 
  Loader2, 
  Check, 
  X, 
  Award,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import RatingModal from '../components/RatingModal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const RequestsPage = () => {
  const { fetchIncomingCount } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' or 'outgoing'
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRequestForRating, setSelectedRequestForRating] = useState(null);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const [incRes, outRes] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/requests/outgoing')
      ]);

      if (incRes.data?.success) {
        setIncomingRequests(incRes.data.requests);
      }
      if (outRes.data?.success) {
        setOutgoingRequests(outRes.data.requests);
      }
      fetchIncomingCount();
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // PUT /api/requests/:id/accept
  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/accept`);
      if (res.data?.success) {
        setIncomingRequests((prev) =>
          prev.map((req) => (req._id === requestId ? { ...req, status: 'Accepted' } : req))
        );
        fetchIncomingCount();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // PUT /api/requests/:id/reject
  const handleReject = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/reject`);
      if (res.data?.success) {
        setIncomingRequests((prev) =>
          prev.map((req) => (req._id === requestId ? { ...req, status: 'Rejected' } : req))
        );
        fetchIncomingCount();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // PUT /api/requests/:id/complete -> opens rating modal
  const handleMarkComplete = async (reqObj) => {
    const requestId = reqObj._id || reqObj.id;
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/complete`);
      if (res.data?.success) {
        const updatedReq = res.data.request;
        // Update local list state
        setIncomingRequests((prev) =>
          prev.map((r) => (r._id === requestId ? updatedReq : r))
        );
        setOutgoingRequests((prev) =>
          prev.map((r) => (r._id === requestId ? updatedReq : r))
        );

        // Open rating modal for this completed request
        setSelectedRequestForRating(updatedReq);
        setRatingModalOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to mark request complete');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRatingDirectly = (reqObj) => {
    setSelectedRequestForRating(reqObj);
    setRatingModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  const currentRequests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Inbox className="w-8 h-8 text-indigo-400" />
          Skill Exchange Requests
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review incoming exchange proposals, manage status, and rate completed sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'incoming'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests ({incomingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'outgoing'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Send className="w-4 h-4" />
          Outgoing Requests ({outgoingRequests.length})
        </button>
      </div>

      {/* Requests Content */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : currentRequests.length > 0 ? (
        <div className="space-y-4">
          {currentRequests.map((req) => {
            const isIncoming = activeTab === 'incoming';
            const partner = isIncoming ? req.fromUser : req.toUser;
            const requestId = req._id || req.id;
            const isLoadingThis = actionLoadingId === requestId;

            return (
              <div
                key={requestId}
                className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all"
              >
                
                {/* Details */}
                <div className="space-y-3 flex-1">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {partner?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {isIncoming ? `From: ${partner?.name}` : `To: ${partner?.name}`}
                        </h4>
                        <span className="text-xs text-slate-400">{partner?.email}</span>
                      </div>
                    </div>

                    <div className="md:hidden">{renderStatusBadge(req.status)}</div>
                  </div>

                  {/* Exchange Pair Visual */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <span className="text-slate-400 font-normal">Offered:</span> {req.offeredSkill}
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                      <span className="text-slate-400 font-normal">Requested:</span> {req.requestedSkill}
                    </div>
                  </div>

                  {/* Message */}
                  {req.message && (
                    <p className="text-xs text-slate-300 italic">"{req.message}"</p>
                  )}
                </div>

                {/* Status Badge & Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  
                  <div className="hidden md:block self-end">{renderStatusBadge(req.status)}</div>

                  {/* Incoming Pending Actions */}
                  {isIncoming && req.status === 'Pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAccept(requestId)}
                        disabled={isLoadingThis}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isLoadingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(requestId)}
                        disabled={isLoadingThis}
                        className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isLoadingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Accepted Actions (Mark Complete) */}
                  {req.status === 'Accepted' && (
                    <button
                      onClick={() => handleMarkComplete(req)}
                      disabled={isLoadingThis}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark Complete & Rate
                    </button>
                  )}

                  {/* Completed Actions (Submit Rating if not done) */}
                  {req.status === 'Completed' && (
                    <button
                      onClick={() => handleOpenRatingDirectly(req)}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Rate Partner / Feedback
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title={activeTab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
          description={
            activeTab === 'incoming'
              ? 'When other users request a skill swap with you, their proposals will appear here.'
              : 'You have not sent any exchange proposals yet.'
          }
          actionText="Find People to Swap With"
          actionLink="/matches"
        />
      )}

      {/* Rating Modal */}
      {selectedRequestForRating && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          matchRequest={selectedRequestForRating}
          onRatingSubmitted={() => fetchAllRequests()}
        />
      )}
    </div>
  );
};

export default RequestsPage;
