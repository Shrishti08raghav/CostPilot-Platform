import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Cpu, ShieldAlert, Sparkles, CheckCircle2, History, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, historyRes] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/resources/history')
      ]);
      setData(summaryRes.data);
      setHistory(historyRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setUploadMessage(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setUploadMessage(null);

    try {
      await api.post('/api/dashboard/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMessage("Dataset uploaded and parsed successfully!");
      setFile(null);
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload file. Please ensure it is a valid CSV.");
    } finally {
      setUploading(false);
    }
  };

  const handleResetDataset = async () => {
    if (!window.confirm("Are you sure you want to delete the uploaded dataset and all optimization history?")) {
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/api/dashboard/reset');
      setData(null);
      setHistory([]);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to reset dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#030712] text-white pl-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-semibold tracking-wider">Syncing Cloud Console...</p>
        </div>
      </div>
    );
  }

  const isDatasetEmpty = !data || data.cost_trends.length === 0;

  if (isDatasetEmpty) {
    return (
      <div className="flex-1 min-h-screen bg-[#030712] text-gray-200 p-8 pl-72 flex flex-col justify-center items-center">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-gray-800 shadow-2xl relative z-10 text-center">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide mb-2">Import Cloud Billing Dataset</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            Please upload a CSV dataset containing your company's AWS cloud resource spend and utilization logs to generate cost optimizations.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {uploadMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium flex items-center gap-2 text-left animate-pulse">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {uploadMessage}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all relative group bg-gray-900/10">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2.5">
                <FileText className="w-10 h-10 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                {file ? (
                  <span className="text-sm text-indigo-300 font-semibold">{file.name}</span>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-gray-300">Click or drag CSV file here</span>
                    <span className="text-xs text-gray-500">Supports standard AWS billing & pricing schemas</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-50 active:scale-98 text-white hover:text-indigo-900 rounded-xl shadow-lg shadow-indigo-600/10 transition-all font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? "Parsing Rows..." : "Analyze Costs Now"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expected CSV Headers (Optional):</p>
            <div className="flex flex-wrap gap-2">
              {['resource_id', 'resource_type', 'resource_name', 'status', 'cost_per_month', 'cpu_utilization'].map((header) => (
                <span key={header} className="text-[10px] font-mono bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-750">
                  {header}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Monthly Cloud Spend',
      value: `$${data?.total_cost?.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/10',
      description: 'Calculated AWS running cost'
    },
    {
      title: 'Active Resources',
      value: data?.active_resources,
      icon: Cpu,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/10',
      description: 'Monitored EC2, EBS & RDS instances'
    },
    {
      title: 'Potential Savings',
      value: `$${data?.estimated_savings?.toFixed(2)}`,
      icon: ShieldAlert,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/10',
      description: 'AI-flagged optimizable waste'
    },
    {
      title: 'Total Realized Savings',
      value: `$${data?.total_saved?.toFixed(2)}`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10',
      description: 'Archived via automated optimization'
    }
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#030712] text-gray-200 p-8 pl-72">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">CostPilot Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Autonomous AWS optimization and cost intelligence hub</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleResetDataset}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 hover:bg-red-500/10 transition rounded-xl text-xs font-semibold text-red-400 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Dataset
          </button>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            Data Loaded Successfully
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`glass-card p-6 rounded-2xl border flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 font-semibold">{card.title}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-gray-800/40">
          <h2 className="text-lg font-bold text-white mb-6">Historical Cost Trends (Past 6 Months)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.cost_trends}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    borderColor: '#374151',
                    borderRadius: '12px',
                    color: 'white'
                  }} 
                />
                <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-gray-800/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Recent Actions Log</h2>
            </div>
            {history.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-gray-500">
                <p className="text-sm">No optimization actions logged yet.</p>
                <p className="text-xs mt-1 text-gray-600">Idle resources will show here after optimization.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="p-3.5 bg-gray-900/40 border border-gray-800/60 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-semibold uppercase rounded-md">
                          {item.resource_type}
                        </span>
                        <span className="text-sm font-semibold text-gray-200">{item.resource_id}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Action: <span className="text-red-400 font-medium">{item.action_taken}</span> by {item.triggered_by.split('@')[0]}
                      </p>
                    </div>
                    <span className="text-emerald-400 font-extrabold text-sm">
                      +${item.savings_amount.toFixed(2)}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
