import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - SMART OSH Risk Analysis System</title>
        <meta name="description" content="Reset your SMART OSH account password" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52] to-[#ff6b35] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">SO</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-600 dark:text-gray-400">
                No worries, we'll send you reset instructions
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Check your email
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        We've sent password reset instructions to <strong>{email}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setSuccess(false)}
                      className="text-[#1a3a52] dark:text-[#ff6b35] hover:underline font-medium"
                    >
                      try again
                    </button>
                  </p>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1a3a52] dark:text-[#ff6b35] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
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
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a3a52] dark:focus:ring-[#ff6b35] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="your.email@company.com"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1a3a52] dark:bg-[#ff6b35] text-white font-semibold rounded-lg hover:bg-[#2a4a62] dark:hover:bg-[#ff7b45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1a3a52] dark:text-[#ff6b35] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;