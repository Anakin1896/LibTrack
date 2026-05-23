import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ProfileTab from './Profile';
import InventoryTab from './Inventory';
import TransactionsTab from './Transactions';
import MembersTab from './Members';
import ReportsTab from './Reports';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const todayDate = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedToday = todayDate.toLocaleDateString('en-US', options);

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [dashboardModal, setDashboardModal] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const response = await api.get('/catalog/books/');
      setBooks(Array.isArray(response.data.results ? response.data.results : response.data) ? (response.data.results ? response.data.results : response.data) : []);
    } catch (error) { 
      setBooks([]);
    } finally { 
      setIsLoadingBooks(false); 
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const response = await api.get('/transactions/');
      setTransactions(Array.isArray(response.data.results ? response.data.results : response.data) ? (response.data.results ? response.data.results : response.data) : []);
    } catch (error) { 
      setTransactions([]);
    } finally { 
      setIsLoadingTx(false); 
    }
  };

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await api.get('/users/');
      setMembers(Array.isArray(response.data.results ? response.data.results : response.data) ? (response.data.results ? response.data.results : response.data) : []);
    } catch (error) { 
      setMembers([]);
    } finally { 
      setIsLoadingMembers(false); 
    }
  };

  useEffect(() => {
    fetchBooks(); fetchTransactions(); fetchMembers();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleResolveFromModal = async (transactionId) => {
    if (!window.confirm("Has the student settled the penalty for this lost book?")) return;
    
    try {
      await api.patch(`/transactions/${transactionId}/`, { status: 'RESOLVED' });
      showNotification("Lost book penalty resolved.", "success");
      
      fetchTransactions(); 
      fetchBooks();

      setDashboardModal(prev => ({
        ...prev,
        data: prev.data.filter(item => item.id !== transactionId)
      }));
      
    } catch (error) {
      showNotification("Error resolving transaction.", "error");
    }
  };

  const totalBooksCount = books.reduce((sum, book) => sum + (book.active_copies_count ?? (book.copies?.length || 0)), 0);
  const activeCheckouts = transactions.filter(tx => tx.status === 'ACTIVE');
  const pendingRequests = transactions.filter(tx => tx.status === 'PENDING');
  
  const activeMembersCount = members.length;
  const overdueBooks = activeCheckouts.filter(tx => {
    const diffDays = Math.ceil((new Date(tx.due_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  });
  const lostBooks = transactions.filter(tx => tx.status === 'LOST');
  const attentionCount = overdueBooks.length + lostBooks.length;

  const totalActionItems = pendingRequests.length + overdueBooks.length;
  const recentBooks = [...books].reverse().slice(0, 4);
  const recentTx = [...transactions].reverse().slice(0, 5);

  const getDueStatus = (dueDate) => {
    const diffDays = Math.ceil((new Date(dueDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, style: 'text-red-700 bg-red-50' };
    if (diffDays === 0) return { text: 'Due today', style: 'text-orange-700 bg-orange-50' };
    if (diffDays === 1) return { text: 'Due tomorrow', style: 'text-orange-700 bg-orange-50' };
    return { text: `Due in ${diffDays} days`, style: 'text-stone-600 bg-stone-100' };
  };

  const attentionList = activeCheckouts
    .filter(tx => {
      const diffDays = Math.ceil((new Date(tx.due_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      return diffDays <= 3; 
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const getSearchResults = () => {
    if (!globalSearchQuery.trim()) return null;
    const query = globalSearchQuery.toLowerCase();
    const matchedBooks = books.filter(b => 
      b.title.toLowerCase().includes(query) || 
      b.author.toLowerCase().includes(query) || 
      b.isbn.includes(query)
    ).slice(0, 3);
    const matchedMembers = members.filter(m => 
      m.first_name.toLowerCase().includes(query) || 
      m.last_name.toLowerCase().includes(query) || 
      m.username.toLowerCase().includes(query)
    ).slice(0, 3);
    const matchedTx = transactions.filter(tx => {
      const borrowerName = tx.user?.first_name ? `${tx.user.first_name} ${tx.user.last_name}` : (tx.user?.username || tx.member_id || '');
      return tx.book_title.toLowerCase().includes(query) || borrowerName.toLowerCase().includes(query);
    }).slice(0, 3);
    return { books: matchedBooks, members: matchedMembers, transactions: matchedTx };
  };

  const searchResults = getSearchResults();
  const hasResults = searchResults && (searchResults.books.length > 0 || searchResults.members.length > 0 || searchResults.transactions.length > 0);

  return (
    <div className="flex h-screen bg-[#F9F9F9] font-sans overflow-hidden relative">
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span><p className="font-bold text-sm">{notification.message}</p>
        </div>
      )}

      {dashboardModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center shrink-0">
              <h3 className="font-serif font-bold text-lg text-white">{dashboardModal.title}</h3>
              <button onClick={() => setDashboardModal(null)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            
            <div className="overflow-y-auto p-0 flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider sticky top-0 border-b border-stone-200 shadow-sm z-10">
                  <tr>
                    {dashboardModal.type === 'books' && (
                      <><th className="p-4 pl-6 font-semibold">Title</th><th className="p-4 font-semibold">Author</th><th className="p-4 font-semibold text-right pr-6">Copies</th></>
                    )}
                    {(dashboardModal.type === 'borrowed' || dashboardModal.type === 'attention') && (
                      <><th className="p-4 pl-6 font-semibold">Borrower ID</th><th className="p-4 font-semibold">Book Title</th><th className="p-4 font-semibold">Due Date</th><th className="p-4 font-semibold text-right pr-6">Status / Action</th></>
                    )}
                    {dashboardModal.type === 'members' && (
                      <><th className="p-4 pl-6 font-semibold">ID Number</th><th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold text-right pr-6">Role</th></>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-stone-100 bg-white">
                  {dashboardModal.data.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-400">No records found.</td></tr>
                  ) : (
                    dashboardModal.data.map((item, idx) => {
                      const isOverdue = item.due_date ? Math.ceil((new Date(item.due_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) < 0 : false;
                      
                      return (
                      <tr key={idx} className="hover:bg-stone-50 transition-colors">
                        {dashboardModal.type === 'books' && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.title}</td><td className="p-4 text-slate-600">{item.author}</td><td className="p-4 text-right pr-6 font-bold text-emerald-700">{item.active_copies_count ?? (item.copies?.length || 0)}</td></>
                        )}
                        {(dashboardModal.type === 'borrowed' || dashboardModal.type === 'attention') && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.user?.username || item.member_id}</td><td className="p-4 text-slate-600">{item.book_title}</td><td className="p-4">{new Date(item.due_date).toLocaleDateString()}</td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${item.status === 'LOST' ? 'bg-slate-800 text-white border-slate-900' : isOverdue ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                                {item.status === 'LOST' ? 'Lost' : isOverdue ? 'Overdue' : 'Active'}
                              </span>
                              
                              {item.status === 'LOST' && dashboardModal.type === 'attention' && (
                                <button 
                                  onClick={() => handleResolveFromModal(item.id)}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-[10px] font-bold transition-colors border border-blue-200 ml-2"
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td></>
                        )}
                        {dashboardModal.type === 'members' && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.username}</td><td className="p-4 text-slate-600">{item.first_name} {item.last_name}</td><td className="p-4 text-right pr-6 text-xs font-bold text-slate-500">{item.role || 'STUDENT'}</td></>
                        )}
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 text-right shrink-0">
               <button onClick={() => setDashboardModal(null)} className="px-6 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-stone-100">Close</button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-65 bg-[#14291c] text-white flex-col z-20">
        <div className="p-8 pt-10 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#e6a83a] rounded-full flex items-center justify-center text-2xl font-serif mb-3 text-[#14291c]">{user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}</div>
          <h3 className="font-bold text-base tracking-wide">{user?.first_name} {user?.last_name}</h3>
          <p className="text-[11px] text-emerald-400 mb-2">{user?.role === 'ADMIN' ? 'Library Administrator' : 'Librarian'}</p>
          <span className="px-3 py-1 bg-yellow-600/20 text-[#e6a83a] text-[9px] uppercase tracking-widest font-bold rounded-full border border-yellow-600/30">✦ {user?.role || 'Admin'}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mb-3">Main</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'dashboard' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}><span>⊞</span> Dashboard</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'profile' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}><span>👤</span> Profile</button>
          
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mt-6 mb-3">Library</p>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'inventory' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}><span>📚</span> Add / View Books</button>

          <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'transactions' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <div className="flex items-center gap-3"><span>🔄</span> Issue Book</div>
            {totalActionItems > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 min-w-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                {totalActionItems}
              </span>
            )}
          </button>

          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mt-6 mb-3">System</p>
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'members' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}><span>👥</span> Members</button>

          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mt-6 mb-3">Reports</p>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'reports' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <span>📊</span> Generate Reports
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800/50 pt-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100/50 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-left font-medium text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F9F9F9]">
        <header className="bg-[#F9F9F9] px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-30 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'inventory' && 'Library Inventory'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'members' && 'Member Directory'}
              {activeTab === 'reports' && 'Library Reports'}
            </h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.first_name || user?.username} — {formattedToday}</p>
          </div>

          <div className="flex items-center gap-4 relative">
             <div className="relative">
               <span className="absolute left-3 top-2 text-stone-400 text-sm">🔍</span>
               <input 
                 type="text" 
                 placeholder="Search anything..." 
                 className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#14291c] w-64 shadow-sm transition-all focus:w-80" 
                 value={globalSearchQuery}
                 onChange={(e) => setGlobalSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
               />

               {isSearchFocused && globalSearchQuery.trim() && (
                 <div className="absolute top-12 right-0 w-96 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                   {hasResults ? (
                     <div className="max-h-96 overflow-y-auto">
                       {searchResults.books.length > 0 && (
                         <div className="p-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">Books</p>
                           {searchResults.books.map(book => (
                             <button key={`search-book-${book.id}`} onClick={() => { setActiveTab('inventory'); setGlobalSearchQuery(''); }} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg flex justify-between items-center group">
                               <div>
                                 <p className="text-sm font-bold text-slate-800 group-hover:text-[#14291c] truncate w-64">{book.title}</p>
                                 <p className="text-[11px] text-slate-500">{book.author}</p>
                               </div>
                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${book.active_copies_count > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{book.active_copies_count > 0 ? 'Avail' : 'Out'}</span>
                             </button>
                           ))}
                         </div>
                       )}

                       {searchResults.members.length > 0 && (
                         <div className="p-2 border-t border-stone-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">Members</p>
                           {searchResults.members.map(member => (
                             <button key={`search-member-${member.id}`} onClick={() => { setActiveTab('members'); setGlobalSearchQuery(''); }} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg flex justify-between items-center group">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{member.first_name.charAt(0)}</div>
                                 <div>
                                   <p className="text-sm font-bold text-slate-800 group-hover:text-[#14291c]">{member.first_name} {member.last_name}</p>
                                   <p className="text-[11px] text-slate-500 font-mono">{member.username}</p>
                                 </div>
                               </div>
                               <span className="text-[10px] text-slate-400 uppercase">{member.role}</span>
                             </button>
                           ))}
                         </div>
                       )}

                       {searchResults.transactions.length > 0 && (
                         <div className="p-2 border-t border-stone-100">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">Active Checkouts</p>
                           {searchResults.transactions.map(tx => {
                             const isOverdue = tx.due_date ? Math.ceil((new Date(tx.due_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) < 0 : false;
                             return (
                             <button key={`search-tx-${tx.id}`} onClick={() => { setActiveTab('transactions'); setGlobalSearchQuery(''); }} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg flex justify-between items-center group">
                               <div>
                                 <p className="text-sm font-bold text-slate-800 group-hover:text-[#14291c] truncate w-56">{tx.book_title}</p>
                                 <p className="text-[11px] text-slate-500">Borrowed by: {tx.user?.username || tx.member_id}</p>
                               </div>
                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-600'}`}>{isOverdue ? 'Overdue' : tx.status}</span>
                             </button>
                           )})}
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="p-8 text-center text-slate-500 text-sm">
                       No matches found for "{globalSearchQuery}"
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          
          {activeTab === 'profile' && <ProfileTab user={user} showNotification={showNotification} />}
          {activeTab === 'members' && <MembersTab members={members} isLoadingMembers={isLoadingMembers} fetchMembers={fetchMembers} showNotification={showNotification} />}
          {activeTab === 'inventory' && <InventoryTab books={books} isLoadingBooks={isLoadingBooks} fetchBooks={fetchBooks} showNotification={showNotification} />}
          {activeTab === 'transactions' && <TransactionsTab transactions={transactions} isLoadingTx={isLoadingTx} fetchTransactions={fetchTransactions} fetchBooks={fetchBooks} showNotification={showNotification} books={books} members={members} />}
          {activeTab === 'reports' && <ReportsTab books={books} transactions={transactions} user={user} />}
          
          {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div onClick={() => setDashboardModal({ title: 'Full Library Inventory', type: 'books', data: books })} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-4 border-t-emerald-700 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
                   <div className="flex items-start justify-between mb-2"><span className="text-2xl opacity-80">📚</span></div>
                   <div><h3 className="text-4xl font-bold text-slate-900 mb-1">{totalBooksCount}</h3><p className="text-xs text-slate-500 font-medium">Total Books</p></div>
                 </div>
                 
                 <div onClick={() => setDashboardModal({ title: 'Currently Borrowed Books', type: 'borrowed', data: activeCheckouts })} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-4 border-t-[#e6a83a] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
                   <div className="flex items-start justify-between mb-2"><span className="text-2xl opacity-80 text-blue-500">🔄</span></div>
                   <div><h3 className="text-4xl font-bold text-slate-900 mb-1">{activeCheckouts.length}</h3><p className="text-xs text-slate-500 font-medium">Currently Borrowed</p></div>
                 </div>
                 
                 <div onClick={() => setDashboardModal({ title: 'Registered Members', type: 'members', data: members })} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-4 border-t-indigo-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
                   <div className="flex items-start justify-between mb-2"><span className="text-2xl opacity-80">👥</span></div>
                   <div><h3 className="text-4xl font-bold text-slate-900 mb-1">{activeMembersCount > 0 ? activeMembersCount : '...'}</h3><p className="text-xs text-slate-500 font-medium">Active Members</p></div>
                 </div>

                 <div onClick={() => setDashboardModal({ title: 'Needs Attention (Overdue / Lost)', type: 'attention', data: [...overdueBooks, ...lostBooks] })} className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-4 border-t-red-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
                   <div className="flex items-start justify-between mb-2"><span className="text-2xl opacity-80 text-orange-500">⚠️</span></div>
                   <div><h3 className="text-4xl font-bold text-slate-900 mb-1">{attentionCount}</h3><p className="text-xs text-slate-500 font-medium">Needs Attention</p></div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                     <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-slate-900">Recently Added Books</h3>
                        <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors">View all →</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead><tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-stone-100"><th className="pb-3 font-semibold">Book</th><th className="pb-3 font-semibold text-right">Status</th></tr></thead>
                          <tbody className="divide-y divide-stone-50">
                            {recentBooks.map(book => (
                               <tr key={book.id}>
                                 <td className="py-4 flex items-center gap-3">
                                   <div className={`w-8 h-10 rounded shadow-sm shrink-0 ${book.active_copies_count > 0 ? 'bg-emerald-100' : 'bg-red-50'}`}></div>
                                   <div><p className="text-sm font-bold text-slate-800">{book.title}</p><p className="text-[11px] text-slate-400">{book.author}</p></div>
                                 </td>
                                 <td className="py-4 text-right">
                                   <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${book.active_copies_count > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{book.active_copies_count > 0 ? '● Available' : '● Unavailable'}</span>
                                 </td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-slate-900">Recent Activity</h3>
                        <button onClick={() => setActiveTab('transactions')} className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors">See all</button>
                      </div>
                      <div className="space-y-4">
                         {recentTx.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                         ) : (
                            recentTx.map(tx => {
                               const borrowerName = tx.user?.first_name ? `${tx.user.first_name} ${tx.user.last_name}` : (tx.user?.username || tx.member_id || 'Unknown');
                               let actionText = '';
                               let icon = '';
                               let iconColor = '';
                               
                               if (tx.status === 'RETURNED') { actionText = 'returned'; icon = '📥'; iconColor = 'bg-blue-50 text-blue-500'; }
                               else if (tx.status === 'ACTIVE') { actionText = 'borrowed'; icon = '📤'; iconColor = 'bg-emerald-50 text-emerald-500'; }
                               else if (tx.status === 'LOST') { actionText = 'reported lost'; icon = '⚠️'; iconColor = 'bg-red-50 text-red-500'; }
                               else if (tx.status === 'RESOLVED') { actionText = 'settled penalty for'; icon = '✅'; iconColor = 'bg-emerald-50 text-emerald-500'; }
                               else if (tx.status === 'PENDING') { actionText = 'requested'; icon = '⏳'; iconColor = 'bg-purple-50 text-purple-500'; }
                               else { actionText = 'updated'; icon = '📝'; iconColor = 'bg-stone-50 text-stone-500'; }

                               return (
                                 <div key={`activity-${tx.id}`} className="flex gap-4 items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${iconColor}`}>{icon}</div>
                                    <div>
                                      <p className="text-sm text-slate-700"><span className="font-bold">{borrowerName}</span> {actionText} <span className="font-bold">{tx.book_title}</span></p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(tx.reservation_date || tx.due_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                               )
                            })
                         )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <h3 className="font-serif font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setActiveTab('inventory')} className="py-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors">
                           <span className="text-xl text-indigo-500">➕</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Add Book</span>
                         </button>
                         <button onClick={() => setActiveTab('transactions')} className="py-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors">
                           <span className="text-xl text-blue-500">🔄</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Issue Book</span>
                         </button>
                         <button onClick={() => setActiveTab('transactions')} className="py-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors">
                           <span className="text-xl text-emerald-500">📥</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Return Book</span>
                         </button>
                         <button onClick={() => setActiveTab('members')} className="py-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors">
                           <span className="text-xl text-purple-500">👤</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Members</span>
                         </button>
                      </div>
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