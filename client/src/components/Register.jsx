import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
      checks: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  };

  useEffect(() => {
    const validation = validatePassword(formData.password);
    setPasswordChecks(validation.checks);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      const errors = [];
      if (!passwordValidation.checks.minLength) errors.push('at least 8 characters');
      if (!passwordValidation.checks.hasUpper) errors.push('one uppercase letter');
      if (!passwordValidation.checks.hasLower) errors.push('one lowercase letter');
      if (!passwordValidation.checks.hasNumber) errors.push('one number');
      if (!passwordValidation.checks.hasSpecial) errors.push('one special character');
      
      setError(`Password must contain ${errors.join(', ')}`);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        navigate('/verify-email', { state: { email: formData.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ satisfied, text }) => (
    <div className="flex items-center space-x-2">
      {satisfied ? (
        <FaCheck className="text-green-500 h-3 w-3" />
      ) : (
        <FaTimes className="text-gray-300 h-3 w-3" />
      )}
      <span className={`text-[11px] sm:text-xs ${satisfied ? 'text-green-500' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6 sm:py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-primary">
            Create Account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            Join us to get started with your journey
          </p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 sm:p-4 animate-shake">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-500">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="mt-2 space-y-1.5">
                <PasswordRequirement satisfied={passwordChecks.minLength} text="At least 8 characters" />
                <PasswordRequirement satisfied={passwordChecks.hasUpper} text="One uppercase letter" />
                <PasswordRequirement satisfied={passwordChecks.hasLower} text="One lowercase letter" />
                <PasswordRequirement satisfied={passwordChecks.hasNumber} text="One number" />
                <PasswordRequirement satisfied={passwordChecks.hasSpecial} text="One special character (!@#$%^&*)" />
              </div>
            </div>
            <div className="relative">
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaUserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:text-gray-100" />
              </span>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
          <span className="text-gray-500">Already have an account?</span>
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors duration-150"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 