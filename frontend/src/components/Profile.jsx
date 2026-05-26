import { useState } from 'react';
import api from '../api';

function Profile({ user, showNotification }) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password) => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasLength && hasUpper && hasNumber && hasSymbol;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return showNotification("New passwords do not match!", "error");
    }
    if (!validatePassword(passwords.new_password)) {
      return showNotification("Password does not meet the requirements.", "error");
    }

    setIsConfirmModalOpen(true);
  };

  const confirmAndSubmitPassword = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/users/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      showNotification("Password successfully updated!", "success");
      setIsConfirmModalOpen(false);
      setIsPasswordModalOpen(false);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      showNotification(error.response?.data?.detail || "Error changing password.", "error");
      setIsConfirmModalOpen(false); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="h-32 bg-[#14291c] relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-[#e6a83a] rounded-full border-4 border-white flex items-center justify-center text-4xl font-serif text-[#14291c] shadow-md">
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <h2 className="text-2xl font-serif font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
          <p className="text-emerald-600 font-medium mb-6 uppercase tracking-wider text-xs">{user?.role || 'User'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 pt-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    {user?.role === 'STUDENT' ? 'Student Number' : user?.role === 'TEACHER' || user?.role === 'LIBRARIAN' ? 'Employee Number' : 'Admin ID'}
                  </p>
                  <p className="font-medium text-slate-900">
                    {user?.role === 'STUDENT' ? (user?.student_profile?.student_id_number || user?.username) : 
                     user?.role === 'TEACHER' ? (user?.teacher_profile?.employee_id || user?.username) : 
                     user?.username}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email Address</p>
                  <p className="font-medium text-slate-900">{user?.email || 'Not provided'}</p>
                </div>
                
                {user?.role === 'STUDENT' && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Course</p>
                      <p className="font-medium text-slate-900">{user?.student_profile?.course || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Year Level</p>
                      <p className="font-medium text-slate-900">{user?.student_profile?.year_level ? `Year ${user.student_profile.year_level}` : 'Not specified'}</p>
                    </div>
                  </>
                )}

                {user?.role === 'TEACHER' && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Department</p>
                    <p className="font-medium text-slate-900">{user?.teacher_profile?.department || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security</h4>
              <p className="text-sm text-slate-500 mb-4">Keep your account secure by updating your password regularly.</p>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-stone-50 hover:bg-stone-100 text-slate-700 px-4 py-2 rounded-lg border border-stone-200 text-sm font-bold transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-white">Change Password</h3>
              <button onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswords({ old_password: '', new_password: '', confirm_password: '' });
              }} className="text-emerald-200 hover:text-white text-xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handlePreSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwords.old_password} 
                  onChange={(e) => setPasswords({...passwords, old_password: e.target.value})} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwords.new_password} 
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                />
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-700">Password must contain:</p>
                  <ul className="list-disc pl-5 text-[10px] text-slate-500 mt-1">
                    <li>At least 8 characters, 1 uppercase, 1 number, and 1 symbol</li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  value={passwords.confirm_password} 
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button type="button" onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswords({ old_password: '', new_password: '', confirm_password: '' });
                }} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-stone-200">
                  Cancel
                </button>
                <button type="submit" className="bg-[#14291c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#0c1a11] transition-colors shadow-md">
                  Review & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-stone-100 p-8 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">⚠️</div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-3">Update Password?</h3>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to change your account password? You will use this new password on your next login.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting} className="px-6 py-3 rounded-lg font-bold text-slate-600 w-1/2 hover:bg-slate-100 transition-colors border border-stone-200">
                  Cancel
                </button>
                <button onClick={confirmAndSubmitPassword} disabled={isSubmitting} className="bg-amber-600 text-white px-6 py-3 rounded-lg font-bold w-1/2 hover:bg-amber-700 transition-colors shadow-md disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Yes, Update'}
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default Profile;