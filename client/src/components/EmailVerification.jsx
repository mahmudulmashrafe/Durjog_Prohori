import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/verify-email', {
        email,
        verificationCode
      });

      if (response.data.success) {
        // Store the token and redirect to dashboard
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/resend-verification', { email });
      alert(t('verificationCodeResent'));
    } catch (err) {
      setError(err.response?.data?.message || t('resendCodeFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('verifyEmail')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('verificationCodeSent', { email })}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="verification-code" className="sr-only">
                {t('verificationCode')}
              </label>
              <input
                id="verification-code"
                name="code"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder={t('enterVerificationCode')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-primary hover:text-primary-dark"
              disabled={loading}
            >
              {t('resendCode')}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? t('verifying') : t('verifyEmail')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification; 