import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.target.innerText = "Registering...";

    setTimeout(() => {
      setStep(3); 
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-full max-w-4xl min-h-[550px] overflow-hidden border border-slate-100">
        <div className="bg-slate-900 md:w-2/5 p-10 flex flex-col justify-between">
          <div>
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-white tracking-tight">LibTrack</h1>
              <p className="text-sm text-indigo-400 mt-1">Library Management System</p>
            </div>

            <div className="space-y-8 relative">

              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-sm transition-colors ${step >= 1 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {step > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${step >= 1 ? 'text-white' : 'text-slate-400'}`}>Personal Info</p>
                </div>
              </div>

              <div className="absolute left-3.75 top-7.5 bottom-12.5 w-0.5 bg-slate-800 z-0">
                <div className="bg-indigo-500 w-full transition-all duration-500" style={{ height: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-sm transition-colors ${step >= 2 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {step > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${step >= 2 ? 'text-white' : 'text-slate-400'}`}>Account Setup</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-sm transition-colors ${step >= 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  3
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${step >= 3 ? 'text-white' : 'text-slate-400'}`}>Confirmation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </div>
        </div>

        <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
          
          {step < 3 && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-slate-900">Create Account</h2>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="john.doe@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="+63 (912) 000-0000" />
              </div>
              
              <div className="pt-6 flex justify-end">
                <button onClick={() => setStep(2)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="johndela" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="••••••••" />
                <p className="text-[10px] text-slate-400 mt-2">Password must be at least 8 characters with uppercase, lowercase, and numbers.</p>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <p className="text-xs text-slate-600">
                  I agree to the <a href="#" className="text-indigo-600 font-medium">Terms & Conditions</a> and <a href="#" className="text-indigo-600 font-medium">Privacy Policy</a>
                </p>
              </div>

              <div className="pt-6 flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-medium text-sm px-4 py-2 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleRegister} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md">
                  Register
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-emerald-600" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Complete!</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
                Your account has been created successfully. You can now sign in to LibTrack to explore the catalog.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 border border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <span className="text-slate-500">Name:</span>
                  <span className="col-span-2 font-medium text-slate-900">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <span className="text-slate-500">Email:</span>
                  <span className="col-span-2 font-medium text-slate-900">{formData.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-500">Username:</span>
                  <span className="col-span-2 font-medium text-slate-900">{formData.username}</span>
                </div>
              </div>

              <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors">
                Go to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;