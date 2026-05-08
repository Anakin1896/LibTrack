import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  const todayDate = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedToday = todayDate.toLocaleDateString('en-US', options);

  const [notification, setNotification] = useState(null);
  
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
  const [copiesToCreate, setCopiesToCreate] = useState('1'); 
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [addingCopiesToBook, setAddingCopiesToBook] = useState(null);
  const [extraCopiesCount, setExtraCopiesCount] = useState('1');

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [txFilter, setTxFilter] = useState('active'); 
  const [newTx, setNewTx] = useState({
    member_id: '',
    isbn: '',
    due_date: ''
  });

  const [transactionToMarkLost, setTransactionToMarkLost] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [dashboardModal, setDashboardModal] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const response = await api.get('/catalog/books/');
      const data = response.data.results ? response.data.results : response.data;
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setBooks([]); 
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const response = await api.get('/transactions/'); 
      const data = response.data.results ? response.data.results : response.data;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]); 
    } finally {
      setIsLoadingTx(false);
    }
  };

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await api.get('/users/'); 
      const data = response.data.results ? response.data.results : response.data;
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]); 
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchBooks();
      fetchTransactions();
      fetchMembers();
    }
    if (activeTab === 'inventory') fetchBooks();
    if (activeTab === 'transactions') {
      fetchTransactions();
      fetchBooks();
    }
    if (activeTab === 'members') fetchMembers();
  }, [activeTab]);

  const handleAddExtraCopies = async (e) => {
    e.preventDefault();
    const count = parseInt(extraCopiesCount, 10) || 0;
    try {
      for (let i = 0; i < count; i++) {
        await api.post('/catalog/copies/', {
          book: addingCopiesToBook.id,
          status: 'AVAILABLE'
        });
      }
      showNotification(`Successfully added ${count} new copies!`, "success");
      fetchBooks();
      setAddingCopiesToBook(null);
      setExtraCopiesCount('1');
    } catch (error) {
      showNotification("Error adding copies.", "error");
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const bookResponse = await api.post('/catalog/books/', newBook);
      const createdBookId = bookResponse.data.id;
      const copies = parseInt(copiesToCreate, 10) || 1;
      for (let i = 0; i < copies; i++) {
        await api.post('/catalog/copies/', { book: createdBookId, status: 'AVAILABLE' });
      }
      fetchBooks();
      setNewBook({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
      setCopiesToCreate('1');
      showNotification("Book and copies successfully added to catalog!", "success");
    } catch (error) {
      showNotification("Error saving book. Please check your inputs.", "error");
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/catalog/books/${editingBook.id}/`, editingBook);
      fetchBooks(); 
      setEditingBook(null); 
      showNotification("Book details updated successfully!", "success");
    } catch (error) {
      showNotification("Error updating book.", "error");
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await api.delete(`/catalog/books/${bookToDelete.id}/`);
      fetchBooks();
      showNotification(`"${bookToDelete.title}" and all copies deleted.`, "success");
    } catch (error) {
      showNotification("Error deleting book.", "error");
    } finally {
      setBookToDelete(null);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/', newTx);
      showNotification("Book successfully issued!", "success");
      setNewTx({ member_id: '', isbn: '', due_date: '' }); 
      fetchTransactions(); 
      if (activeTab === 'transactions') fetchBooks(); 
    } catch (error) {
      console.error("Failed to issue book:", error.response?.data);
      showNotification(error.response?.data?.detail || "Error issuing book. Check ID/ISBN.", "error");
    }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      await api.patch(`/transactions/${transactionId}/`, {
        status: 'RETURNED',
        return_date: new Date().toISOString() 
      });
      showNotification("Book returned successfully!", "success");
      fetchTransactions();
      fetchBooks(); 
    } catch (error) {
      console.error("Failed to return book:", error);
      showNotification("Error returning book.", "error");
    }
  };

  const confirmMarkLost = async () => {
    if (!transactionToMarkLost) return;
    try {
      await api.patch(`/transactions/${transactionToMarkLost.id}/`, {
        status: 'LOST'
      });
      showNotification("Book marked as lost.", "error"); 
      fetchTransactions();
      fetchBooks(); 
    } catch (error) {
      console.error("Failed to mark book as lost:", error);
      showNotification("Error updating status.", "error");
    } finally {
      setTransactionToMarkLost(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const isTxOverdue = (tx) => {
    if (tx.status === 'RETURNED' || tx.status === 'LOST') return false;
    const dueDate = new Date(tx.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return (dueDate - today) < 0;
  };

  const getTxStatus = (tx) => {
    if (tx.status === 'LOST') return { text: 'Lost', style: 'bg-slate-800 text-white border-slate-900' };
    if (tx.status === 'RETURNED') {
      if (tx.return_date && new Date(tx.return_date) > new Date(tx.due_date)) {
         return { text: 'Returned Late', style: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      }
      return { text: 'Returned', style: 'bg-stone-100 text-stone-600 border-stone-200' };
    }
    
    const dueDate = new Date(tx.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', style: 'bg-red-100 text-red-800 border-red-200' };
    if (diffDays <= 3) return { text: 'Due Soon', style: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { text: 'Active', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const displayedTransactions = transactions.filter(tx => {
    if (txFilter === 'active') return tx.status === 'ACTIVE';
    return true; 
  });

  const totalBooksCount = books.reduce((sum, book) => sum + (book.active_copies_count ?? (book.copies?.length || 0)), 0);
  const activeCheckouts = transactions.filter(tx => tx.status === 'ACTIVE');
  const activeMembersCount = members.length;
  
  const overdueBooks = activeCheckouts.filter(tx => isTxOverdue(tx));
  const lostBooks = transactions.filter(tx => tx.status === 'LOST');
  const attentionCount = overdueBooks.length + lostBooks.length;

  const recentBooks = [...books].reverse().slice(0, 4);
  const recentTx = [...transactions].reverse().slice(0, 5);

  return (
    <div className="flex h-screen bg-[#F9F9F9] font-sans overflow-hidden relative">

      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-bold text-sm">{notification.message}</p>
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
                      <><th className="p-4 pl-6 font-semibold">Borrower</th><th className="p-4 font-semibold">Book Title</th><th className="p-4 font-semibold">Due Date</th><th className="p-4 font-semibold text-right pr-6">Status</th></>
                    )}
                    {dashboardModal.type === 'members' && (
                      <><th className="p-4 pl-6 font-semibold">ID</th><th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold text-right pr-6">Role</th></>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-stone-100 bg-white">
                  {dashboardModal.data.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-400">No records found.</td></tr>
                  ) : (
                    dashboardModal.data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50 transition-colors">
                        
                        {dashboardModal.type === 'books' && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.title}</td><td className="p-4 text-slate-600">{item.author}</td><td className="p-4 text-right pr-6 font-bold text-emerald-700">{item.active_copies_count ?? (item.copies?.length || 0)}</td></>
                        )}
                        
                        {(dashboardModal.type === 'borrowed' || dashboardModal.type === 'attention') && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.user?.username || item.member_id}</td><td className="p-4 text-slate-600">{item.book_title}</td><td className="p-4">{new Date(item.due_date).toLocaleDateString()}</td>
                          <td className="p-4 text-right pr-6"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${getTxStatus(item).style}`}>{getTxStatus(item).text}</span></td></>
                        )}

                        {dashboardModal.type === 'members' && (
                          <><td className="p-4 pl-6 font-bold text-slate-900">{item.username}</td><td className="p-4 text-slate-600">{item.first_name} {item.last_name}</td><td className="p-4 text-right pr-6 text-xs font-bold text-slate-500">{item.role || 'STUDENT'}</td></>
                        )}
                      </tr>
                    ))
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

      {transactionToMarkLost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><span className="text-3xl">⚠️</span></div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Mark Book as Lost?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to mark <span className="font-bold text-slate-800">"{transactionToMarkLost.book_title || 'this book'}"</span> borrowed by <span className="font-bold text-slate-800">{transactionToMarkLost.user?.username || transactionToMarkLost.user || 'this user'}</span> as lost? This will permanently remove the physical copy from available circulation.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setTransactionToMarkLost(null)} className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors w-1/2">Cancel</button>
                <button onClick={confirmMarkLost} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-md w-1/2">Yes, Mark Lost</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addingCopiesToBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Add Copies</h3>
              <button onClick={() => setAddingCopiesToBook(null)} className="text-emerald-200 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleAddExtraCopies} className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-4">
                Adding to: <span className="font-bold text-slate-900">{addingCopiesToBook.title}</span>
              </p>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Number of new copies</label>
              <input 
                type="number" 
                min="1"
                required
                value={extraCopiesCount} 
                onChange={(e) => setExtraCopiesCount(e.target.value)}
                className="w-full text-center text-2xl p-3 bg-stone-50 border border-stone-200 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-[#14291c]"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddingCopiesToBook(null)} className="w-1/2 py-2.5 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="w-1/2 bg-[#14291c] text-white py-2.5 rounded-lg font-bold shadow-md hover:bg-[#0c1a11] transition-all">Add Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><span className="text-3xl">🗑️</span></div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Delete Book?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{bookToDelete.title}"</span>?
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setBookToDelete(null)} className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors w-1/2">Cancel</button>
                <button onClick={confirmDeleteBook} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-md w-1/2">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Edit Book Details</h3>
              <button onClick={() => setEditingBook(null)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdateBook} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Book Title</label><input required value={editingBook.title} onChange={(e) => setEditingBook({...editingBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ISBN</label><input required value={editingBook.isbn} onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label><select value={editingBook.category} onChange={(e) => setEditingBook({...editingBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]"><option value="Computer Science">Computer Science</option><option value="Fiction">Fiction</option><option value="Science">Science</option><option value="Mathematics">Mathematics</option></select></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Author</label><input required value={editingBook.author} onChange={(e) => setEditingBook({...editingBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingBook(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#14291c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-[260px] bg-[#14291c] text-white flex-col z-20">
        <div className="p-8 pt-10 pb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#e6a83a] rounded-full flex items-center justify-center text-2xl font-serif mb-3 text-[#14291c]">{user?.first_name?.charAt(0) || 'A'}</div>
          <h3 className="font-bold text-base tracking-wide">{user?.first_name || 'Ana'} {user?.last_name || 'Reyes'}</h3>
          <p className="text-[11px] text-emerald-400 mb-2">Library Administrator</p>
          <span className="px-3 py-1 bg-yellow-600/20 text-[#e6a83a] text-[9px] uppercase tracking-widest font-bold rounded-full border border-yellow-600/30">✦ Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mb-3">Main</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'dashboard' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <span>⊞</span> Dashboard
          </button>
          
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mt-6 mb-3">Library</p>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'inventory' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <span>📚</span> Add / View Books
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'transactions' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <div className="flex items-center gap-3"><span>🔄</span> Borrowed / Pending</div>
            {activeCheckouts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {activeCheckouts.length}
              </span>
            )}
          </button>

          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest ml-4 mt-6 mb-3">System</p>
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'members' ? 'bg-[#e6a83a] text-[#14291c] font-bold shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'}`}>
            <span>👥</span> Members
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-emerald-100/50 hover:text-white hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-left">
            <span className="font-medium text-sm border-t border-emerald-800/50 w-full pt-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Log Out
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F9F9F9]">
        <header className="bg-[#F9F9F9] px-10 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'inventory' && 'Library Inventory'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'members' && 'Member Directory'}
            </h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.first_name || 'Ana'} — {formattedToday}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
               <span className="absolute left-3 top-2 text-stone-400 text-sm">🔍</span>
               <input type="text" placeholder="Search books, members..." className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#14291c] w-64 shadow-sm" />
             </div>
             <button className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 shadow-sm relative hover:bg-stone-50 transition-colors">
               🔔 {attentionCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
             <button className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 shadow-sm hover:bg-stone-50 transition-colors">
               📄
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          
          {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div 
                   onClick={() => setDashboardModal({ title: 'Full Library Inventory', type: 'books', data: books })}
                   className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-[4px] border-t-emerald-700 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                 >
                   <div className="flex items-start justify-between mb-2">
                     <span className="text-2xl opacity-80">📚</span>
                   </div>
                   <div>
                     <h3 className="text-4xl font-bold text-slate-900 mb-1">{totalBooksCount}</h3>
                     <p className="text-xs text-slate-500 font-medium">Total Books</p>
                     <p className="text-xs text-emerald-600 mt-4 font-bold flex items-center gap-1">↑ Click to view all inventory</p>
                   </div>
                 </div>
                 
                 <div 
                   onClick={() => setDashboardModal({ title: 'Currently Borrowed Books', type: 'borrowed', data: activeCheckouts })}
                   className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-[4px] border-t-[#e6a83a] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                 >
                   <div className="flex items-start justify-between mb-2">
                     <span className="text-2xl opacity-80 text-blue-500">🔄</span>
                   </div>
                   <div>
                     <h3 className="text-4xl font-bold text-slate-900 mb-1">{activeCheckouts.length}</h3>
                     <p className="text-xs text-slate-500 font-medium">Currently Borrowed</p>
                     <p className="text-xs text-blue-600 mt-4 font-bold flex items-center gap-1">↑ Click to view active list</p>
                   </div>
                 </div>
                 
                 <div 
                   onClick={() => setDashboardModal({ title: 'Registered Members', type: 'members', data: members })}
                   className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-[4px] border-t-indigo-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                 >
                   <div className="flex items-start justify-between mb-2">
                     <span className="text-2xl opacity-80">👥</span>
                   </div>
                   <div>
                     <h3 className="text-4xl font-bold text-slate-900 mb-1">{activeMembersCount > 0 ? activeMembersCount : '...'}</h3>
                     <p className="text-xs text-slate-500 font-medium">Active Members</p>
                     <p className="text-xs text-indigo-600 mt-4 font-bold flex items-center gap-1">↑ Click to view directory</p>
                   </div>
                 </div>

                 <div 
                   onClick={() => setDashboardModal({ title: 'Needs Attention (Overdue / Lost)', type: 'attention', data: [...overdueBooks, ...lostBooks] })}
                   className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col justify-between border-t-[4px] border-t-red-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                 >
                   <div className="flex items-start justify-between mb-2">
                     <span className="text-2xl opacity-80 text-orange-500">⚠️</span>
                   </div>
                   <div>
                     <h3 className="text-4xl font-bold text-slate-900 mb-1">{attentionCount}</h3>
                     <p className="text-xs text-slate-500 font-medium">Needs Attention</p>
                     <p className="text-xs text-red-500 mt-4 font-bold flex items-center gap-1">↓ Click to view overdue & lost</p>
                   </div>
                 </div>

               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 
                 <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-slate-900">Recently Added Books</h3>
                        <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-slate-400 hover:text-slate-800">View all →</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-stone-100">
                              <th className="pb-3 font-semibold">Book</th>
                              <th className="pb-3 font-semibold">Category</th>
                              <th className="pb-3 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                            {recentBooks.length === 0 ? (
                               <tr><td colSpan="3" className="py-4 text-center text-sm text-slate-400">No books found.</td></tr>
                            ) : (
                               recentBooks.map(book => (
                                <tr key={book.id}>
                                  <td className="py-4 flex items-center gap-3">
                                    <div className={`w-8 h-10 rounded shadow-sm flex-shrink-0 ${book.active_copies_count > 0 ? 'bg-emerald-100' : 'bg-red-50'}`}></div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-800">{book.title}</p>
                                      <p className="text-[11px] text-slate-400">{book.author}</p>
                                    </div>
                                  </td>
                                  <td className="py-4 text-xs text-slate-500">{book.category}</td>
                                  <td className="py-4 text-right">
                                    {book.active_copies_count > 0 ? (
                                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">● Available</span>
                                    ) : (
                                      <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full">● Unavailable</span>
                                    )}
                                  </td>
                                </tr>
                               ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-slate-900">Recent Transactions</h3>
                      </div>
                      <div className="space-y-4">
                        {activeCheckouts.slice(0, 4).length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">No active transactions.</p>
                        ) : (
                          activeCheckouts.slice(0, 4).map(tx => {
                            const statusObj = getTxStatus(tx);
                            const userInitials = (tx.user?.username || tx.member_id || "U").substring(0, 2).toUpperCase();
                            return (
                              <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                                    {userInitials}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800">{tx.user?.username || tx.member_id}</p>
                                    <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">{tx.book_title}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${statusObj.style}`}>
                                    {statusObj.text}
                                  </span>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                   <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                      <h3 className="font-serif font-bold text-lg text-slate-900 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setActiveTab('inventory')} className="py-6 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                           <span className="text-2xl text-indigo-500">➕</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Add Book</span>
                         </button>
                         <button onClick={() => setActiveTab('transactions')} className="py-6 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                           <span className="text-2xl text-blue-500">🔄</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Issue Book</span>
                         </button>
                         <button onClick={() => setActiveTab('transactions')} className="py-6 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                           <span className="text-2xl text-emerald-500">📥</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Return Book</span>
                         </button>
                         <button onClick={() => setActiveTab('members')} className="py-6 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors">
                           <span className="text-2xl text-purple-500">👤</span>
                           <span className="text-[10px] font-bold text-slate-700 uppercase">Add new user</span>
                         </button>
                      </div>
                    </div>

                   <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 max-h-[500px] overflow-y-auto">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-lg text-slate-900">Activity Log</h3>
                      </div>
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {recentTx.length === 0 ? (
                           <p className="text-center text-sm text-slate-400">No activity yet.</p>
                        ) : (
                          recentTx.slice(0, 6).map((tx, i) => (
                             <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs">
                                 {tx.status === 'ACTIVE' ? '🔄' : tx.status === 'RETURNED' ? '✅' : '⚠️'}
                               </div>
                               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                 <p className="text-xs text-slate-600">
                                   <span className="font-bold text-slate-900">{tx.user?.username || 'User'}</span> {tx.status === 'ACTIVE' ? 'borrowed' : tx.status === 'RETURNED' ? 'returned' : 'lost'} <span className="font-bold">{tx.book_title || 'a book'}</span>
                                 </p>
                                 <time className="text-[10px] text-slate-400 mt-1 block">{new Date(tx.reservation_date || new Date()).toLocaleDateString()}</time>
                               </div>
                             </div>
                          ))
                        )}
                      </div>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'members' && (
             <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <h3 className="font-serif font-bold text-lg text-slate-900">Registered Users</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6 font-semibold">Student/Teacher ID</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-stone-100 bg-white">
                      {isLoadingMembers ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading members...</td></tr>
                      ) : members.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">No members found. Are your users connected to the API?</td></tr>
                      ) : (
                        members.map((member) => (
                          <tr key={member.id || member.username} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6 font-bold text-slate-900">{member.username}</td>
                            <td className="p-4 text-slate-600">{member.first_name} {member.last_name}</td>
                            <td className="p-4 text-slate-600">{member.email}</td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border ${member.role === 'ADMIN' || member.role === 'LIBRARIAN' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                                {member.role || 'STUDENT'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="bg-[#14291c] p-4 px-6 border-b border-emerald-800">
                  <h3 className="font-serif font-bold text-lg text-white">Register New Book</h3>
                </div>
                <form onSubmit={handleAddBook} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Book Title</label>
                    <input required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="e.g. The Great Gatsby" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN</label>
                    <input required value={newBook.isbn} onChange={(e) => setNewBook({...newBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="978-3-16-148410-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label>
                    <input required value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="Author Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <select value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Copies</label>
                    <input type="number" required value={copiesToCreate} onChange={(e) => setCopiesToCreate(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" min="1" />
                  </div>
                  <div className="md:col-span-3 flex justify-end mt-2">
                    <button type="submit" className="bg-[#14291c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md">
                      Save Book to Catalog
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                  <h3 className="font-serif font-bold text-lg text-slate-900">Full Catalog</h3>
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
                      {isLoadingBooks ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading catalog...</td></tr>
                      ) : books.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">No books found. Add one above!</td></tr>
                      ) : (
                        books.map((book) => (
                          <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 pl-6">
                              <p className="font-bold text-slate-900">{book.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ISBN: {book.isbn}</p>
                            </td>
                            <td className="p-4 text-slate-600">{book.author}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{book.active_copies_count ?? (book.copies?.length || 0)}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {book.available_copies_count} avail
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-4">
                              <button onClick={() => setAddingCopiesToBook(book)} className="text-blue-600 font-bold text-sm hover:underline">+ Copies</button>
                              <button onClick={() => setEditingBook(book)} className="text-[#14291c] font-bold text-sm hover:underline">Edit</button>
                              <button onClick={() => setBookToDelete(book)} className="text-red-600 font-bold text-sm hover:underline">Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
             <div className="lg:col-span-1 space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                 <div className="bg-[#14291c] p-4 border-b border-emerald-800">
                   <h3 className="font-serif font-bold text-lg text-white">Issue Book</h3>
                 </div>
                 <form onSubmit={handleIssueBook} className="p-6 space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student / Teacher ID</label>
                     <input required value={newTx.member_id} onChange={(e) => setNewTx({...newTx, member_id: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="e.g. jdelacruz" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book ISBN</label>
                     <input required value={newTx.isbn} onChange={(e) => setNewTx({...newTx, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="978-X-XX-XXXXXX-X" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                     <input required type="date" value={newTx.due_date} onChange={(e) => setNewTx({...newTx, due_date: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" />
                   </div>
                   <button type="submit" className="w-full bg-[#14291c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md mt-4">
                     Confirm Issue
                   </button>
                 </form>
               </div>
             </div>

             <div className="lg:col-span-2">
               <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full">
                 
                 <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                   <h3 className="font-serif font-bold text-lg text-slate-900">Borrowing History</h3>
                   <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200">
                      <button 
                        onClick={() => setTxFilter('active')} 
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${txFilter === 'active' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Active Only
                      </button>
                      <button 
                        onClick={() => setTxFilter('all')} 
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${txFilter === 'all' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        All History
                      </button>
                   </div>
                 </div>

                 <div className="overflow-x-auto flex-1">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                         <th className="p-4 pl-6 font-semibold">Borrower</th>
                         <th className="p-4 font-semibold">Book Title</th>
                         <th className="p-4 font-semibold">Due Date</th>
                         <th className="p-4 font-semibold">Status</th>
                         <th className="p-4 font-semibold text-right pr-6">Action</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm divide-y divide-stone-100 bg-white">
                       {isLoadingTx ? (
                          <tr><td colSpan="5" className="p-6 text-center text-slate-500">Loading transactions...</td></tr>
                        ) : displayedTransactions.length === 0 ? (
                          <tr><td colSpan="5" className="p-6 text-center text-slate-500">No borrowings found.</td></tr>
                        ) : (
                          displayedTransactions.map((tx) => {
                            const status = getTxStatus(tx);
                            
                            return (
                              <tr key={tx.id} className={`hover:bg-stone-50/50 transition-colors ${tx.status === 'RETURNED' || tx.status === 'LOST' ? 'opacity-60' : ''}`}>
                                <td className="p-4 pl-6 font-bold text-slate-900">{tx.user?.username || tx.user || tx.member_id || "User"}</td>
                                <td className="p-4 text-slate-600">{tx.book_title || "Unknown Book"}</td>
                                <td className="p-4 font-medium text-slate-700">
                                  {new Date(tx.due_date).toLocaleDateString()}
                                </td>
                                
                                <td className="p-4">
                                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border ${status.style}`}>
                                    {status.text}
                                  </span>
                                </td>

                                <td className="p-4 text-right pr-6">
                                  {tx.status === 'ACTIVE' ? (
                                    <div className="flex items-center justify-end gap-3">
                                      <button onClick={() => setTransactionToMarkLost(tx)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">
                                        Lost?
                                      </button>
                                      <button onClick={() => handleReturnBook(tx.id)} className="bg-stone-100 text-[#14291c] hover:bg-emerald-100 hover:text-emerald-800 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-stone-200">
                                        Mark as Returned
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-bold text-stone-400 px-4 py-2">Completed</span>
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
           </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;