import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { confirmPasswordReset } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await confirmPasswordReset(token, formData.password, formData.passwordConfirm);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - SMART OSH Risk Analysis System</title>
        <meta name="description" content="Set a new password for your SMART OSH account" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a52] to-[#ff6b35] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">SO</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Password Reset Successful
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your password has been reset successfully. Redirecting to login...
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-[#1a3a52] dark:bg-[#ff6b35] text-white text-center font-semibold rounded-lg hover:bg-[#2a4a62] dark:hover:bg-[#ff7b45] transition-colors"
                >
                  Go to Login
                </Link>
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
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a3a52] dark:focus:ring-[#ff6b35] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                          <span className={`text-xs font-medium ${passwordStrength <= 1 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {getStrengthText()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a3a52] dark:focus:ring-[#ff6b35] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Confirm new password"
                        required
                      />
                      {formData.passwordConfirm && formData.password === formData.passwordConfirm && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
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
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;