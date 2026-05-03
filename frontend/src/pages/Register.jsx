import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    try {

      await api.post('users/register/', {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: formData.role
      });
      navigate('/login'); 
    } catch (err) {

      const serverError = err.response?.data;
      if (serverError && typeof serverError === 'object') {
        const firstKey = Object.keys(serverError)[0];
        const message = serverError[firstKey];

        setError(`${firstKey.replace('_', ' ').toUpperCase()}: ${message}`);
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border border-stone-100">
        <div className="hidden md:flex md:w-1/3 bg-[#1a3626] p-10 flex-col text-white">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-bold">L</div>
            <span className="font-bold tracking-tight">LibTrack</span>
          </div>
          <div className="space-y-8">
            <div className="flex items-center gap-4 opacity-100">
              <div className="w-8 h-8 rounded-full border-2 border-yellow-500 flex items-center justify-center text-xs font-bold text-yellow-500">1</div>
              <p className="text-sm font-semibold">Account Details</p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-emerald-100/30 uppercase tracking-widest font-bold">© BugSplat</p>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Create Account</p>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Sign Up for LibTrack</h2>

          {error && <div className="mb-6 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="col-span-2 sm:col-span-2 mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">I am registering as a:</label>
              <select 
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626] cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            <input className="col-span-1 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="First Name" onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
            <input className="col-span-1 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Last Name" onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
            <input className="col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Email Address" type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            <input className="col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
            <input className="col-span-1 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Password" type="password" onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength="8" />
            <input className="col-span-1 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a3626]" placeholder="Confirm Password" type="password" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required minLength="8" />

            <div className="col-span-2 sm:col-span-2 text-xs text-slate-500 -mt-2 mb-2 px-1">
              <p className="font-bold text-slate-700 mb-1">Password must contain:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>At least 8 characters</li>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 number</li>
                <li>At least 1 symbol (e.g., @, #, $, !)</li>
              </ul>
            </div>

            <button type="submit" className="col-span-2 mt-4 bg-[#1a3626] text-white py-3 rounded-lg font-bold hover:bg-[#12261a] transition-all">Register →</button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-[#1a3626] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;