import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, ShieldCheck, Zap, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizingId, setOptimizingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [recsRes, summaryRes] = await Promise.all([
        api.get('/api/recommendations'),
        api.get('/api/dashboard/summary')
      ]);
      setRecs(recsRes.data);
      setIsDataLoaded(summaryRes.data.cost_trends.length > 0);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleOptimize = async (resourceId, resourceType) => {
    setOptimizingId(resourceId);
    setMessage(null);
    try {
      const response = await api.post(`/api/resources/${resourceId}/optimize?resource_type=${resourceType}`);
      
      setRecs((prev) => prev.filter((rec) => rec.resource_id !== resourceId));
      
      setMessage({
        type: 'success',
        text: `Success! ${response.data.message}. Saved $${response.data.savings_amount.toFixed(2)}/mo`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to execute optimization.'
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
          <p className="text-gray-400 text-sm font-semibold tracking-wider">Analyzing Cloud Architecture...</p>
        </div>
      </div>
    );
  }

  if (!isDataLoaded) {
    return (
      <div className="flex-1 min-h-screen bg-[#030712] text-gray-200 p-8 pl-72 flex flex-col justify-center items-center">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-gray-800 text-center">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No AI Recommendations Yet</h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Please import an AWS billing dataset on the dashboard page before Bedrock AI can generate cost optimization reports.
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
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Bedrock AI Insights</h1>
          <p className="text-sm text-gray-400 mt-1">AI-generated recommendations targeting resource waste and sizing mismatches</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          Amazon Bedrock Sync
        </div>
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

      {recs.length === 0 ? (
        <div className="glass-card rounded-3xl border border-gray-800/40 p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your Cloud is Fully Optimized!</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Amazon Bedrock and the Rules Engine did not find any underutilized EC2 instances, unattached storage volumes, or inactive RDS instances.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {recs.map((rec) => {
            const severityColor = 
              rec.severity === 'HIGH' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : rec.severity === 'MEDIUM' 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';

            const cardBorder = 
              rec.severity === 'HIGH' 
                ? 'border-red-500/10 hover:border-red-500/20' 
                : rec.severity === 'MEDIUM' 
                ? 'border-amber-500/10 hover:border-amber-500/20' 
                : 'border-indigo-500/10 hover:border-indigo-500/20';

            return (
              <div 
                key={rec.resource_id} 
                className={`glass-card p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between md:flex-row md:items-center gap-6 ${cardBorder}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3.5 mb-3 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 bg-gray-800/80 border border-gray-700/30 text-gray-300 font-semibold uppercase rounded-lg">
                      {rec.resource_type}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{rec.resource_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${severityColor}`}>
                      {rec.severity} SEVERITY
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{rec.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{rec.recommendation}</p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-800 pt-4 md:pt-0 gap-4 min-w-[200px]">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-gray-500 font-semibold block mb-0.5">Est. Monthly Savings</span>
                    <span className="text-2xl font-extrabold text-emerald-450">${rec.estimated_savings.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => handleOptimize(rec.resource_id, rec.resource_type)}
                    disabled={optimizingId === rec.resource_id}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {optimizingId === rec.resource_id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    Optimize Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
