import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('users/login/', {
        username: username,
        password: password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      navigate('/dashboard'); 
      
    } catch (err) {
      setError('Invalid library credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFCF8] font-sans">

      <div className="hidden lg:flex lg:w-5/12 bg-[#1a3626] text-white p-16 flex-col justify-between relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">L</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">LibTrack</h1>
          </div>

          <h2 className="text-5xl font-serif font-bold leading-tight mb-6">
            Your library,<br/>
            <span className="text-yellow-600 italic">organized</span><br/>
            at last.
          </h2>
          
          <p className="text-emerald-100/70 text-lg leading-relaxed max-w-md">
            Manage books, track borrowings, monitor due dates, and keep your library running smoothly — all in one place.
          </p>
        </div>

        <div className="flex gap-8 mt-12 relative z-10 border-t border-emerald-800/50 pt-8">
          <div>
            <p className="text-3xl font-bold text-yellow-600 mb-1">2,400+</p>
            <p className="text-sm text-emerald-100/50">Books Managed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600 mb-1">340</p>
            <p className="text-sm text-emerald-100/50">Active Borrowers</p>
          </div>
        </div>
        <div className="mt-auto pt-10">
            <p className="text-emerald-100/30 text-xs tracking-widest uppercase font-bold">
                © <span className="text-yellow-600/60">BugSplat</span>
            </p>
        </div>
      </div>

      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <h1 className="text-xl font-bold text-[#1a3626]">LibTrack</h1>
          </div>

          <p className="text-sm font-bold tracking-widest text-emerald-800 uppercase mb-2">Welcome Back</p>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Sign in to LibTrack</h2>
          <p className="text-slate-500 mb-10">Enter your library credentials to continue.</p>

          <form onSubmit={handleLogin} className="space-y-6">

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <input 
                type="text" 
                placeholder="e.g. jdelacruz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3626] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3626] transition-all"
                required
              />
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
              className="w-full py-3.5 bg-[#1a3626] hover:bg-[#12261a] text-white font-semibold rounded-lg shadow-md transition-colors mt-4 flex justify-center items-center gap-2"
            >
              Sign In <span>→</span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account? <a href="#" className="font-bold text-[#1a3626] hover:underline">Create one</a>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;