'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { casesAPI } from '@/lib/api';
import Button from '@/modules/shared/ui/Button';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await casesAPI.getById(params.id);
        setCaseData(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch case:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCase();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <Button onClick={() => router.push('/cases')}>Back to Cases</Button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Case not found</div>
          <Button onClick={() => router.push('/cases')}>Back to Cases</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="glass" onClick={() => router.push('/cases')}>
            ← Back to Cases
          </Button>
        </div>

        {/* Case Card */}
        <div className="glass-card rounded-2xl border border-white/10 p-8">
          {/* Case Type Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                caseData.type === 'MISSING'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}
            >
              {caseData.type}
            </span>
            <span
              className={`ml-2 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                caseData.status === 'OPEN'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : caseData.status === 'RESOLVED'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}
            >
              {caseData.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-6">{caseData.title}</h1>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {caseData.personName && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Person Name</div>
                <div className="text-lg text-white">{caseData.personName}</div>
              </div>
            )}

            {caseData.age && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Age</div>
                <div className="text-lg text-white">{caseData.age} years</div>
              </div>
            )}

            {caseData.gender && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Gender</div>
                <div className="text-lg text-white">{caseData.gender}</div>
              </div>
            )}

            {caseData.lastSeenLocation && (
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  {caseData.type === 'MISSING' ? 'Last Seen Location' : 'Found Location'}
                </div>
                <div className="text-lg text-white">{caseData.lastSeenLocation}</div>
              </div>
            )}

            {caseData.lastSeenAt && (
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  {caseData.type === 'MISSING' ? 'Last Seen Date' : 'Found Date'}
                </div>
                <div className="text-lg text-white">
                  {new Date(caseData.lastSeenAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {caseData.reporterContact && (
              <div>
                <div className="text-sm text-gray-400 mb-1">Contact Information</div>
                <div className="text-lg text-white">{caseData.reporterContact}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {caseData.description && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Additional Details</div>
              <div className="text-white bg-white/5 rounded-lg p-4">
                {caseData.description}
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {caseData.media && caseData.media.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Media ({caseData.media.length})</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {caseData.media.map((item) => (
                  <div key={item.id} className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                    <img
                      src={item.url}
                      alt="Case media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-400 pt-6 border-t border-white/10">
            <div className="flex justify-between">
              <span>Case ID: {caseData.id}</span>
              <span>
                Reported: {new Date(caseData.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={() => router.push('/report')}>Report Another Case</Button>
          <Button variant="glass" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
