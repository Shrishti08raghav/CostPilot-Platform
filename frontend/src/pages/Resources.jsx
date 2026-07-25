import React, { useState, useEffect } from 'react';
import { Server, Zap, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizingId, setOptimizingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/resources');
      setResources(response.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOptimize = async (resourceId, resourceType) => {
    setOptimizingId(resourceId);
    setMessage(null);
    try {
      const response = await api.post(`/api/resources/${resourceId}/optimize?resource_type=${resourceType}`);
      
      setResources((prev) =>
        prev.map((res) => {
          if (res.resource_id === resourceId) {
            return {
              ...res,
              status: res.resource_type === 'EBS' ? 'deleted' : 'stopped',
              cpu_utilization: 0.0,
              savings_estimate: 0.0
            };
          }
          return res;
        })
      );
      
      setMessage({
        type: 'success',
        text: `Success! ${response.data.message}. Saved $${response.data.savings_amount.toFixed(2)}/mo`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to optimize resource.'
      });
    } finally {
      setOptimizingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#030712] text-white pl-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-semibold tracking-wider">Loading AWS resource state...</p>
        </div>
      </div>
    );
  }

  const isDatasetEmpty = resources.length === 0;

  if (isDatasetEmpty) {
    return (
      <div className="flex-1 min-h-screen bg-[#030712] text-gray-200 p-8 pl-72 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-gray-800 text-center">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Infrastructure Data Found</h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Please import an AWS billing dataset on the dashboard page before accessing the resources console.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#030712] text-gray-200 p-8 pl-72">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">AWS Infrastructure Resources</h1>
          <p className="text-sm text-gray-400 mt-1">Continuous auditing of active instances, storage volumes, and services</p>
        </div>
        <button
          onClick={fetchResources}
          className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:bg-gray-800/40 transition rounded-xl text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
          Sync State
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {message.text}
        </div>
      )}

      <div className="glass-card rounded-3xl border border-gray-800/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/30">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Resource Info</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Service Type</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Utilization (CPU/IOPS)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400">Cost / Month</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {resources.map((res) => {
                const isOptimizable = res.savings_estimate > 0 && !['stopped', 'terminated', 'deleted'].includes(res.status);
                
                return (
                  <tr key={res.resource_id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-800/60 border border-gray-700/30 rounded-xl">
                          <Server className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-200">{res.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{res.resource_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold tracking-wide rounded-lg uppercase">
                        {res.resource_type}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        ['stopped', 'terminated', 'deleted'].includes(res.status)
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ['stopped', 'terminated', 'deleted'].includes(res.status)
                            ? 'bg-red-400'
                            : 'bg-emerald-400'
                        }`} />
                        {res.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {res.cpu_utilization !== null ? (
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-gray-500 font-medium">Avg Load</span>
                            <span className={`font-semibold ${res.cpu_utilization < 5 ? 'text-amber-400' : 'text-gray-300'}`}>
                              {res.cpu_utilization.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-28 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${res.cpu_utilization < 5 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${Math.min(res.cpu_utilization, 100)}%` }} 
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-200">
                      ${res.cost_per_month.toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {isOptimizable ? (
                        <button
                          onClick={() => handleOptimize(res.resource_id, res.resource_type)}
                          disabled={optimizingId === res.resource_id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-[#030712] font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/10 border border-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {optimizingId === res.resource_id ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#030712] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Optimize Now
                        </button>
                      ) : (
                        <span className="text-emerald-400/70 text-xs font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Optimized
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default Resources;
