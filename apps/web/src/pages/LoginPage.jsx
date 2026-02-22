import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - SMART OSH Risk Analysis System</title>
        <meta name="description" content="Login to SMART OSH Advanced Risk Analysis System for industrial safety management" />
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Hero Section with Background Image */}
        <div className="w-full lg:w-1/2 relative overflow-hidden min-h-[300px] lg:min-h-screen flex-shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://horizons-cdn.hostinger.com/425bf382-7a3e-4a78-95ce-bbe7a5d88818/4e55416415547da0dedf903de5d57324.jpg)' }}
          />
          {/* Dark blue gradient overlay (#0F172A with 60% opacity) */}
          <div className="absolute inset-0 bg-[#0F172A]/60" />
          
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-8 lg:px-12 text-white text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[#F97316] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl font-bold text-white">SO</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
                SMART OSH
              </h1>
              <p className="text-lg lg:text-xl font-light max-w-md mx-auto leading-relaxed">
                Sistem Manajemen Keselamatan dan Kesehatan Kerja Terpadu untuk Politeknik
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-900 flex-grow">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-400">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#F97316] border-gray-300 dark:border-gray-700 rounded focus:ring-[#F97316] bg-white dark:bg-gray-800"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#0F172A] dark:text-[#F97316] hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F172A] dark:bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#1E293B] dark:hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[#0F172A] dark:text-[#F97316] hover:underline transition-all"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;