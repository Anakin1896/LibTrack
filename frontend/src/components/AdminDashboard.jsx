import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const [notification, setNotification] = useState(null);
  
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
  const [copiesToCreate, setCopiesToCreate] = useState('1'); 
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [newTx, setNewTx] = useState({
    member_id: '',
    isbn: '',
    due_date: ''
  });

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

  useEffect(() => {
    if (activeTab === 'inventory') fetchBooks();
    if (activeTab === 'transactions') fetchTransactions();
  }, [activeTab]);

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
    } catch (error) {
      console.error("Failed to return book:", error);
      showNotification("Error returning book.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans overflow-hidden relative">

      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-bold text-sm">{notification.message}</p>
        </div>
      )}

      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><span className="text-3xl">🗑️</span></div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Delete Book?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{bookToDelete.title}"</span>? This will permanently remove the book and all its physical copies from the system. This action cannot be undone.
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
            <div className="bg-[#1a3626] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Edit Book Details</h3>
              <button onClick={() => setEditingBook(null)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdateBook} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Book Title</label><input required value={editingBook.title} onChange={(e) => setEditingBook({...editingBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ISBN</label><input required value={editingBook.isbn} onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label><select value={editingBook.category} onChange={(e) => setEditingBook({...editingBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]"><option value="Computer Science">Computer Science</option><option value="Fiction">Fiction</option><option value="Science">Science</option><option value="Mathematics">Mathematics</option></select></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Author</label><input required value={editingBook.author} onChange={(e) => setEditingBook({...editingBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingBook(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#1a3626] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#12261a] transition-all shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-64 bg-[#1a3626] text-white flex-col shadow-2xl z-20">
        <div className="p-8 flex flex-col items-center border-b border-emerald-800/50">
          <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center text-3xl font-serif mb-4 shadow-lg text-[#1a3626]">{user?.first_name?.charAt(0) || 'A'}</div>
          <h3 className="font-bold text-lg tracking-wide">{user?.first_name} {user?.last_name}</h3>
          <p className="text-xs text-emerald-300 mb-2">Library Administrator</p>
          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-500 text-[10px] uppercase tracking-widest font-bold rounded-full border border-yellow-600/30">✦ Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mb-2">Main</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}><span>⊞</span> Dashboard</button>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest ml-4 mt-6 mb-2">Library</p>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}><span>📚</span> Add / View Books</button>
          <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-yellow-600 text-[#1a3626] font-bold shadow-md' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <div className="flex items-center gap-3"><span>🔄</span> Transactions</div>
            {transactions.filter(t => t.status !== 'RETURNED').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {transactions.filter(t => t.status !== 'RETURNED').length}
              </span>
            )}
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
                 <div><h3 className="text-3xl font-bold text-slate-900">2,418</h3><p className="text-sm text-slate-500">Total Books</p></div>
               </div>
               <div className="bg-white p-6 rounded-2xl border-t-4 border-yellow-500 shadow-sm flex flex-col justify-between">
                 <span className="text-2xl mb-2">🔄</span>
                 <div><h3 className="text-3xl font-bold text-slate-900">84</h3><p className="text-sm text-slate-500">Currently Borrowed</p></div>
               </div>
               <div className="bg-white p-6 rounded-2xl border-t-4 border-indigo-500 shadow-sm flex flex-col justify-between">
                 <span className="text-2xl mb-2">👥</span>
                 <div><h3 className="text-3xl font-bold text-slate-900">342</h3><p className="text-sm text-slate-500">Active Members</p></div>
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
                <form onSubmit={handleAddBook} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Book Title</label>
                    <input required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="e.g. The Great Gatsby" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN</label>
                    <input required value={newBook.isbn} onChange={(e) => setNewBook({...newBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="978-3-16-148410-0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label>
                    <input required value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Author Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <select value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Copies</label>
                    <input type="number" required value={copiesToCreate} onChange={(e) => setCopiesToCreate(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" min="1" />
                  </div>
                  <div className="md:col-span-3 flex justify-end mt-2">
                    <button type="submit" className="bg-[#1a3626] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#12261a] transition-all shadow-md">
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
                                <span className="font-bold text-slate-700">{book.copies?.length || 0}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {book.available_copies_count} avail
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-4">
                              <button onClick={() => setEditingBook(book)} className="text-[#1a3626] font-bold text-sm hover:underline">Edit</button>
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
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <div className="lg:col-span-1 space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                 <div className="bg-[#1a3626] p-4 border-b border-emerald-800">
                   <h3 className="font-serif font-bold text-lg text-white">Issue Book</h3>
                 </div>
                 <form onSubmit={handleIssueBook} className="p-6 space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student / Teacher ID</label>
                     <input required value={newTx.member_id} onChange={(e) => setNewTx({...newTx, member_id: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="e.g. jdelacruz" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Book ISBN</label>
                     <input required value={newTx.isbn} onChange={(e) => setNewTx({...newTx, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="978-X-XX-XXXXXX-X" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
                     <input required type="date" value={newTx.due_date} onChange={(e) => setNewTx({...newTx, due_date: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" />
                   </div>
                   <button type="submit" className="w-full bg-[#1a3626] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#12261a] transition-all shadow-md mt-4">
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
                       
                       {isLoadingTx ? (
                          <tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading transactions...</td></tr>
                        ) : transactions.filter(tx => tx.status !== 'RETURNED').length === 0 ? (
                          <tr><td colSpan="4" className="p-6 text-center text-slate-500">No active borrowings found.</td></tr>
                        ) : (
                          transactions.filter(tx => tx.status !== 'RETURNED').map((tx) => {
                            const isOverdue = new Date(tx.due_date) < new Date();
                            return (
                              <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                                <td className="p-4 pl-6 font-bold text-slate-900">{tx.user?.username || tx.user || tx.member_id || "User"}</td>
                                <td className="p-4 text-slate-600">{tx.book_copy?.book?.title || tx.isbn || "Unknown Book"}</td>
                                <td className="p-4">
                                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {new Date(tx.due_date).toLocaleDateString()} {isOverdue && "(Overdue)"}
                                  </span>
                                </td>
                                <td className="p-4 text-right pr-6">
                                  <button 
                                    onClick={() => handleReturnBook(tx.id)} 
                                    className="bg-stone-100 text-[#1a3626] hover:bg-emerald-100 hover:text-emerald-800 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-stone-200"
                                  >
                                    Mark as Returned
                                  </button>
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