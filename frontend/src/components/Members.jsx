import { useState } from 'react';
import api from '../api';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

function Members({ members, isLoadingMembers, fetchMembers, showNotification }) {
  const [addingMember, setAddingMember] = useState(false);

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', password: '', confirmPassword: ''
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

    if (newUser.password !== newUser.confirmPassword) {
      return showNotification("Passwords do not match!", "error");
    }

    if (newUser.password.length < 8) {
       return showNotification("Password must be at least 8 characters long.", "error");
    }

    try {
      await api.post('/users/', newUser);
      showNotification("Member successfully registered!", "success");
      setAddingMember(false);
      setNewUser({ username: '', first_name: '', last_name: '', email: '', role: 'STUDENT', password: '', confirmPassword: '' });
  
      setShowRegPassword(false);
      setShowRegConfirmPassword(false);
      
      fetchMembers();
    } catch (error) {
      showNotification(error.response?.data?.username?.[0] || error.response?.data?.detail || "Error registering member.", "error");
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Register New Member</h3>
              <button 
                onClick={() => {
                  setAddingMember(false);
                  setShowRegPassword(false);
                  setShowRegConfirmPassword(false);
                }} 
                className="text-emerald-200 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                  <select 
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626] cursor-pointer"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="LIBRARIAN">Librarian</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                  <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="First Name" value={newUser.first_name} onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} required />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                  <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} required />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Email Address" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {newUser.role === 'STUDENT' ? 'Student Number (Login ID)' : newUser.role === 'TEACHER' || newUser.role === 'LIBRARIAN' ? 'Employee Number (Login ID)' : 'Username'}
                  </label>
                  <input className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder={newUser.role === 'STUDENT' ? 'e.g. 2026-00001' : 'e.g. EMP-0001'} value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} required />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Default Password</label>
                  <div className="relative">
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      className="w-full pr-10 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" 
                      placeholder="Assign a password" 
                      value={newUser.password} 
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                      required minLength="8" 
                    />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a3626] transition-colors">
                      {showRegPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showRegConfirmPassword ? "text" : "password"} 
                      className="w-full pr-10 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3626]" 
                      placeholder="Confirm password" 
                      value={newUser.confirmPassword} 
                      onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} 
                      required minLength="8" 
                    />
                    <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a3626] transition-colors">
                      {showRegConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-[11px] text-slate-500 mt-1 px-1">
                  <p className="font-bold text-slate-700 mb-0.5">Password must contain:</p>
                  <ul className="list-disc pl-5 space-y-0">
                    <li>At least 8 characters, 1 uppercase, 1 number, and 1 symbol</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={() => {
                    setAddingMember(false);
                    setShowRegPassword(false);
                    setShowRegConfirmPassword(false);
                  }} 
                  className="w-1/3 px-4 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="w-2/3 bg-[#1a3626] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#12261a] transition-all shadow-md">
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;