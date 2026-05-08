function Members({ members, isLoadingMembers, setAddingMember }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
       <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
         <h3 className="font-serif font-bold text-lg text-slate-900">Registered Users</h3>
         <button onClick={() => setAddingMember(true)} className="bg-[#14291c] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#0c1a11]">
            + Register New Member
         </button>
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
               <tr><td colSpan="4" className="p-6 text-center text-slate-500">No members found. Add one above!</td></tr>
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
  );
}

export default Members;