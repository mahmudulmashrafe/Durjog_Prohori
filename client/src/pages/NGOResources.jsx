import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNGOAuth } from '../context/NGOAuthContext';
import NGOLayout from '../components/ngo/NGOLayout';
import { useLanguage } from '../context/LanguageContext';
import { FaTimes, FaSync } from 'react-icons/fa';

const NGOResources = () => {
  const { ngo } = useNGOAuth();
  const { language } = useLanguage();
  const [donationHistory, setDonationHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    totalreceivedonation: 0,
    totalremaining: 0,
    totalwithdraw: 0
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalDescription, setWithdrawalDescription] = useState('');
  const [withdrawalError, setWithdrawalError] = useState(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('donations');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Current NGO:', ngo);
      console.log('Registration Number:', ngo?.registrationNumber);

      if (!ngo?.registrationNumber) {
        console.error('No registration number available');
        setError(language === 'en' 
          ? 'NGO registration number not found' 
          : 'এনজিও রেজিস্ট্রেশন নম্বর পাওয়া যায়নি');
        return;
      }

      // Fetch donations and totals
      console.log('Fetching donations for NGO:', ngo.registrationNumber);
      const donationsResponse = await axios.get(`/api/ngo-donations/ngo/${ngo.registrationNumber}`);
      console.log('Donations response:', donationsResponse.data);
      
      if (donationsResponse.data.success) {
        setDonationHistory(donationsResponse.data.donations || []);
        setTotals(donationsResponse.data.totals || {
          totalreceivedonation: 0,
          totalremaining: 0,
          totalwithdraw: 0
        });
      }

      // Fetch withdrawal history
      console.log('Fetching withdrawals for NGO:', ngo.registrationNumber);
      const withdrawalsResponse = await axios.get(`/api/ngo-donations/withdrawals/${ngo.registrationNumber}`);
      console.log('Withdrawals response:', withdrawalsResponse.data);
      
      if (withdrawalsResponse.data.success) {
        setWithdrawalHistory(withdrawalsResponse.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      setError(language === 'en' 
        ? 'Failed to load data. Please try again later.' 
        : 'তথ্য লোড করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ngo?.registrationNumber) {
      fetchData();
    } else {
      console.log('Waiting for NGO data...');
    }
  }, [ngo?.registrationNumber, language]);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    try {
      setWithdrawalError(null);
      setWithdrawalSuccess(false);

      const amount = Number(withdrawalAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawalError(language === 'en' 
          ? 'Please enter a valid amount' 
          : 'একটি বৈধ পরিমাণ লিখুন');
        return;
      }

      if (amount > totals.totalremaining) {
        setWithdrawalError(language === 'en' 
          ? 'Insufficient balance' 
          : 'অপর্যাপ্ত ব্যালেন্স');
        return;
      }

      const response = await axios.post('/api/ngo-donations/withdraw', {
        ngoId: ngo.registrationNumber,
        amount,
        description: withdrawalDescription
      });

      if (response.data.success) {
        setWithdrawalSuccess(true);
        setWithdrawalAmount('');
        setWithdrawalDescription('');
        
        // Refresh data
        const donationsResponse = await axios.get(`/api/ngo-donations/ngo/${ngo.registrationNumber}`);
        if (donationsResponse.data.success) {
          setTotals(donationsResponse.data.totals);
        }
        const withdrawalsResponse = await axios.get(`/api/ngo-donations/withdrawals/${ngo.registrationNumber}`);
        if (withdrawalsResponse.data.success) {
          setWithdrawalHistory(withdrawalsResponse.data.withdrawals);
        }

        // Close modal after successful withdrawal
        setTimeout(() => {
          setShowWithdrawalModal(false);
          setWithdrawalSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      setWithdrawalError(language === 'en' 
        ? 'Failed to process withdrawal. Please try again.' 
        : 'উত্তোলন প্রক্রিয়া করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <NGOLayout>
      <div className="h-screen overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Totals Section with Withdraw and Refresh Buttons */}
          <div className="flex justify-between items-start mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {language === 'en' ? 'Total Received' : 'মোট প্রাপ্ত'}
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ৳ {totals.totalreceivedonation.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {language === 'en' ? 'Available Balance' : 'উপলব্ধ ব্যালেন্স'}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  ৳ {totals.totalremaining.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {language === 'en' ? 'Total Withdrawn' : 'মোট উত্তোলন'}
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  ৳ {totals.totalwithdraw.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-4 ml-4">
              <button
                onClick={fetchData}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                disabled={loading}
              >
                <FaSync className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{language === 'en' ? 'Refresh' : 'রিফ্রেশ'}</span>
              </button>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>{language === 'en' ? 'Withdraw Funds' : 'অর্থ উত্তোলন'}</span>
              </button>
            </div>
          </div>

          {/* History Section with Tabs */}
          <div className="bg-white rounded-lg shadow">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'donations'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {language === 'en' ? 'Donation History' : 'দান ইতিহাস'}
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'withdrawals'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {language === 'en' ? 'Withdrawal History' : 'উত্তোলন ইতিহাস'}
                </button>
              </nav>
            </div>

            {/* Table Container with Increased Height */}
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                  </div>
                </div>
              ) : activeTab === 'donations' ? (
                donationHistory.length > 0 ? (
                  <div className="relative">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-600 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Date' : 'তারিখ'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Amount' : 'পরিমাণ'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Status' : 'স্থিতি'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Description' : 'বিবরণ'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donationHistory.map((donation, index) => (
                          <tr key={donation._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(donation.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ৳ {donation.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {donation.status || (language === 'en' ? 'Completed' : 'সম্পন্ন')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {donation.description || (language === 'en' ? 'Donation received' : 'অনুদান গৃহীত হয়েছে')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'en' 
                      ? 'No donation history available' 
                      : 'কোন দান ইতিহাস উপলব্ধ নেই'}
                  </div>
                )
              ) : withdrawalHistory.length > 0 ? (
                <div className="relative">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-600 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {language === 'en' ? 'Date' : 'তারিখ'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {language === 'en' ? 'Amount' : 'পরিমাণ'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {language === 'en' ? 'Status' : 'স্থিতি'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {language === 'en' ? 'Description' : 'বিবরণ'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {withdrawalHistory.map((withdrawal, index) => (
                        <tr key={withdrawal._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(withdrawal.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ৳ {withdrawal.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              withdrawal.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {withdrawal.status === 'completed' 
                                ? (language === 'en' ? 'Completed' : 'সম্পন্ন') 
                                : (language === 'en' ? 'Pending' : 'বিচারাধীন')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {withdrawal.description || (language === 'en' ? 'No description provided' : 'কোন বিবরণ দেওয়া হয়নি')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {language === 'en' 
                    ? 'No withdrawal history available' 
                    : 'কোন উত্তোলন ইতিহাস উপলব্ধ নেই'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {language === 'en' ? 'Withdraw Funds' : 'অর্থ উত্তোলন'}
              </h2>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Amount' : 'পরিমাণ'}
                  </label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder={language === 'en' ? 'Enter amount' : 'পরিমাণ লিখুন'}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'en' ? 'Description (Optional)' : 'বিবরণ (ঐচ্ছিক)'}
                  </label>
                  <textarea
                    value={withdrawalDescription}
                    onChange={(e) => setWithdrawalDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder={language === 'en' ? 'Enter description' : 'বিবরণ লিখুন'}
                    rows="3"
                  />
                </div>
                {withdrawalError && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                    {withdrawalError}
                  </div>
                )}
                {withdrawalSuccess && (
                  <div className="text-green-600 text-sm p-2 bg-green-50 rounded">
                    {language === 'en' 
                      ? 'Withdrawal processed successfully' 
                      : 'উত্তোলন সফলভাবে প্রক্রিয়া করা হয়েছে'}
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {language === 'en' ? 'Withdraw' : 'উত্তোলন করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </NGOLayout>
  );
};

export default NGOResources; 