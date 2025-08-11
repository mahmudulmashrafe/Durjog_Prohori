import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPhone, FaLock, FaUser, FaIdCard, FaHome } from 'react-icons/fa';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithPhone, verifyOtp } = useAuth();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginWithPhone(phoneNumber);
      if (result.success) {
        setShowOtpInput(true);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(phoneNumber, otp);
      if (result.success) {
        if (result.needsRegistration) {
          setNeedsRegistration(true);
          setError('');
        } else {
          navigate('/user/home');
        }
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !name) {
      setError('Username and name are required');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOtp(phoneNumber, otp, { username, name });
      if (result.success) {
        navigate('/user/home');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6 sm:py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-primary">
            {needsRegistration ? 'Complete Your Profile' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            {needsRegistration 
              ? 'Almost there! Just provide a username and your name' 
              : showOtpInput 
                ? 'Enter the OTP sent to your phone' 
                : 'Sign in with your phone number'}
          </p>
        </div>

        {!needsRegistration ? (
          <form className="mt-6 space-y-5" onSubmit={showOtpInput ? handleOtpSubmit : handlePhoneSubmit}>
            <div className="space-y-4">
              {!showOtpInput ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone-number"
                    type="tel"
                    required
                    className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength="6"
                    className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}
            </div>

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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Processing...'
                ) : showOtpInput ? (
                  'Verify OTP'
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center text-sm">
              <Link 
                to="/home" 
                className="flex items-center text-primary hover:text-primary-dark transition-colors transform hover:scale-105 mt-2"
              >
                <FaHome className="mr-2" />
                <span>Back To Home</span>
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleRegistrationSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                  placeholder="Username (unique)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:z-10 text-sm transition-colors duration-200"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
            
            <div className="flex items-center justify-center text-sm">
              <Link 
                to="/home" 
                className="flex items-center text-primary hover:text-primary-dark transition-colors transform hover:scale-105 mt-2"
              >
                <FaHome className="mr-2" />
                <span>Back To Home</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 