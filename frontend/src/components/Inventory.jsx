function Inventory({ 
  books, isLoadingBooks, newBook, setNewBook, copiesToCreate, setCopiesToCreate, 
  handleAddBook, setAddingCopiesToBook, setEditingBook, setBookToDelete 
}) {
  return (
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
  );
}

export default Inventory;