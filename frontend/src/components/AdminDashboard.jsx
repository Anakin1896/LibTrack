import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleLogout = () => {

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    navigate('/login');
  };

  const scaffoldBooks = [
    { id: 1, title: 'The Pragmatic Programmer', isbn: '978-0135957059', author: 'David Thomas', copies: 3, available: 2 },
    { id: 2, title: 'Clean Code', isbn: '978-0132350884', author: 'Robert C. Martin', copies: 5, available: 0 },
  ];

  const scaffoldTransactions = [
    { id: 1, user: 'Ian Espeso', book: 'Clean Code', due: 'May 5, 2026', status: 'Active' },
    { id: 2, user: 'Prince Doe', book: 'Design Patterns', due: 'May 1, 2026', status: 'Overdue' },
  ];

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans overflow-hidden">

      <aside className="hidden lg:flex w-64 bg-[#1a3626] text-white flex-col shadow-2xl z-20">
        <div className="p-8 flex flex-col items-center border-b border-emerald-800/50">
          <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center text-3xl font-serif mb-4 shadow-lg text-[#1a3626]">
            {user?.first_name?.charAt(0) || 'A'}
          </div>
          <h3 className="font-bold text-lg tracking-wide">{user?.first_name} {user?.last_name}</h3>
          <p className="text-xs text-emerald-300 mb-2">Library Administrator</p>
          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-500 text-[10px] uppercase tracking-widest font-bold rounded-full border border-yellow-600/30">
            ✦ Admin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mb-2">Main</p>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <span>⊞</span> Dashboard
          </button>
          
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mt-6 mb-2">Library</p>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <span>📚</span> Add / View Books
          </button>

          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <div className="flex items-center gap-3">
              <span>🔄</span> Transactions
            </div>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">5</span>
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100/70 hover:text-white hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-semibold text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-stone-200 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'inventory' && 'Library Inventory'}
              {activeTab === 'transactions' && 'Borrow & Return'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{today}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border-t-4 border-[#1a3626] shadow-sm flex flex-col justify-between">
                  <span className="text-2xl mb-2">📚</span>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">2,418</h3>
                    <p className="text-sm text-slate-500">Total Books</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-t-4 border-yellow-500 shadow-sm flex flex-col justify-between">
                  <span className="text-2xl mb-2">🔄</span>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">84</h3>
                    <p className="text-sm text-slate-500">Currently Borrowed</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500 shadow-sm flex flex-col justify-between">
                  <span className="text-2xl mb-2">👥</span>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">342</h3>
                    <p className="text-sm text-slate-500">Active Members</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center h-64 text-slate-400">
                  <p>Dashboard Activity Feed UI</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                 <h3 className="font-serif font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveTab('inventory')} className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2">
                      <span className="text-xl">➕</span><span className="text-xs font-bold text-slate-700">Add Book</span>
                    </button>
                    <button onClick={() => setActiveTab('transactions')} className="p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2">
                      <span className="text-xl">🔄</span><span className="text-xs font-bold text-slate-700">Transactions</span>
                    </button>
                 </div>
               </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="bg-[#1a3626] p-4 px-6 border-b border-emerald-800">
                  <h3 className="font-serif font-bold text-lg text-white">Register New Book</h3>
                </div>
                <form className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Book Title</label>
                    <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="e.g. The Great Gatsby" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN</label>
                    <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="978-3-16-148410-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label>
                    <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Author Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]">
                      <option>Computer Science</option><option>Fiction</option><option>Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Copies</label>
                    <input type="number" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" defaultValue="1" min="1" />
                  </div>
                  <div className="md:col-span-3 flex justify-end mt-2">
                    <button type="button" className="bg-[#1a3626] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#12261a] transition-all shadow-md">
                      Save Book to Catalog
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <h3 className="font-serif font-bold text-lg text-slate-900">Full Catalog</h3>
                  <div className="relative">
                    <input type="text" placeholder="Search title or ISBN..." className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#1a3626]" />
                    <span className="absolute left-3 top-2 text-slate-400">🔍</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6 font-semibold">Title & ISBN</th>
                        <th className="p-4 font-semibold">Author</th>
                        <th className="p-4 font-semibold">Copies (Avail)</th>
                        <th className="p-4 font-semibold text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-stone-100 bg-white">
                      {scaffoldBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-bold text-slate-900">{book.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ISBN: {book.isbn}</p>
                          </td>
                          <td className="p-4 text-slate-600">{book.author}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">{book.copies}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${book.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {book.available} avail
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button className="text-[#1a3626] font-bold text-sm hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="bg-[#1a3626] p-4 border-b border-emerald-800">
                    <h3 className="font-serif font-bold text-lg text-white">Issue Book</h3>
                  </div>
                  <form className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student / Teacher ID</label>
                      <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Scan or type ID..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book ISBN</label>
                      <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Scan or type ISBN..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                      <input type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" />
                    </div>
                    <button type="button" className="w-full bg-[#1a3626] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#12261a] transition-all shadow-md mt-4">
                      Confirm Issue
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                    <h3 className="font-serif font-bold text-lg text-slate-900">Active Borrowings</h3>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                          <th className="p-4 pl-6 font-semibold">Borrower</th>
                          <th className="p-4 font-semibold">Book Title</th>
                          <th className="p-4 font-semibold">Due Date</th>
                          <th className="p-4 font-semibold text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-stone-100 bg-white">
                        {scaffoldTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-900">{tx.user}</td>
                            <td className="p-4 text-slate-600">{tx.book}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-md font-bold ${tx.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {tx.due}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <button className="bg-stone-100 text-slate-700 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                Return
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;