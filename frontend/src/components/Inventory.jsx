import { useState, useEffect } from 'react';
import api from '../api';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode'; 

function Inventory({ books, isLoadingBooks, fetchBooks, showNotification }) {
  const [newBook, setNewBook] = useState({ title: '', isbn: '', author: '', category: 'Computer Science', publication_year: new Date().getFullYear() });
  const [copiesToCreate, setCopiesToCreate] = useState('1'); 
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [addingCopiesToBook, setAddingCopiesToBook] = useState(null);
  const [extraCopiesCount, setExtraCopiesCount] = useState('1');
  const [qrBook, setQrBook] = useState(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedBook, setScannedBook] = useState(null);
  const [scannedCopiesCount, setScannedCopiesCount] = useState('1');
  
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsScanning(false);
          
          const isbnMatch = decodedText.match(/ISBN:\s*([^\n]+)/);
          const scannedIsbn = isbnMatch ? isbnMatch[1].trim() : decodedText.trim();
          
          const foundBook = books.find(b => b.isbn === scannedIsbn);
          
          if (foundBook) {
            setScannedBook(foundBook);
            setScannedCopiesCount('1');
          } else {
            showNotification(`No book found for ISBN: ${scannedIsbn}`, "error");
          }
        },
        (error) => {}
      );

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [isScanning, books]);

  const handleConfirmScannedCopy = async () => {
    const count = parseInt(scannedCopiesCount, 10) || 1;
    try {
      for (let i = 0; i < count; i++) {
        await api.post('/catalog/copies/', { book: scannedBook.id, status: 'AVAILABLE' });
      }
      fetchBooks();
      setScannedBook(null);
      setScannedCopiesCount('1');
      showNotification(`Successfully added ${count} ${count === 1 ? 'copy' : 'copies'}!`, "success");
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
    } catch (error) { showNotification("Error deleting.", "error");
    } 
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

  const handlePrintQRSticker = (e) => {
    e.preventDefault();
    if (!qrBook.copies || qrBook.copies.length === 0) return showNotification("No copies to print.", "error");
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    let stickersHtml = '';
    qrBook.copies.forEach((copy, idx) => {
      const canvas = document.getElementById(`qr-copy-${copy.tracking_uuid}`);
      if(canvas) {
         const pngUrl = canvas.toDataURL("image/png");
         stickersHtml += `
           <div class="sticker" style="page-break-inside: avoid; margin-bottom: 20px;">
             <div class="school-name">JPNHS Library</div>
             <img src="${pngUrl}" alt="QR Code" />
             <h3>${qrBook.title}</h3>
             <p>Copy #${idx + 1} | ID: ${copy.tracking_uuid.substring(0,8)}</p>
           </div>
         `;
      }
    });

    iframe.contentDocument.write(`
      <html>
        <head>
          <title>Print QR - ${qrBook.title}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
            .sticker { border: 2px dashed #ccc; padding: 20px; text-align: center; width: 200px; border-radius: 8px; }
            .school-name { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #14291c; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            h3 { font-size: 14px; margin: 10px 0 5px; color: #14291c; line-height: 1.2; }
            p { font-size: 11px; color: #555; margin: 0; font-family: monospace; }
            img { max-width: 130px; height: auto; margin-bottom: 5px; }
            @media print { body { padding: 0; } .sticker { border: none; } }
          </style>
        </head>
        <body>${stickersHtml}</body>
      </html>
    `);
    iframe.contentDocument.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => { document.body.removeChild(iframe); setQrBook(null); }, 1000);
    }, 250);
  };

  const filteredCatalogBooks = books.filter(book => 
    book.title.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || 
    book.isbn.includes(catalogSearchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-[#14291c] p-4 px-6 border-b border-emerald-800"><h3 className="font-serif font-bold text-lg text-white">Register New Book</h3></div>
        
        <form onSubmit={handleAddBook} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-2 space-y-4">
             <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label><input required value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN</label><input required value={newBook.isbn} onChange={(e) => setNewBook({...newBook, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Copies</label><input type="number" required value={copiesToCreate} onChange={(e) => setCopiesToCreate(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" min="1" /></div>
             </div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Author</label><input required value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>

             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
               <input 
                 type="text" 
                 value={newBook.category} 
                 onChange={(e) => setNewBook({...newBook, category: e.target.value})} 
                 className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                 placeholder="Type or click a category below..." 
                 required
               />
               <div className="flex gap-2 mt-2 flex-wrap">
                 {['Computer Science', 'Fiction', 'Science', 'Mathematics'].map(cat => (
                   <button 
                     key={cat}
                     type="button" 
                     onClick={() => setNewBook({...newBook, category: cat})} 
                     className="text-[10px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full border border-stone-200 transition-colors"
                   >
                     + {cat}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-stone-50 rounded-xl border border-stone-100 h-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">QR Preview</label>
            {newBook.isbn ? (
              <>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-stone-200">
                  <QRCodeCanvas id="new-book-qr" value={`ISBN: ${newBook.isbn}\nTitle: ${newBook.title}\nAuthor: ${newBook.author}`} size={160} />
                </div>
                <button type="button" onClick={() => {
                  const canvas = document.getElementById('new-book-qr');
                  if(canvas) {
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `QR_${newBook.isbn}.png`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                  }
                }} className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                  <span>⬇️</span> Download QR Code
                </button>
              </>
            ) : (
              <div className="w-40 h-40 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-xs text-center p-4">Enter ISBN to preview QR Code</div>
            )}
            <p className="text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-wider">ISBN: {newBook.isbn || '----------'}</p>
          </div>

          <div className="md:col-span-4 flex justify-end mt-2"><button type="submit" className="bg-[#14291c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md">Save Book</button></div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col">

        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
           <h3 className="font-serif font-bold text-lg text-slate-900 shrink-0">Full Catalog</h3>
           
           <div className="relative w-full sm:max-w-xs md:max-w-md ml-auto">
             <span className="absolute left-3 top-2.5 text-stone-400 text-sm">🔍</span>
             <input 
               type="text" 
               placeholder="Search title, author, or ISBN..." 
               className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#14291c] transition-all"
               value={catalogSearchQuery}
               onChange={(e) => setCatalogSearchQuery(e.target.value)}
             />
           </div>

           <button onClick={() => setIsScanning(true)} className="shrink-0 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2 transition-colors border border-indigo-100">
             <span>📷</span> Scan QR to Add Copy
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100"><th className="p-4 pl-6 font-semibold">Title & ISBN</th><th className="p-4 font-semibold">Author</th><th className="p-4 font-semibold">Copies (Avail)</th><th className="p-4 font-semibold text-right pr-6">Action</th></tr></thead>
            <tbody className="text-sm divide-y divide-stone-100 bg-white">
              {isLoadingBooks ? (<tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading...</td></tr>) : 
               books.length === 0 ? (<tr><td colSpan="4" className="p-6 text-center text-slate-500">No books found in inventory.</td></tr>) : 
               filteredCatalogBooks.length === 0 ? (<tr><td colSpan="4" className="p-6 text-center text-slate-500">No matching books found for "{catalogSearchQuery}".</td></tr>) : 
               filteredCatalogBooks.map((book) => (
                <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 pl-6"><p className="font-bold text-slate-900">{book.title}</p><p className="text-xs text-slate-500 mt-0.5">ISBN: {book.isbn}</p></td>
                  <td className="p-4 text-slate-600">{book.author}</td>
                  <td className="p-4"><span className="font-bold text-slate-700">{book.active_copies_count ?? (book.copies?.length || 0)}</span> <span className={`text-xs px-2 py-0.5 rounded-full ${book.available_copies_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{book.available_copies_count} avail</span></td>
                  <td className="p-4 text-right pr-6 space-x-3">
                    <button onClick={() => setQrBook(book)} className="text-purple-600 font-bold text-xs hover:underline bg-purple-50 px-2 py-1 rounded-md">QR Code</button>
                    <button onClick={() => setAddingCopiesToBook(book)} className="text-blue-600 font-bold text-xs hover:underline">+ Copies</button>
                    <button onClick={() => setEditingBook(book)} className="text-[#14291c] font-bold text-xs hover:underline">Edit</button>
                    <button onClick={() => setBookToDelete(book)} className="text-red-600 font-bold text-xs hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 text-center flex flex-col">
              <div className="bg-indigo-900 p-4 px-6 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg text-white">📷 Scan Book QR</h3>
                <button onClick={() => setIsScanning(false)} className="text-indigo-200 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <div className="p-6 bg-stone-50">
                 <p className="text-sm text-slate-500 mb-4">Position the book's QR code inside the frame to automatically add copies to the inventory.</p>
                 <div id="qr-reader" className="mx-auto overflow-hidden rounded-xl border-2 border-indigo-200 bg-white min-h-62.5"></div>
              </div>
              <div className="p-4 bg-white border-t border-stone-100">
                <button onClick={() => setIsScanning(false)} className="w-full px-4 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-stone-200">Cancel Scanning</button>
              </div>
           </div>
        </div>
      )}

      {scannedBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 text-center flex flex-col">
              <div className="bg-emerald-700 p-4 px-6 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg text-white">✅ QR Code Detected</h3>
                <button onClick={() => { setScannedBook(null); setScannedCopiesCount('1'); }} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
              </div>
              
              <div className="p-8 bg-stone-50 border-b border-stone-100">
                 <h4 className="font-bold text-slate-900 text-xl leading-tight mb-2">{scannedBook.title}</h4>
                 <p className="text-sm text-slate-600">By {scannedBook.author}</p>
                 <span className="inline-block mt-3 px-3 py-1 bg-stone-200 text-slate-700 text-xs font-mono font-bold rounded-full border border-stone-300">ISBN: {scannedBook.isbn}</span>
              </div>

              <div className="p-6 bg-white">
                <div className="mb-6 text-left">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Copies to Add</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={scannedCopiesCount} 
                    onChange={(e) => setScannedCopiesCount(e.target.value)} 
                    className="w-full text-center text-xl p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-600" 
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setScannedBook(null); setScannedCopiesCount('1'); }} className="w-1/2 px-4 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-stone-200">Cancel</button>
                  <button onClick={handleConfirmScannedCopy} className="w-1/2 bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md">Confirm & Save</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {qrBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]">
              <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center shrink-0">
                <h3 className="font-serif font-bold text-lg text-white">{qrBook.title} - Asset QRs</h3>
                <button onClick={() => setQrBook(null)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
                 <p className="text-sm text-slate-500 mb-4 text-center">Print unique asset tags for each physical copy.</p>
                 <div className="flex flex-wrap gap-4 justify-center">
                   {qrBook.copies && qrBook.copies.length > 0 ? qrBook.copies.map((copy, idx) => (
                     <div key={copy.tracking_uuid} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center">
                       <QRCodeCanvas 
                          id={`qr-copy-${copy.tracking_uuid}`} 
                          value={`COPY_ID: ${copy.tracking_uuid}\nTitle: ${qrBook.title}`} 
                          size={120} 
                          level={"M"} 
                       />
                       <p className="text-xs font-bold text-slate-700 mt-3">Copy #{idx + 1}</p>
                       <p className="text-[9px] text-slate-400 font-mono mt-0.5">{copy.tracking_uuid.substring(0,8)}</p>
                     </div>
                   )) : (
                     <p className="text-sm text-slate-500">No copies available to generate QRs.</p>
                   )}
                 </div>
              </div>

              <div className="p-4 flex gap-3 bg-white border-t border-stone-100 shrink-0">
                <button onClick={() => setQrBook(null)} className="w-1/2 px-4 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
                <button onClick={handlePrintQRSticker} className="w-1/2 bg-purple-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2" disabled={!qrBook.copies || qrBook.copies.length === 0}>
                  <span>🖨️</span> Print All Stickers
                </button>
              </div>
           </div>
        </div>
      )}

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
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                   <input value={editingBook.category} onChange={(e) => setEditingBook({...editingBook, category: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setEditingBook(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="bg-[#14291c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c1a11]">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}

      {bookToDelete && (
       <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100 p-8 text-center">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-stone-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center"><h3 className="font-serif font-bold text-lg text-white">Add Copies</h3><button onClick={() => setAddingCopiesToBook(null)} className="text-emerald-200 hover:text-white">&times;</button></div>
            <form onSubmit={handleAddExtraCopies} className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-4">Adding to: <span className="font-bold text-slate-900">{addingCopiesToBook.title}</span></p>
              <input type="number" min="1" required value={extraCopiesCount} onChange={(e) => setExtraCopiesCount(e.target.value)} className="w-full text-center text-2xl p-3 bg-stone-50 border border-stone-200 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-[#14291c]" />
              <div className="flex gap-3"><button type="button" onClick={() => setAddingCopiesToBook(null)} className="w-1/2 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="w-1/2 bg-[#14291c] text-white py-2.5 rounded-lg font-bold hover:bg-[#0c1a11]">Add Now</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;