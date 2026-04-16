import React from 'react';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

const Login = () => {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-slate-50 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">LibTrack</h1>
          </div>
          <h2 className="text-5xl font-serif mb-12 text-slate-100 leading-tight">
            Your library, <br />
            <span className="text-indigo-400">organized at last.</span>
          </h2>

          <div className="space-y-8">
            <FeatureItem 
              icon={BookOpen} 
              title="2,400+" 
              subtitle="Books managed" 
              desc="Comprehensive cataloging and organization system." 
            />
            <FeatureItem 
              icon={Users} 
              title="340+" 
              subtitle="Active Borrowers" 
              desc="Track and manage member activity with ease." 
            />
            <FeatureItem 
              icon={TrendingUp} 
              title="99%" 
              subtitle="Return Rate" 
              desc="Automated reminders ensure timely returns." 
            />
          </div>
        </div>
        <p className="text-sm text-slate-500">© 2026 LibTrack. All rights reserved.</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-2">Welcome back! Please enter your details.</p>
          </div>

          <form className="space-y-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>

            <button type="button" className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don't have an account? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Create account</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, subtitle, desc }) => (
  <div className="flex gap-4">
    <div className="p-3 bg-slate-800 rounded-xl h-fit">
      <Icon className="text-indigo-400" size={24} />
    </div>
    <div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="text-sm font-medium text-slate-300">{subtitle}</p>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

export default Login;