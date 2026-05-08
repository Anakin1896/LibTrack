function Transactions({ 
  newTx, setNewTx, handleIssueBook, txFilter, setTxFilter, 
  isLoadingTx, displayedTransactions, getTxStatus, 
  setTransactionToMarkLost, handleReturnBook 
}) {
  return (
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
                         <td className="p-4 font-medium text-slate-700">{new Date(tx.due_date).toLocaleDateString()}</td>
                         <td className="p-4">
                           <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border ${status.style}`}>
                             {status.text}
                           </span>
                         </td>
                         <td className="p-4 text-right pr-6">
                           {tx.status === 'ACTIVE' ? (
                             <div className="flex items-center justify-end gap-3">
                               <button onClick={() => setTransactionToMarkLost(tx)} className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">Lost?</button>
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
  );
}

export default Transactions;