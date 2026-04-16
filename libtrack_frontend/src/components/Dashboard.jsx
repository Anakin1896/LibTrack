import React from 'react';
import { LayoutDashboard, Book, Clock, Settings, LogOut, Bell, Calendar, Search, Plus, ArchiveRestore } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">J</div>
            <div>
              <p className="font-semibold text-white text-sm">Juan Dela Cruz</p>
              <p className="text-xs text-slate-400">@admin</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={Book} label="Add / View Books" />
            <NavItem icon={Clock} label="Borrowed / Pending" badge="5" />
            <NavItem icon={Settings} label="Settings" />
          </nav>
        </div>

        <div className="p-6">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Ana — Thursday, April 16, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search books, members..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" 
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
              <Calendar size={20} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Books" value="2,418" subtext="+12 Added this week" icon={Book} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard title="Active Members" value="84" subtext="+6 new today" icon={Users} color="text-blue-500" bg="bg-blue-50" />
          <StatCard title="Currently Borrowed" value="342" subtext="+6 registered" icon={ArchiveRestore} color="text-indigo-500" bg="bg-indigo-50" />
          <StatCard title="Overdue Books" value="7" subtext="+2 from yesterday" icon={Clock} color="text-rose-500" bg="bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Recently Added Books</h2>
                <a href="#" className="text-sm font-medium text-indigo-600">View all &gt;</a>
              </div>
              <div className="space-y-4">
                <BookRow title="The Midnight Library" author="Matt Haig" category="Fiction" status="Available" />
                <BookRow title="Atomic Habits" author="James Clear" category="Self-help" status="Borrowed" />
                <BookRow title="Sapiens" author="Yuval Noah Harari" category="History" status="Available" />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <a href="#" className="text-sm font-medium text-indigo-600">See all</a>
              </div>
              <div className="space-y-6">
                <ActivityItem action="Joan Diaz Cruz returned Atomic Habits" time="2 minutes ago" type="return" />
                <ActivityItem action="Mario Santos borrowed Sapiens" time="12 minutes ago" type="borrow" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h2>
               <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
                    <Plus size={24} className="mb-2 text-indigo-500" />
                    <span className="text-sm font-medium">Add Book</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
                    <ArchiveRestore size={24} className="mb-2 text-indigo-500" />
                    <span className="text-sm font-medium">Record Borrow</span>
                  </button>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, badge }) => (
  <a href="#" className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
    <div className="flex items-center gap-3 text-sm font-medium">
      <Icon size={18} /> {label}
    </div>
    {badge && <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}
  </a>
);

const StatCard = ({ title, value, subtext, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center mb-4`}>
      <Icon size={20} />
    </div>
    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{subtext}</p>
  </div>
);

const BookRow = ({ title, author, category, status }) => {
  const statusStyles = {
    Available: "bg-emerald-50 text-emerald-700",
    Borrowed: "bg-amber-50 text-amber-700",
    Overdue: "bg-rose-50 text-rose-700",
    Processing: "bg-blue-50 text-blue-700"
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-l-4 border-indigo-500">
      <div className="flex-1 ml-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{author}</p>
      </div>
      <div className="w-32 text-sm text-slate-600 hidden sm:block">{category}</div>
      <div className="w-24 text-right">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
      </div>
    </div>
  );
};

const ActivityItem = ({ action, time, type }) => (
  <div className="flex gap-4">
    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${type === 'return' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
    <div>
      <p className="text-sm text-slate-700 leading-snug">{action}</p>
      <p className="text-xs text-slate-400 mt-1">{time}</p>
    </div>
  </div>
);

export default Dashboard;