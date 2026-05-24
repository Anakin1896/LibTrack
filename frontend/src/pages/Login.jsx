import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/users/login/', {
        username: userId,
        password: password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      setTimeout(() => {
        navigate('/dashboard');
      }, 100);

    } catch (err) {
      console.error("Login failed:", err);
      
      if (err.response?.data?.detail === "password_change_required") {
        setShowPasswordModal(true);
        return; 
      }

      setError(err.response?.data?.detail || "Login failed. Check your ID and password.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (newPassword !== confirmPassword) {
      setModalError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setModalError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await api.post('/users/change-password/', {
        username: userId,
        old_password: password,
        new_password: newPassword
      });

      setShowPasswordModal(false);
      setPassword(newPassword);
      
      setTimeout(() => {
        api.post('/users/login/', { username: userId, password: newPassword })
          .then(response => {
             localStorage.setItem('access_token', response.data.access);
             localStorage.setItem('refresh_token', response.data.refresh);
             navigate('/dashboard');
          });
      }, 100);

    } catch (err) {
      setModalError(err.response?.data?.error || "Failed to change password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFCF8] font-sans relative">
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-[#14291c] p-4 px-6">
              <h3 className="font-serif font-bold text-lg text-white">Welcome! Please secure your account.</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-8">
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Since this is your first time logging in, you are required to change your default password to something secure.
              </p>

              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 mb-4">
                  {modalError}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                      placeholder="At least 8 characters"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14291c] transition-colors">
                      {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#14291c]" 
                      placeholder="Type it again"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#14291c] transition-colors">
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword(''); 
                    setNewPassword('');
                    setConfirmPassword('');
                  }} 
                  className="w-1/3 px-4 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-2/3 bg-[#14291c] text-white px-4 py-3 rounded-lg font-bold hover:bg-[#0c1a11] transition-all shadow-md text-sm"
                >
                  Update & Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-5/12 bg-[#1a3626] text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#e6a83a] rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-xl font-bold text-[#14291c]">L</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">LibTrack</h1>
          </div>

          <h2 className="text-5xl font-serif font-bold leading-tight mb-6">
            Your library,<br/>
            <span className="text-[#e6a83a] italic">organized</span><br/>
            at last.
          </h2>
          
          <p className="text-emerald-100/70 text-lg leading-relaxed max-w-md">
            Manage books, track borrowings, monitor due dates, and keep your library running smoothly — all in one place.
          </p>
        </div>

        <div className="flex gap-8 mt-12 relative z-10 border-t border-emerald-800/50 pt-8">
          <div>
            <p className="text-3xl font-bold text-[#e6a83a] mb-1">2,400+</p>
            <p className="text-sm text-emerald-100/50">Books Managed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#e6a83a] mb-1">340</p>
            <p className="text-sm text-emerald-100/50">Active Borrowers</p>
          </div>
        </div>
        <div className="mt-auto pt-10">
            <p className="text-emerald-100/30 text-xs tracking-widest font-bold">
                © <span className="text-[#e6a83a]/60">BugSplat</span>
            </p>
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-[#e6a83a] rounded-md flex items-center justify-center">
              <span className="text-lg font-bold text-[#14291c]">L</span>
            </div>
            <h1 className="text-xl font-bold text-[#1a3626]">LibTrack</h1>
          </div>

          <p className="text-sm font-bold tracking-widest text-emerald-800 uppercase mb-2">Welcome Back</p>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Sign in to LibTrack</h2>
          <p className="text-slate-500 mb-10">Enter your credentials to continue.</p>

          <form onSubmit={handleLogin} className="space-y-6">

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Student / Employee ID
              </label>
              <input 
                type="text" 
                placeholder="e.g. 2026-00001 or EMP-001"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3626] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3626] transition-all"
                  required
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a3626] transition-colors">
                  {showLoginPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#1a3626] rounded border-gray-300 focus:ring-[#1a3626]" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[#1a3626] hover:underline">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#14291c] hover:bg-[#0c1a11] text-white font-semibold rounded-lg shadow-md transition-colors mt-4 flex justify-center items-center gap-2"
            >
              Sign In <span>→</span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <span className="font-bold text-[#1a3626]">
                Contact Librarian
              </span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;