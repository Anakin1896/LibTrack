import { useState } from 'react';
import api from '../api';

function Members({ members, isLoadingMembers, fetchMembers, showNotification }) {
  const [addingMember, setAddingMember] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', password: 'libtrackpassword123'
  });

  const handleAddMember = async (e) => {
    e.preventDefault();
    const id = newUser.username;
    const role = newUser.role;

    if (role === 'STUDENT') {
      if (!/^\d{4}-\d{5}$/.test(id)) return showNotification("Invalid Student ID format. Must be YYYY-NNNNN", "error");
    } else {
      if (!/^EMP-\d{4}$/.test(id)) return showNotification("Invalid Employee ID format. Must be EMP-NNNN", "error");
    }

    try {
      await api.post('/users/', newUser);
      showNotification("Member successfully registered!", "success");
      setAddingMember(false);
      setNewUser({ username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', password: 'libtrackpassword123' });
      fetchMembers();
    } catch (error) {
      showNotification(error.response?.data?.username?.[0] || "Error registering member.", "error");
    }
  };

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
              <tr><td colSpan="4" className="p-6 text-center text-slate-500">No members found.</td></tr>
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

      {addingMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Register New Member</h3>
              <button onClick={() => setAddingMember(false)} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="LIBRARIAN">Librarian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {newUser.role === 'STUDENT' ? 'Student Number (Login ID)' : newUser.role === 'TEACHER' || newUser.role === 'LIBRARIAN' ? 'Employee Number (Login ID)' : 'Username'}
                </label>
                <input required value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" placeholder={newUser.role === 'STUDENT' ? 'e.g. 2024-12345' : 'e.g. EMP-0012'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label><input required value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label><input required value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label><input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setAddingMember(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#14291c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md">Register Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;