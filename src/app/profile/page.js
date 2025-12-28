'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { caseApi } from '@/lib/caseApi';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, token, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [myCases, setMyCases] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
      return;
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!token || !user) return;
      if (loading || !isAuthenticated || user?.role === 'admin') return;
      
      setLoadingCases(true);
      setLoadingRequests(true);
      
      // Load cases separately from contact requests to identify which one fails
      try {
        const casesData = await caseApi.getMyCases(token);
        setMyCases(casesData || []);
      } catch (err) {
        console.error('Failed to load cases:', err);
        setMyCases([]);
      } finally {
        setLoadingCases(false);
      }
      
      try {
        const requestsData = await caseApi.getContactRequests(token);
        setContactRequests(requestsData || []);
      } catch (err) {
        console.error('Failed to load contact requests:', err);
        setContactRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadData();
  }, [token, user, loading, isAuthenticated]);

  const handleApproveRequest = async (requestId) => {
    if (!token) return;
    setActionLoading({ ...actionLoading, [`approve-${requestId}`]: true });
    try {
      await caseApi.approveContactRequest(requestId, token);
      // Reload requests
      const requestsData = await caseApi.getContactRequests(token);
      setContactRequests(requestsData || []);
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setActionLoading({ ...actionLoading, [`approve-${requestId}`]: false });
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!token) return;
    setActionLoading({ ...actionLoading, [`reject-${requestId}`]: true });
    try {
      await caseApi.rejectContactRequest(requestId, token);
      // Reload requests
      const requestsData = await caseApi.getContactRequests(token);
      setContactRequests(requestsData || []);
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoading({ ...actionLoading, [`reject-${requestId}`]: false });
    }
  };

  // Show loading state while checking auth or if not authenticated
  if (loading || !isAuthenticated || user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const pendingRequests = contactRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
              <p className="text-emerald-100/80">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="glass-card border border-white/10 text-white font-semibold px-4 py-2 rounded-xl hover:border-emerald-400/60 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="bg-red-500/20 border border-red-400/50 text-red-200 font-semibold px-4 py-2 rounded-xl hover:border-red-400/80 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Contact Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="glass-card rounded-3xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Contact Requests ({pendingRequests.length})</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-emerald-100/80 mb-1">Case: <span className="text-white font-semibold">{request.case?.name || 'N/A'}</span></p>
                      <p className="text-sm text-emerald-100/80 mb-1">From: <span className="text-white">{request.requester_email}</span></p>
                      {request.requester_message && (
                        <p className="text-sm text-emerald-100/80 mt-2 italic">"{request.requester_message}"</p>
                      )}
                      <p className="text-xs text-emerald-100/60 mt-2">
                        Requested: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={actionLoading[`approve-${request.id}`]}
                        className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-semibold px-4 py-2 rounded-lg hover:border-emerald-400/80 transition-colors disabled:opacity-50 text-sm"
                      >
                        {actionLoading[`approve-${request.id}`] ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={actionLoading[`reject-${request.id}`]}
                        className="bg-red-500/20 border border-red-400/50 text-red-200 font-semibold px-4 py-2 rounded-lg hover:border-red-400/80 transition-colors disabled:opacity-50 text-sm"
                      >
                        {actionLoading[`reject-${request.id}`] ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Cases Section */}
        <div className="glass-card rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">My Cases ({myCases.length})</h2>
            <Link
              href="/report"
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold px-4 py-2 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all"
            >
              + Report New Case
            </Link>
          </div>

          {loadingCases ? (
            <div className="text-center py-8 text-emerald-100">Loading cases...</div>
          ) : myCases.length === 0 ? (
            <div className="text-center py-8 text-emerald-100/80">
              <p className="mb-4">You haven't reported any cases yet.</p>
              <Link
                href="/report"
                className="inline-block bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all"
              >
                Report Your First Case
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myCases.map((c) => (
                <div key={c.case_id || c.id} className="bg-white/5 rounded-2xl border border-white/10 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {c.media?.[0] && (
                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 flex-shrink-0">
                        <Image
                          src={c.media[0].file_url || c.media[0].url}
                          alt={c.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{c.name}</h3>
                      <p className="text-xs text-emerald-100/80">{c.case_id || c.id}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                        c.cancelled_at ? 'bg-gray-500/20 text-gray-200' :
                        c.status === 'verified' ? 'bg-emerald-500/20 text-emerald-200' :
                        c.status === 'found' ? 'bg-blue-500/20 text-blue-200' :
                        c.status === 'rejected' ? 'bg-red-500/20 text-red-200' :
                        c.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                        'bg-amber-500/20 text-amber-200'
                      }`}>
                        {c.cancelled_at ? 'Canceled' :
                         c.status === 'found' ? 'Found' :
                         c.status === 'rejected' ? 'Rejected' :
                         c.status === 'verified' ? 'Verified' :
                         c.status === 'pending' ? 'Pending' :
                         c.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-100/80 space-y-1">
                    <p>Type: {c.case_type === 'missing' ? 'Missing' : 'Found'}</p>
                    <p>City: {c.city}</p>
                    <p>Reported: {new Date(c.createdAt || c.created_at).toLocaleDateString()}</p>
                    {c.cancelled_at && (
                      <p className="text-red-400 font-semibold">Cancelled</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                    <Link
                      href={`/?caseId=${c.case_id || c.id}`}
                      className="flex-1 text-center bg-white/10 text-white text-xs font-semibold py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      View
                    </Link>
                    {/* Cancel button - only show if case can be cancelled */}
                    {!c.cancelled_at && c.status !== 'found' && c.status !== 'rejected' && (
                      <button
                        onClick={async () => {
                          if (!token) return;
                          if (!confirm('Are you sure you want to cancel this case? This action cannot be undone.')) {
                            return;
                          }
                          try {
                            await caseApi.cancelCase(c.case_id || c.id, token);
                            // Reload cases
                            const casesData = await caseApi.getMyCases(token);
                            setMyCases(casesData || []);
                          } catch (err) {
                            alert(err.message || 'Failed to cancel case');
                          }
                        }}
                        className="flex-1 text-center bg-red-500/20 border border-red-400/50 text-red-200 text-xs font-semibold py-2 rounded-lg hover:border-red-400/80 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {/* Mark Found button - for both missing and found cases that are verified */}
                    {!c.cancelled_at && c.status === 'verified' && (
                      <button
                        onClick={async () => {
                          if (!token) return;
                          const confirmMessage = c.case_type === 'missing' 
                            ? 'Are you sure you found this person? This will mark the case as found.'
                            : 'Are you sure this case is resolved? (e.g., person was claimed by family). This will mark the case as found.';
                          if (!confirm(confirmMessage)) {
                            return;
                          }
                          try {
                            await caseApi.markAsFoundByUser(c.case_id || c.id, token);
                            // Reload cases
                            const casesData = await caseApi.getMyCases(token);
                            setMyCases(casesData || []);
                          } catch (err) {
                            alert(err.message || 'Failed to mark case as found');
                          }
                        }}
                        className="flex-1 text-center bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-semibold py-2 rounded-lg hover:border-emerald-400/80 transition-colors"
                      >
                        {c.case_type === 'missing' ? 'Mark Found' : 'Mark Resolved'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
