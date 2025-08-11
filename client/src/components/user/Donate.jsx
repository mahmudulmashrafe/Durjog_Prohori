import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaDonate } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Donate = () => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [donationLoading, setDonationLoading] = useState(false);
  const [recentDonations, setRecentDonations] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 3;

  // Get current user info from local storage or auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.user) {
          setCurrentUserInfo(response.data.user);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setCurrentUserInfo(parsedUserData);
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }
      }
    };
    
    fetchCurrentUser();
    fetchRecentDonations();
  }, []);

  // Fetch recent donations
  const fetchRecentDonations = async () => {
    try {
      setDonationLoading(true);
      const userId = currentUserInfo?._id;
      
      if (!userId) {
        console.log('No user ID available, skipping donation fetch');
        setRecentDonations([]);
        return;
      }

      const response = await axios.get(`/api/support/user/${userId}`);
      
      if (response.data.success) {
        const supportPayments = response.data.data.map(payment => ({
          ...payment,
          amount: payment.amount,
          name: payment.name,
          timestamp: payment.createdAt,
          type: 'Support Payment',
          status: payment.status
        }));
        
        setRecentDonations(supportPayments);
      }
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      toast.error('Failed to fetch donation history');
    } finally {
      setDonationLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserInfo?._id) {
      fetchRecentDonations();
    }
  }, [currentUserInfo]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  // Render donation history
  const renderRecentDonations = () => {
    if (donationLoading) {
      return (
        <div className="text-center py-4">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('loadingDonations')}</p>
        </div>
      );
    }

    if (!currentUserInfo) {
      return (
        <div className="text-center py-4">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('pleaseLogin')}</p>
        </div>
      );
    }

    const filteredDonations = recentDonations.filter(donation =>
      donation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.amount.toString().includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDonations = filteredDonations.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div>
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('searchDonations')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
            } border ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {t('time')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {t('method')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  {t('amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDonations.length > 0 ? (
                paginatedDonations.map((donation, index) => (
                  <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatTimestamp(donation.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {donation.payment_method || donation.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(donation.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm">
                    {t('noDonationsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDonations.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t('previous')}
            </button>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('page', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaDonate className="mr-2" />
            {t('recentDonations')}
          </h2>
          {renderRecentDonations()}
        </div>
      </div>
    </div>
  );
};

export default Donate; 