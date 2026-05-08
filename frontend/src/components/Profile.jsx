function Profile({ user, showNotification }) {
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
                onClick={() => showNotification('Password change feature coming soon.', 'success')}
                className="bg-stone-50 hover:bg-stone-100 text-slate-700 px-4 py-2 rounded-lg border border-stone-200 text-sm font-bold transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;