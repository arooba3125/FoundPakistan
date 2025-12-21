'use client';

import { useEffect, useState } from 'react';
import { casesAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/**
 * Example component showing how to fetch cases from the backend API
 * This demonstrates the integration between frontend and NestJS backend
 */
export default function CasesList() {
  const { isAuthenticated } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    q: '',
  });

  // Fetch cases from backend
  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await casesAPI.getAll(filters);
      setCases(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch cases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cases on component mount and when filters change
  useEffect(() => {
    fetchCases();
  }, [filters]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Cases</h2>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="MISSING">Missing</option>
            <option value="FOUND">Found</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && <p className="text-center text-gray-600">Loading cases...</p>}

      {/* Error state */}
      {error && <p className="text-center text-red-600">Error: {error}</p>}

      {/* Cases list */}
      {!loading && !error && cases.length === 0 && (
        <p className="text-center text-gray-600">No cases found.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="p-4 border rounded-lg hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{caseItem.title}</h3>
                  <p className="text-gray-600 text-sm">{caseItem.description}</p>
                  {caseItem.personName && (
                    <p className="text-sm mt-2">
                      <strong>Name:</strong> {caseItem.personName}
                      {caseItem.age && `, Age: ${caseItem.age}`}
                    </p>
                  )}
                  {caseItem.lastSeenLocation && (
                    <p className="text-sm">
                      <strong>Location:</strong> {caseItem.lastSeenLocation}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      caseItem.type === 'MISSING'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {caseItem.type}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Status: {caseItem.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create case button - only for authenticated users */}
      {isAuthenticated && (
        <div className="mt-6 flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Report New Case
          </button>
        </div>
      )}
    </div>
  );
}
