import { useState } from 'react';
import api from '../api';

function Inventory({ books, isLoadingBooks, fetchBooks, showNotification }) {
  const [newBook, setNewBook] = useState({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
  const [copiesToCreate, setCopiesToCreate] = useState('1'); 
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [addingCopiesToBook, setAddingCopiesToBook] = useState(null);
  const [extraCopiesCount, setExtraCopiesCount] = useState('1');

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const bookResponse = await api.post('/catalog/books/', newBook);
      const createdBookId = bookResponse.data.id;
      const copies = parseInt(copiesToCreate, 10) || 1;
      for (let i = 0; i < copies; i++) await api.post('/catalog/copies/', { book: createdBookId, status: 'AVAILABLE' });
      fetchBooks();
      setNewBook({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
      setCopiesToCreate('1');
      showNotification("Book successfully added!", "success");
    } catch (error) { showNotification("Error saving book.", "error"); }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/catalog/books/${editingBook.id}/`, editingBook);
      fetchBooks(); setEditingBook(null); showNotification("Updated successfully!", "success");
    } catch (error) { showNotification("Error updating.", "error"); }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await api.delete(`/catalog/books/${bookToDelete.id}/`);
      fetchBooks(); showNotification("Deleted successfully.", "success");
    } catch (error) { showNotification("Error deleting.", "error"); } 
    finally { setBookToDelete(null); }
  };

  const handleAddExtraCopies = async (e) => {
    e.preventDefault();
    const count = parseInt(extraCopiesCount, 10) || 0;
    try {
      for (let i = 0; i < count; i++) await api.post('/catalog/copies/', { book: addingCopiesToBook.id, status: 'AVAILABLE' });
      fetchBooks(); setAddingCopiesToBook(null); setExtraCopiesCount('1');
      showNotification(`Added ${count} copies!`, "success");
    } catch (error) { showNotification("Error adding copies.", "error"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-[#14291c] p-4 px-6 border-b border-emerald-800"><h3 className="font-serif font-bold text-lg text-white">Register New Book</h3></div>
        <form onSubmit={handleAddBook} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label><input required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN</label><input required value={newBook.isbn} onChange={(e) => setNewBook({...newBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label><input required value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label><select value={newBook.category} onChange={(e) => setNewBook({...newBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]"><option value="Computer Science">Computer Science</option><option value="Fiction">Fiction</option><option value="Science">Science</option><option value="Mathematics">Mathematics</option></select></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Copies</label><input type="number" required value={copiesToCreate} onChange={(e) => setCopiesToCreate(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" min="1" /></div>
          <div className="md:col-span-3 flex justify-end mt-2"><button type="submit" className="bg-[#14291c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md">Save Book</button></div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white"><h3 className="font-serif font-bold text-lg text-slate-900">Full Catalog</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100"><th className="p-4 pl-6 font-semibold">Title & ISBN</th><th className="p-4 font-semibold">Author</th><th className="p-4 font-semibold">Copies (Avail)</th><th className="p-4 font-semibold text-right pr-6">Action</th></tr></thead>
            <tbody className="text-sm divide-y divide-stone-100 bg-white">
              {isLoadingBooks ? (<tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading...</td></tr>) : 
               books.length === 0 ? (<tr><td colSpan="4" className="p-6 text-center text-slate-500">No books found.</td></tr>) : 
               books.map((book) => (
                <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 pl-6"><p className="font-bold text-slate-900">{book.title}</p><p className="text-xs text-slate-500 mt-0.5">ISBN: {book.isbn}</p></td>
                  <td className="p-4 text-slate-600">{book.author}</td>
                  <td className="p-4"><span className="font-bold text-slate-700">{book.active_copies_count ?? (book.copies?.length || 0)}</span> <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{book.available_copies_count} avail</span></td>
                  <td className="p-4 text-right pr-6 space-x-4">
                    <button onClick={() => setAddingCopiesToBook(book)} className="text-blue-600 font-bold text-sm hover:underline">+ Copies</button>
                    <button onClick={() => setEditingBook(book)} className="text-[#14291c] font-bold text-sm hover:underline">Edit</button>
                    <button onClick={() => setBookToDelete(book)} className="text-red-600 font-bold text-sm hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Edit Book</h3><button onClick={() => setEditingBook(null)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdateBook} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label><input required value={editingBook.title} onChange={(e) => setEditingBook({...editingBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ISBN</label><input required value={editingBook.isbn} onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label><select value={editingBook.category} onChange={(e) => setEditingBook({...editingBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]"><option value="Computer Science">Computer Science</option><option value="Fiction">Fiction</option></select></div>
              </div>
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setEditingBook(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="bg-[#14291c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c1a11]">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-8 text-center">
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Delete Book?</h3>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to delete <span className="font-bold">"{bookToDelete.title}"</span>?</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setBookToDelete(null)} className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors w-1/2">Cancel</button>
                <button onClick={confirmDeleteBook} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 w-1/2">Yes, Delete</button>
              </div>
           </div>
        </div>
      )}

      {addingCopiesToBook && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center"><h3 className="font-serif font-bold text-lg text-white">Add Copies</h3><button onClick={() => setAddingCopiesToBook(null)} className="text-emerald-200 hover:text-white">&times;</button></div>
            <form onSubmit={handleAddExtraCopies} className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-4">Adding to: <span className="font-bold text-slate-900">{addingCopiesToBook.title}</span></p>
              <input type="number" min="1" required value={extraCopiesCount} onChange={(e) => setExtraCopiesCount(e.target.value)} className="w-full text-center text-2xl p-3 bg-stone-50 border border-stone-200 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-[#14291c]" />
              <div className="flex gap-3"><button type="button" onClick={() => setAddingCopiesToBook(null)} className="w-1/2 py-2.5 font-bold text-slate-500">Cancel</button><button type="submit" className="w-1/2 bg-[#14291c] text-white py-2.5 rounded-lg font-bold">Add Now</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Inventory;