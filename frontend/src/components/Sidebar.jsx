import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, Lightbulb, LogOut, Terminal } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = localStorage.getItem('email') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AWS Resources', path: '/resources', icon: Server },
    { name: 'AI Insights', path: '/recommendations', icon: Lightbulb },
  ];

  return (
    <div className="w-64 h-screen glass-panel text-gray-300 flex flex-col justify-between p-6 fixed left-0 top-0 z-50">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-wider">CostPilot</h1>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">AWS Optimizer</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border-l-4 border-indigo-500'
                    : 'hover:bg-gray-800/40 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-indigo-300'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-800/60 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="truncate pr-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Logged In As</p>
            <p className="text-sm font-semibold text-gray-200 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-semibold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
