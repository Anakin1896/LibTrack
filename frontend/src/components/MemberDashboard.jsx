import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function MemberDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [books, setBooks] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [reservationStatus, setReservationStatus] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const [pickupDate, setPickupDate] = useState('');
  const [reservationToCancel, setReservationToCancel] = useState(null);

  const notifRef = useRef(null);
  const navigate = useNavigate(); 
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const getFormattedDate = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };
  const minDateStr = getFormattedDate(new Date());
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 3);
  const maxDateStr = getFormattedDate(maxDateObj);

  useEffect(() => {
    if (selectedBook) {
      setPickupDate(minDateStr);
    }
  }, [selectedBook, minDateStr]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      try {
        const booksRes = await api.get('/catalog/books/');
        setBooks(Array.isArray(booksRes.data.results) ? booksRes.data.results : booksRes.data);
      } catch (bookErr) {
        console.error("Failed to load books:", bookErr);
        setBooks([]);
      }

      try {
        const txRes = await api.get('/transactions/');
        const allTx = Array.isArray(txRes.data.results) ? txRes.data.results : txRes.data;
        const userTransactions = allTx.filter(tx => 
          (tx.user && tx.user.id === user?.id) || 
          (tx.member_id === user?.username) || 
          (tx.member_id === user?.member_id)
        );
        setMyTransactions(userTransactions);
      } catch (txErr) {
        console.error("Failed to load transactions:", txErr);
        setMyTransactions([]);
      }
      
      try {
        const notifRes = await api.get('/users/notifications/');
        setNotifications(Array.isArray(notifRes.data.results) ? notifRes.data.results : notifRes.data);
      } catch (notifErr) {
        console.warn("Notifications not ready yet:", notifErr);
        setNotifications([]); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/users/notifications/${id}/`, { is_read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    
    try {
      await api.post(`/transactions/${reservationToCancel.id}/cancel_reservation/`);
      fetchMemberData(); 
    } catch (error) {
      alert(error.response?.data?.detail || "Error cancelling reservation.");
    } finally {
      setReservationToCancel(null); 
    }
  };

  const handleReserveBook = async () => {
    if (!selectedBook) return;
    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    try {
      await api.post('/transactions/', { 
        isbn: selectedBook.isbn,
        expected_pickup_date: pickupDate 
      });
      
      const reservedTitle = selectedBook.title;
      setSelectedBook(null);
      fetchMemberData();
      setReservationStatus({ type: 'success', title: reservedTitle });
      
    } catch (error) {
      setReservationStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || "An unexpected error occurred while reserving the book." 
      });
    }
  };

  const displayRole = user?.role === 'TEACHER' ? 'Faculty Member' : 'Student';
  const activeTxCount = myTransactions.filter(tx => tx.status === 'ACTIVE' || tx.status === 'PENDING').length;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'catalog' ? 'bg-yellow-500 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <span>🔍</span> Library Catalog
          </button>
          
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mt-6 mb-2">My Account</p>
          <button onClick={() => setActiveTab('mybooks')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'mybooks' ? 'bg-yellow-500 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <div className="flex items-center gap-3"><span>📚</span> My Books</div>
            {activeTxCount > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeTxCount}</span>}
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-800/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100/70 hover:text-white hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-semibold text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-stone-200 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">
              {activeTab === 'catalog' && 'Library Catalog'}
              {activeTab === 'mybooks' && 'My Borrowed Books'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.first_name || 'Member'} — {today}</p>
          </div>
          
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-stone-50 hover:bg-stone-100 rounded-full border border-stone-200 transition-colors relative">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute top-14 right-0 w-80 bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-[#1a3626] p-3 px-4 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && <span className="text-xs text-emerald-200">{unreadCount} unread</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">You're all caught up! No new notifications.</div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-4 transition-colors ${notif.is_read ? 'bg-white opacity-60' : 'bg-emerald-50/50 cursor-pointer hover:bg-emerald-50'}`} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                          <div className="flex gap-3">
                            <span className="text-xl shrink-0">{notif.message.includes('Reminder') || notif.message.includes('System Notice') ? '⚠️' : '📩'}</span>
                            <div>
                              <p className={`text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'catalog' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <input type="text" placeholder="Search by title, author, or keyword..." className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3626]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-[#1a3626] text-white text-xs font-bold rounded-lg whitespace-nowrap">All Books</button>
                  <button onClick={() => setSearchQuery('Computer Science')} className="px-4 py-2 bg-stone-100 text-slate-600 hover:bg-stone-200 text-xs font-bold rounded-lg whitespace-nowrap transition-colors">Computer Science</button>
                  <button onClick={() => setSearchQuery('Fiction')} className="px-4 py-2 bg-stone-100 text-slate-600 hover:bg-stone-200 text-xs font-bold rounded-lg whitespace-nowrap transition-colors">Fiction</button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading catalog...</div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No books found matching your search.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => {
                    const isAvailable = (book.active_copies_count ?? (book.copies?.length || 0)) > 0;
                    return (
                      <div key={book.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                        <div className="h-48 bg-stone-100 flex items-center justify-center p-6 border-b border-stone-100 relative">
                          <div className="w-24 h-32 bg-[#1a3626] rounded shadow-md border-l-4 border-yellow-600 flex items-center justify-center text-center p-2">
                            <span className="text-white/80 font-serif text-xs font-bold leading-tight line-clamp-3">{book.title}</span>
                          </div>
                          <div className="absolute top-3 right-3">
                            {isAvailable ? (
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
                          
                          <button onClick={() => setSelectedBook(book)} className="mt-auto w-full py-2 bg-stone-50 hover:bg-stone-100 text-[#1a3626] text-xs font-bold rounded-lg border border-stone-200 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                        <th className="p-4 font-semibold">Due Date</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-stone-100 bg-white">
                      {isLoading ? (
                         <tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading your history...</td></tr>
                      ) : myTransactions.length === 0 ? (
                         <tr><td colSpan="4" className="p-6 text-center text-slate-500">You don't have any borrowed books right now.</td></tr>
                      ) : (
                        myTransactions.map((tx) => {
                          const statusStyle = 
                            tx.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'PENDING' ? 'bg-purple-100 text-purple-800' :
                            tx.status === 'RETURNED' ? 'bg-stone-100 text-stone-500' :
                            tx.status === 'CANCELLED' ? 'bg-stone-200 text-stone-500' :
                            'bg-red-100 text-red-800';

                          return (
                            <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="p-4 pl-6 font-bold text-slate-900">{tx.book_title}</td>
                              <td className="p-4 font-semibold text-slate-900">{new Date(tx.due_date).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-stone-200/50 ${statusStyle}`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-4 text-right pr-6">
                                {tx.status === 'PENDING' && (
                                  <button 
                                    onClick={() => setReservationToCancel(tx)}
                                    className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-100"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
            <div className="bg-[#1a3626] md:w-2/5 p-8 flex flex-col items-center justify-center text-center relative border-r border-[#102418]">
               <div className="w-32 h-44 bg-[#0d1f14] rounded shadow-2xl border-l-4 border-yellow-600 flex items-center justify-center text-center p-4 mb-6">
                 <span className="text-white font-serif text-sm font-bold leading-tight">{selectedBook.title}</span>
               </div>
               <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${selectedBook.active_copies_count > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                 {selectedBook.active_copies_count > 0 ? 'Copies Available' : 'Currently Borrowed Out'}
               </span>
            </div>

            <div className="p-8 md:w-3/5 bg-white flex flex-col relative">
              <button onClick={() => setSelectedBook(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors font-bold">&times;</button>
              
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{selectedBook.category}</p>
                <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-2">{selectedBook.title}</h2>
                <p className="text-sm text-slate-600 mb-6">By <span className="font-bold">{selectedBook.author}</span></p>
                
                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <div className="flex justify-between"><span className="text-xs text-slate-500">ISBN</span><span className="text-xs font-mono font-bold text-slate-800">{selectedBook.isbn}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Published</span><span className="text-xs font-bold text-slate-800">{selectedBook.publication_year || 'Unknown'}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-500">Copies in Library</span><span className="text-xs font-bold text-slate-800">{selectedBook.copies?.length || 0}</span></div>
                </div>
              </div>

              {(selectedBook.active_copies_count ?? (selectedBook.copies?.length || 0)) > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Expected Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    min={minDateStr} 
                    max={maxDateStr}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626] text-sm text-slate-700 font-medium cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 italic">Note: Reservations automatically expire if not picked up by this date.</p>
                </div>
              )}

              <div className="mt-auto flex gap-3">
                <button onClick={() => setSelectedBook(null)} className="w-1/3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-stone-200">Cancel</button>
                <button 
                  onClick={handleReserveBook}
                  disabled={(selectedBook.active_copies_count ?? (selectedBook.copies?.length || 0)) === 0}
                  className={`w-2/3 px-4 py-3 rounded-xl font-bold shadow-md transition-all ${
                    (selectedBook.active_copies_count ?? (selectedBook.copies?.length || 0)) > 0 
                    ? 'bg-[#1a3626] text-white hover:bg-[#0f2117]' 
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {(selectedBook.active_copies_count ?? (selectedBook.copies?.length || 0)) > 0 ? 'Confirm Reserve' : 'Not Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reservationToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
              ⚠️
            </div>
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Cancel Reservation?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to cancel your reservation for <br/>
              <strong className="text-slate-800">"{reservationToCancel.book_title}"</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setReservationToCancel(null)} 
                className="px-6 py-3 rounded-xl font-bold text-slate-600 w-1/2 hover:bg-slate-100 transition-colors border border-stone-200"
              >
                Keep It
              </button>
              <button 
                onClick={confirmCancelReservation} 
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold w-1/2 hover:bg-red-700 transition-colors shadow-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {reservationStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-8 text-center flex flex-col items-center">
            
            {reservationStatus.type === 'success' ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
                  🎉
                </div>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mb-2">Reservation Successful!</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  <strong>"{reservationStatus.title}"</strong> is now pending. Please visit the library desk to pick it up on your selected date.
                </p>
                <button
                  onClick={() => {
                    setReservationStatus(null);
                    setActiveTab('mybooks');
                  }}
                  className="w-full bg-[#1a3626] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f2117] transition-colors shadow-md"
                >
                  View in My Books
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
                  ⚠️
                </div>
                <h3 className="font-serif font-bold text-2xl text-slate-900 mb-2">Reservation Failed</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  {reservationStatus.message}
                </p>
                <button
                  onClick={() => setReservationStatus(null)}
                  className="w-full bg-stone-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;