import { useState } from 'react';

function MemberDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const scaffoldCatalog = [
    { id: 1, title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Computer Science', available: true },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Computer Science', available: false },
    { id: 3, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', available: true },
    { id: 4, title: 'Dune', author: 'Frank Herbert', category: 'Fiction', available: true },
    { id: 5, title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', available: true },
    { id: 6, title: 'Design Patterns', author: 'Erich Gamma', category: 'Computer Science', available: false },
  ];

  const myBooks = [
    { id: 1, title: 'Clean Code', borrowedOn: 'May 1, 2026', due: 'May 15, 2026', status: 'Active' }
  ];

  const displayRole = user?.role === 'TEACHER' ? 'Faculty Member' : 'Student';

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-[#1a3626] text-white flex-col shadow-2xl z-20">
        <div className="p-8 flex flex-col items-center border-b border-emerald-800/50">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-serif mb-4 shadow-lg text-[#1a3626]">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <h3 className="font-bold text-lg tracking-wide text-center">{user?.first_name} {user?.last_name}</h3>
          <p className="text-xs text-emerald-300 mb-2">{displayRole}</p>
          <span className="px-3 py-1 bg-emerald-800/50 text-emerald-100 text-[10px] uppercase tracking-widest font-bold rounded-full border border-emerald-700/50">
            LibTrack Member
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mb-2">Browse</p>
          
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'catalog' ? 'bg-yellow-500 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <span>🔍</span> Library Catalog
          </button>
          
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mt-6 mb-2">My Account</p>
          
          <button 
            onClick={() => setActiveTab('mybooks')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'mybooks' ? 'bg-yellow-500 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}
          >
            <div className="flex items-center gap-3">
              <span>📚</span> My Books
            </div>
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">1</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-stone-200 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">
              {activeTab === 'catalog' && 'Library Catalog'}
              {activeTab === 'mybooks' && 'My Borrowed Books'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.first_name || 'Member'} — {today}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">

          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <input 
                    type="text" 
                    placeholder="Search by title, author, or keyword..." 
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3626]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <button className="px-4 py-2 bg-[#1a3626] text-white text-xs font-bold rounded-lg whitespace-nowrap">All Books</button>
                  <button className="px-4 py-2 bg-stone-100 text-slate-600 hover:bg-stone-200 text-xs font-bold rounded-lg whitespace-nowrap transition-colors">Computer Science</button>
                  <button className="px-4 py-2 bg-stone-100 text-slate-600 hover:bg-stone-200 text-xs font-bold rounded-lg whitespace-nowrap transition-colors">Fiction</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {scaffoldCatalog.map((book) => (
                  <div key={book.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    <div className="h-48 bg-stone-100 flex items-center justify-center p-6 border-b border-stone-100 relative">
                      <div className="w-24 h-32 bg-[#1a3626] rounded shadow-md border-l-4 border-yellow-600 flex items-center justify-center text-center p-2">
                         <span className="text-white/80 font-serif text-xs font-bold leading-tight line-clamp-3">{book.title}</span>
                      </div>

                      <div className="absolute top-3 right-3">
                        {book.available ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">Available</span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-200">Borrowed</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{book.category}</p>
                      <h3 className="font-bold text-slate-900 leading-tight mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-slate-500 mb-4">{book.author}</p>
                      
                      <button className="mt-auto w-full py-2 bg-stone-50 hover:bg-stone-100 text-[#1a3626] text-xs font-bold rounded-lg border border-stone-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'mybooks' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <h3 className="font-serif font-bold text-lg text-slate-900">Currently Borrowed</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6 font-semibold">Book Title</th>
                        <th className="p-4 font-semibold">Date Borrowed</th>
                        <th className="p-4 font-semibold">Due Date</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-stone-100 bg-white">
                      {myBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-900">{book.title}</td>
                          <td className="p-4 text-slate-600">{book.borrowedOn}</td>
                          <td className="p-4 font-semibold text-slate-900">{book.due}</td>
                          <td className="p-4">
                             <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                               {book.status}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default MemberDashboard;