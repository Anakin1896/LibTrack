import { useState, useEffect } from 'react';
import api from '../api';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Transactions({ transactions, isLoadingTx, fetchTransactions, fetchBooks, showNotification }) {

  const [txFilter, setTxFilter] = useState('active'); 
  const [newTx, setNewTx] = useState({ member_id: '', isbn: '', due_date: '' });
  const [transactionToMarkLost, setTransactionToMarkLost] = useState(null);

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-tx", 
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false
      );

      scanner.render(
        (decodedText) => {

          scanner.clear();
          setIsScanning(false);

          const isbnMatch = decodedText.match(/ISBN:\s*([^\n]+)/);
          const scannedIsbn = isbnMatch ? isbnMatch[1].trim() : decodedText.trim();

          setNewTx(prev => ({ ...prev, isbn: scannedIsbn }));
          showNotification("Book scanned successfully!", "success");
        },
        (error) => {}
      );

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      };
    }
  }, [isScanning]);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/', newTx);
      showNotification("Book successfully issued!", "success");
      setNewTx({ member_id: '', isbn: '', due_date: '' }); 
      fetchTransactions(); fetchBooks();
    } catch (error) { showNotification(error.response?.data?.detail || "Error issuing book.", "error"); }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      await api.patch(`/transactions/${transactionId}/`, { status: 'RETURNED', return_date: new Date().toISOString() });
      showNotification("Book returned successfully!", "success");
      fetchTransactions(); fetchBooks();
    } catch (error) { showNotification("Error returning book.", "error"); }
  };

  const confirmMarkLost = async () => {
    if (!transactionToMarkLost) return;
    try {
      await api.patch(`/transactions/${transactionToMarkLost.id}/`, { status: 'LOST' });
      showNotification("Book marked as lost.", "error"); 
      fetchTransactions(); fetchBooks();
    } catch (error) { showNotification("Error updating status.", "error"); } 
    finally { setTransactionToMarkLost(null); }
  };

  const handleApproveReservation = async (transactionId) => {
    try {
      await api.patch(`/transactions/${transactionId}/`, { status: 'ACTIVE' });
      showNotification("Reservation approved! Book is now issued.", "success");
      fetchTransactions(); fetchBooks();
    } catch (error) { showNotification("Error approving reservation.", "error"); }
  };

  const handleDenyReservation = async (transactionId) => {
    try {
      await api.patch(`/transactions/${transactionId}/`, { status: 'CANCELLED' });
      showNotification("Reservation denied and cancelled.", "success");
      fetchTransactions(); fetchBooks();
    } catch (error) { showNotification("Error cancelling reservation.", "error"); }
  };

  const getTxStatus = (tx) => {
    if (tx.status === 'LOST') return { text: 'Lost', style: 'bg-slate-800 text-white border-slate-900' };
    if (tx.status === 'CANCELLED') return { text: 'Cancelled', style: 'bg-stone-100 text-stone-500 border-stone-200' };
    if (tx.status === 'PENDING') return { text: 'Pending', style: 'bg-purple-100 text-purple-800 border-purple-200' };
    
    if (tx.status === 'RETURNED') {
      if (tx.return_date && new Date(tx.return_date).setHours(0,0,0,0) > new Date(tx.due_date).setHours(0,0,0,0)) {
         return { text: 'Returned Late', style: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      }
      return { text: 'Returned', style: 'bg-stone-100 text-stone-600 border-stone-200' };
    }

    const diffDays = Math.ceil((new Date(tx.due_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', style: 'bg-red-100 text-red-800 border-red-200' };
    if (diffDays <= 3) return { text: 'Due Soon', style: 'bg-orange-100 text-orange-800 border-orange-200' };
    
    return { text: 'Active', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const pendingCount = transactions.filter(tx => tx.status === 'PENDING').length;

  const displayedTransactions = transactions.filter(tx => {
    if (txFilter === 'active') return tx.status === 'ACTIVE';
    if (txFilter === 'pending') return tx.status === 'PENDING';
    return true; 
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="bg-[#14291c] p-4 border-b border-emerald-800"><h3 className="font-serif font-bold text-lg text-white">Issue Book</h3></div>
          <form onSubmit={handleIssueBook} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student/Member ID</label>
              <input required value={newTx.member_id} onChange={(e) => setNewTx({...newTx, member_id: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="Enter ID..." />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Book ISBN</label>
                <button type="button" onClick={() => setIsScanning(true)} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-100 flex items-center gap-1 border border-indigo-100 transition-colors">
                  <span>📷</span> Scan QR
                </button>
              </div>
              <input required value={newTx.isbn} onChange={(e) => setNewTx({...newTx, isbn: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder="Scan or type ISBN..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Due Date</label>
              <input required type="date" value={newTx.due_date} onChange={(e) => setNewTx({...newTx, due_date: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" />
            </div>
            
            <button type="submit" className="w-full bg-[#14291c] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-colors shadow-md mt-2">Confirm Issue</button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
            <h3 className="font-serif font-bold text-lg text-slate-900">Borrowing History</h3>
            <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200">
               <button onClick={() => setTxFilter('pending')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 ${txFilter === 'pending' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                 Pending 
                 {pendingCount > 0 && <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full text-[10px]">{pendingCount}</span>}
               </button>
               <button onClick={() => setTxFilter('active')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${txFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Active Only</button>
               <button onClick={() => setTxFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${txFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All History</button>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-xs text-slate-500 uppercase tracking-wider border-b border-stone-100">
                  <th className="p-4 pl-6">Borrower ID</th>
                  <th className="p-4">Borrower Name</th>
                  <th className="p-4">Book</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-stone-100 bg-white">
                {isLoadingTx ? (
                   <tr><td colSpan="6" className="p-6 text-center text-slate-500">Loading transactions...</td></tr>
                 ) : displayedTransactions.length === 0 ? (
                   <tr><td colSpan="6" className="p-6 text-center text-slate-500">No records found for this filter.</td></tr>
                 ) : (
                   displayedTransactions.map((tx) => {
                     const status = getTxStatus(tx);
                     const borrowerName = tx.user?.first_name 
                       ? `${tx.user.first_name} ${tx.user.last_name}`.trim() 
                       : '-';

                     return (
                       <tr key={tx.id} className={`hover:bg-stone-50/50 ${tx.status === 'RETURNED' || tx.status === 'LOST' || tx.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
                         <td className="p-4 pl-6 font-bold">{tx.user?.username || tx.member_id || "Unknown"}</td>
                         <td className="p-4 text-slate-600">{borrowerName}</td>
                         <td className="p-4">{tx.book_title}</td>
                         <td className="p-4">{new Date(tx.due_date).toLocaleDateString()}</td>
                         <td className="p-4"><span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold border whitespace-nowrap ${status.style}`}>{status.text}</span></td>
                         <td className="p-4 text-right pr-6">
                           
                           {tx.status === 'PENDING' ? (
                             <div className="flex items-center justify-end gap-2">
                               <button onClick={() => handleDenyReservation(tx.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-100">Deny</button>
                               <button onClick={() => handleApproveReservation(tx.id)} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-200">Approve</button>
                             </div>
                           ) : tx.status === 'ACTIVE' ? (
                             <div className="flex items-center justify-end gap-3">
                               <button onClick={() => setTransactionToMarkLost(tx)} className="text-red-500 hover:text-red-700 text-xs font-bold">Lost?</button>
                               <button onClick={() => handleReturnBook(tx.id)} className="bg-stone-100 px-4 py-2 rounded-lg text-xs font-bold text-[#14291c] hover:bg-emerald-100 hover:text-emerald-800 border border-stone-200 transition-colors">Return</button>
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

      {isScanning && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 text-center flex flex-col">
              <div className="bg-indigo-900 p-4 px-6 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg text-white">📷 Scan Book to Issue</h3>
                <button onClick={() => setIsScanning(false)} className="text-indigo-200 hover:text-white text-xl leading-none">&times;</button>
              </div>
              <div className="p-6 bg-stone-50">
                 <p className="text-sm text-slate-500 mb-4">Position the book's QR code inside the frame to automatically extract the ISBN.</p>
                 <div id="qr-reader-tx" className="mx-auto overflow-hidden rounded-xl border-2 border-indigo-200 bg-black"></div>
              </div>
              <div className="p-4 bg-white border-t border-stone-100">
                <button onClick={() => setIsScanning(false)} className="w-full px-4 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-stone-200">Cancel Scanning</button>
              </div>
           </div>
        </div>
      )}
      
      {transactionToMarkLost && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-8 text-center">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Mark Book as Lost?</h3>
            <p className="text-slate-500 text-sm mb-8">Are you sure you want to mark <span className="font-bold">"{transactionToMarkLost.book_title}"</span> as lost?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setTransactionToMarkLost(null)} className="px-6 py-3 rounded-lg font-bold text-slate-600 w-1/2 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={confirmMarkLost} className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold w-1/2 hover:bg-red-700 transition-colors">Yes, Mark Lost</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Transactions;