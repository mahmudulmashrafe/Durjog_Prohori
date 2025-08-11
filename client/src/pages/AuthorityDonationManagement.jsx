import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import AuthorityLayout from '../components/authority/AuthorityLayout';
import { FaMoneyBillWave, FaHandHoldingHeart, FaExchangeAlt, FaTimes, FaFileDownload, FaSync, FaHistory } from 'react-icons/fa';

const AuthorityDonationManagement = () => {
  const { language } = useLanguage();
  const AUTHORITY_COLOR = 'rgb(88, 10, 107)';

  // State for donation data
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState({ donations: false, ngos: false });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalDonations: 0,
    totalDistributed: 0,
    remainingBalance: 0
  });

  // State for distribution modal
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [distributionAmount, setDistributionAmount] = useState('');

  // Fetch donations data
  useEffect(() => {
    fetchDonationData();
    fetchNgoData();
  }, []);

  const fetchDonationData = async () => {
    try {
      const response = await axios.get('/api/support');
      if (response.data.success) {
        setDonations(response.data.supports);
        
        // Calculate metrics
        const total = response.data.supports.reduce((acc, support) => acc + support.amount, 0);
        const distributed = response.data.distributedAmount || 0;
        
        setMetrics({
          totalDonations: total,
          totalDistributed: distributed,
          remainingBalance: total - distributed
        });
      } else {
        console.error('Failed to fetch supports:', response.data.message);
        
        // Use mock data for development if API fails
        const mockData = generateMockDonations();
        setDonations(mockData);
        
        // Calculate mock metrics
        const total = mockData.reduce((acc, donation) => acc + donation.amount, 0);
        const distributed = total * 0.4; // 40% distributed for mock
        
        setMetrics({
          totalDonations: total,
          totalDistributed: distributed,
          remainingBalance: total - distributed
        });
      }
    } catch (err) {
      console.error('Error fetching support data:', err);
      
      // Use mock data for development
      const mockData = generateMockDonations();
      setDonations(mockData);
      
      // Calculate mock metrics
      const total = mockData.reduce((acc, donation) => acc + donation.amount, 0);
      const distributed = total * 0.4; // 40% distributed for mock
      
      setMetrics({
        totalDonations: total,
        totalDistributed: distributed,
        remainingBalance: total - distributed
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNgoData = async () => {
    try {
      const response = await axios.get('/api/donations/ngos');
      if (response.data.success) {
        // Add createdAt date and ensure all required fields exist
        const processedNgos = response.data.ngos.map(ngo => ({
          ...ngo,
          totalreceivedonation: ngo.totalreceivedonation || 0,
          lastdonate: ngo.lastdonate || ngo.createdAt || new Date().toISOString(),
          registrationNumber: ngo.registrationNumber || 'N/A',
          phoneNumber: ngo.phoneNumber || ngo.phone || 'N/A'
        }));
        setNgos(processedNgos);
      } else {
        console.error('Failed to fetch NGOs:', response.data.message);
        
        // Use mock data for development
        setNgos(generateMockNgos());
      }
    } catch (err) {
      console.error('Error fetching NGO data:', err);
      
      // Use mock data for development
      setNgos(generateMockNgos());
    }
  };

  // Refresh functions with loading indicators
  const refreshDonations = async () => {
    setRefreshing(prev => ({ ...prev, donations: true }));
    await fetchDonationData();
    setRefreshing(prev => ({ ...prev, donations: false }));
  };

  const refreshNgos = async () => {
    setRefreshing(prev => ({ ...prev, ngos: true }));
    await fetchNgoData();
    setRefreshing(prev => ({ ...prev, ngos: false }));
  };

  // Handle distribution to NGO
  const handleDistribute = async () => {
    if (!selectedNgo || !distributionAmount || isNaN(distributionAmount) || Number(distributionAmount) <= 0) {
      alert(language === 'en' ? 'Please select an NGO and enter a valid amount' : 'অনুগ্রহ করে একটি এনজিও নির্বাচন করুন এবং একটি বৈধ পরিমাণ লিখুন');
      return;
    }

    if (Number(distributionAmount) > metrics.remainingBalance) {
      alert(language === 'en' ? 'Insufficient funds for distribution' : 'বিতরণের জন্য অপর্যাপ্ত তহবিল');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Starting distribution with NGO:', {
        ngo: selectedNgo,
        amount: distributionAmount
      });

      const currentDate = new Date();
      
      // First operation: Save to ngoDonation collection
      const ngoDonationPayload = {
        ngoId: selectedNgo.registrationNumber,
        ngoName: selectedNgo.name,
        amount: Number(distributionAmount),
        email: selectedNgo.email,
        location: selectedNgo.location,
        withdrawAmount: 0,
        date: currentDate.toISOString()
      };

      console.log('Saving to ngoDonation collection:', ngoDonationPayload);
      const ngoDonationResponse = await axios.post('/api/ngo-donations', ngoDonationPayload);
      console.log('ngoDonation response:', ngoDonationResponse.data);

      // Update local state immediately after first successful operation
      setMetrics(prev => ({
        ...prev,
        totalDistributed: prev.totalDistributed + Number(distributionAmount),
        remainingBalance: prev.remainingBalance - Number(distributionAmount)
      }));

      // Show success message
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);

      // Reset form and close modal
      setShowDistributionModal(false);
      setSelectedNgo(null);
      setDistributionAmount('');

      // Try to update NGO's totalreceivedonation (but don't show error if it fails)
      try {
        const ngoUpdatePayload = {
          registrationNumber: selectedNgo.registrationNumber,
          amount: Number(distributionAmount)
        };

        console.log('Updating NGO totalreceivedonation:', ngoUpdatePayload);
        await axios.post('/api/ngo-data/update-donation', ngoUpdatePayload);
      } catch (updateErr) {
        console.error('Error updating NGO total received donation:', updateErr);
      }

      // Refresh both tables regardless of second operation result
      await Promise.all([
        fetchNgoData(),
        fetchDonationData()
      ]);

    } catch (err) {
      console.error('Error in first distribution operation:', err);
      alert(language === 'en' ? 'Failed to process donation. Please try again.' : 'দান প্রক্রিয়াকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Fetch NGO donation history
  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ngo-donations');
      
      if (response.data.success && response.data.ngoDonations) {
        console.log('Received NGO donation data:', response.data.ngoDonations);
        
        // Format the data for the history popup
        const formattedHistory = response.data.ngoDonations.map(item => ({
          transactionId: item._id || 'N/A',
          ngoId: item.ngoId || 'N/A',
          ngoName: item.ngoName || 'Unknown NGO',
          email: item.email || 'N/A',
          date: item.date || new Date().toISOString(),
          amount: item.amount || 0
        }));
        
        setHistoryData(formattedHistory);
        setShowHistoryPopup(true);
      } else {
        console.error('Failed to fetch NGO donation history:', response.data?.message || 'Unknown error');
        alert(language === 'en' ? 'Failed to load donation history' : 'দান ইতিহাস লোড করতে ব্যর্থ হয়েছে');
        
        // Use mock data if API fails
        const mockHistory = generateMockNgoDonations().map(item => ({
          transactionId: item._id,
          ngoId: item.ngoId,
          ngoName: item.ngoName,
          email: item.email,
          date: item.date,
          amount: item.amount
        }));
        
        setHistoryData(mockHistory);
        setShowHistoryPopup(true);
      }
    } catch (err) {
      console.error('Error fetching donation history:', err);
      alert(language === 'en' ? 'Error loading donation history' : 'দান ইতিহাস লোড করতে ত্রুটি');
      
      // Use mock data for development
      const mockHistory = generateMockNgoDonations().map(item => ({
        transactionId: item._id,
        ngoId: item.ngoId,
        ngoName: item.ngoName,
        email: item.email,
        date: item.date,
        amount: item.amount
      }));
      
      setHistoryData(mockHistory);
      setShowHistoryPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return language === 'en' ? 'Unknown date' : 'অজানা তারিখ';
    
    try {
      const date = new Date(dateString);
      
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return language === 'en' ? 'Date error' : 'তারিখ ত্রুটি';
    }
  };

  // Generate mock data for development
  const generateMockDonations = () => {
    const mockData = [];
    const names = ['Ahmed Rahman', 'Fatima Begum', 'Karim Ali', 'Nusrat Jahan', 'Mohammed Islam', 'Taslima Khatun'];
    const paymentMethods = ['bkash', 'nagad', 'rocket', 'card'];
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    
    for (let i = 1; i <= 20; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAmount = Math.floor(Math.random() * 9000) + 1000; // 1000 to 10000
      const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      mockData.push({
        _id: 'support_' + i,
        name: randomName,
        phoneNumber: '01' + Math.floor(Math.random() * 1000000000),
        amount: randomAmount,
        paymentMethod: randomPaymentMethod,
        status: randomStatus,
        description: i % 3 === 0 ? 'Support payment for affected people' : 'Support payment',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString() // Random day in last 30 days
      });
    }
    
    return mockData;
  };

  const generateMockNgos = () => {
    return [
      { 
        _id: 'ngo1', 
        name: 'Red Crescent Bangladesh', 
        email: 'info@redcrescent.bd', 
        location: 'Dhaka',
        registrationNumber: 'RC-2023-001',
        phoneNumber: '01712345678',
        totalreceivedonation: 125000,
        createdAt: '2023-01-15T00:00:00.000Z',
        lastdonate: '2023-11-22T14:35:00.000Z'
      },
      { 
        _id: 'ngo2', 
        name: 'BRAC', 
        email: 'info@brac.org', 
        location: 'Dhaka',
        registrationNumber: 'BRAC-2022-105',
        phoneNumber: '01823456789',
        totalreceivedonation: 287500,
        createdAt: '2022-08-10T00:00:00.000Z',
        lastdonate: '2023-12-05T09:20:00.000Z'
      },
      { 
        _id: 'ngo3', 
        name: 'ASA Foundation', 
        email: 'contact@asafoundation.org', 
        location: 'Chittagong',
        registrationNumber: 'ASA-2023-042',
        phoneNumber: '01912345678',
        totalreceivedonation: 92000,
        createdAt: '2023-03-22T00:00:00.000Z',
        lastdonate: '2023-10-18T16:45:00.000Z'
      },
      { 
        _id: 'ngo4', 
        name: 'Sajida Foundation', 
        email: 'help@sajida.org', 
        location: 'Sylhet',
        registrationNumber: 'SF-2022-089',
        phoneNumber: '01612345678',
        totalreceivedonation: 153000,
        createdAt: '2022-11-05T00:00:00.000Z',
        lastdonate: '2024-01-03T11:15:00.000Z'
      },
      { 
        _id: 'ngo5', 
        name: 'Grameen Foundation', 
        email: 'support@grameen.org', 
        location: 'Dhaka',
        registrationNumber: 'GF-2023-021',
        phoneNumber: '01512345678',
        totalreceivedonation: 219500,
        createdAt: '2023-02-18T00:00:00.000Z',
        lastdonate: '2023-12-27T13:40:00.000Z'
      },
    ];
  };

  const generateMockNgoDonations = () => {
    const mockData = [];
    const ngos = generateMockNgos();
    
    for (let i = 1; i <= 8; i++) {
      const randomNgo = ngos[Math.floor(Math.random() * ngos.length)];
      const randomAmount = Math.floor(Math.random() * 20000) + 5000; // 5000 to 25000
      const randomWithdrawn = Math.floor(Math.random() * randomAmount * 0.8); // Up to 80% withdrawn
      
      mockData.push({
        _id: 'ngodist_' + i,
        ngoId: randomNgo._id,
        ngoName: randomNgo.name,
        email: randomNgo.email,
        location: randomNgo.location,
        amount: randomAmount,
        withdrawAmount: randomWithdrawn,
        date: new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000).toISOString() // Random day in last 20 days
      });
    }
    
    return mockData;
  };

  // Export donations to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Amount', 'Location', 'Date'];
    const csvData = donations.map(d => [
      d.name,
      d.email,
      d.amount,
      d.location,
      formatDate(d.createdAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'donations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced success popup with animation
  const SuccessPopup = ({ show }) => {
    if (!show) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
          <div className="mr-3 animate-success-check">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium">
            {language === 'en' ? 'Successfully Distributed!' : 'সফলভাবে বিতরণ করা হয়েছে!'}
          </span>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading && donations.length === 0) {
    return (
      <AuthorityLayout>
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: AUTHORITY_COLOR }}></div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="w-full max-w-full mx-auto -mt-4 mb-8">
        {/* Success Popup */}
        <SuccessPopup show={showSuccessPopup} />

        {/* History Popup */}
        {showHistoryPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-6xl animate-popup">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {language === 'en' ? 'NGO Donation History' : 'এনজিও অনুদান ইতিহাস'}
                </h3>
                <button onClick={() => setShowHistoryPopup(false)} className="text-gray-400 hover:text-gray-500">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: AUTHORITY_COLOR }}></div>
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="text-center p-6 text-gray-500">
                    {language === 'en' ? 'No donation history found' : 'কোন অনুদান ইতিহাস পাওয়া যায়নি'}
                  </div>
                ) : (
                  <div className="relative">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead style={{ backgroundColor: "rgb(88, 10, 107)" }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Transaction ID' : 'লেনদেন আইডি'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'NGO ID' : 'এনজিও আইডি'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'NGO Name' : 'এনজিও নাম'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Email' : 'ইমেইল'}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Date' : 'তারিখ'}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                            {language === 'en' ? 'Amount' : 'পরিমাণ'}
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: "50vh", position: "relative" }}>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {historyData.map((item) => (
                            <tr key={item.transactionId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.transactionId}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.ngoId}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.ngoName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                {item.email}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                {formatDate(item.date)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-right">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t dark:border-gray-700 p-4 flex justify-end">
                <button
                  onClick={() => setShowHistoryPopup(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 p-3 shadow-md rounded-lg mb-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-0">
            {language === 'en' ? 'Donation Management' : 'দান ব্যবস্থাপনা'}
          </h1>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Total Donations */}
          <div className="bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${AUTHORITY_COLOR}20` }}>
                <FaMoneyBillWave className="h-6 w-6" style={{ color: AUTHORITY_COLOR }} />
              </div>
              <div>
                <h2 className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Total Donations' : 'মোট দান'}</h2>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(metrics.totalDonations)}</p>
              </div>
            </div>
          </div>

          {/* Distributed Amount */}
          <div className="bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${AUTHORITY_COLOR}20` }}>
                <FaHandHoldingHeart className="h-6 w-6" style={{ color: AUTHORITY_COLOR }} />
              </div>
              <div>
                <h2 className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Distributed Amount' : 'বিতরণকৃত পরিমাণ'}</h2>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(metrics.totalDistributed)}</p>
              </div>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${AUTHORITY_COLOR}20` }}>
                <FaExchangeAlt className="h-6 w-6" style={{ color: AUTHORITY_COLOR }} />
              </div>
              <div>
                <h2 className="text-sm text-gray-500 dark:text-gray-400">{language === 'en' ? 'Remaining Balance' : 'অবশিষ্ট ব্যালেন্স'}</h2>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{formatCurrency(metrics.remainingBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
          {/* Left Column - Donation History */}
          <div>
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <div className="h-8 w-2 rounded-md mr-3" style={{ backgroundColor: AUTHORITY_COLOR }}></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'en' ? 'Donation History' : 'দান ইতিহাস'}
                </h2>
              </div>
              <div className="flex space-x-2">
                {/* Refresh Button for Donation History */}
                <button
                  onClick={refreshDonations}
                  disabled={refreshing.donations}
                  className={`h-10 w-10 rounded-full text-white shadow-md hover:bg-opacity-90 transition-colors flex items-center justify-center ${refreshing.donations ? 'bg-gray-400' : 'bg-blue-600'}`}
                  title={language === 'en' ? 'Refresh Donations' : 'দান তথ্য রিফ্রেশ করুন'}
                >
                  <FaSync className={`h-4 w-4 ${refreshing.donations ? 'animate-spin' : ''}`} />
                </button>
                {/* Export CSV Button */}
                <button
                  onClick={exportToCSV}
                  className="h-10 w-10 rounded-full bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  title={language === 'en' ? 'Export CSV' : 'সিএসভি এক্সপোর্ট'}
                >
                  <FaFileDownload className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === 'en' ? 'User Contributions' : 'ব্যবহারকারী অবদান'}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'en' 
                    ? `${donations.length} ${donations.length === 1 ? 'donation' : 'donations'}`
                    : `${donations.length} টি দান`}
                </div>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "350px" }}>
                <table className="min-w-full">
                  <thead className="text-white sticky top-0 z-10" style={{ backgroundColor: AUTHORITY_COLOR }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Supporter Name' : 'সমর্থকের নাম'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Phone' : 'ফোন'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Amount' : 'পরিমাণ'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Payment Method' : 'পেমেন্ট পদ্ধতি'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Date' : 'তারিখ'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {donations.map((support) => (
                      <tr key={support._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{support.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{support.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(support.amount)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{support.paymentMethod}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(support.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(support.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - NGO Distributions */}
          <div>
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <div className="h-8 w-2 rounded-md mr-3" style={{ backgroundColor: AUTHORITY_COLOR }}></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'en' ? 'NGO Distributions' : 'এনজিও বিতরণ'}
                </h2>
              </div>
              <div className="flex space-x-2">
                {/* History Button */}
                <button
                  onClick={fetchDonationHistory}
                  disabled={loading}
                  className={`h-10 w-10 rounded-full text-white shadow-md hover:bg-opacity-90 transition-colors flex items-center justify-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                  title={language === 'en' ? 'View History' : 'ইতিহাস দেখুন'}
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <FaHistory className="h-4 w-4" />
                  )}
                </button>
                
                {/* Refresh Button for NGO Data */}
                <button
                  onClick={refreshNgos}
                  disabled={refreshing.ngos}
                  className={`h-10 w-10 rounded-full text-white shadow-md hover:bg-opacity-90 transition-colors flex items-center justify-center ${refreshing.ngos ? 'bg-gray-400' : 'bg-blue-600'}`}
                  title={language === 'en' ? 'Refresh NGO Data' : 'এনজিও তথ্য রিফ্রেশ করুন'}
                >
                  <FaSync className={`h-4 w-4 ${refreshing.ngos ? 'animate-spin' : ''}`} />
                </button>
                
                {/* Distribute to NGO Button */}
                <button
                  onClick={() => setShowDistributionModal(true)}
                  disabled={metrics.remainingBalance <= 0}
                  className="h-10 w-10 rounded-full text-white shadow-md hover:bg-opacity-90 transition-colors flex items-center justify-center"
                  style={{ backgroundColor: metrics.remainingBalance <= 0 ? '#ccc' : AUTHORITY_COLOR }}
                  title={language === 'en' ? 'Distribute to NGO' : 'এনজিওতে বিতরণ করুন'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden h-full">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {language === 'en' ? 'Funds Allocated to NGOs' : 'এনজিওতে বরাদ্দকৃত তহবিল'}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {language === 'en' 
                    ? `${ngos.length} ${ngos.length === 1 ? 'NGO' : 'NGOs'}`
                    : `${ngos.length} টি এনজিও`}
                </div>
              </div>
              
              {ngos.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {language === 'en' ? 'No NGOs found' : 'কোন এনজিও পাওয়া যায়নি'}
                </div>
              ) : (
                <div className="relative w-[102%]">
                  <table className="min-w-full table-fixed">
                    <colgroup>
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "10%" }} />
                    </colgroup>
                    <thead className="text-white" style={{ backgroundColor: AUTHORITY_COLOR }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          {language === 'en' ? 'NGO ID' : 'এনজিও আইডি'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          {language === 'en' ? 'Name' : 'নাম'}
                        </th>
                        <th className="pl-1 pr-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          {language === 'en' ? (
                            <div style={{ marginLeft: "-8px" }}>
                              <div>Total</div>
                              <div>Received</div>
                            </div>
                          ) : (
                            <div style={{ marginLeft: "-8px" }}>
                              <div>মোট</div>
                              <div>প্রাপ্ত</div>
                            </div>
                          )}
                        </th>
                        <th className="pl-1 pr-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          {language === 'en' ? (
                            <div style={{ marginLeft: "-60px" }}>
                              <div>Last</div>
                              <div>Donation</div>
                              <div>Date</div>
                            </div>
                          ) : (
                            <div style={{ marginLeft: "-60px" }}>
                              <div>শেষ</div>
                              <div>অনুদানের</div>
                              <div>তারিখ</div>
                            </div>
                          )}
                        </th>
                        <th className="pl-1 pr-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          <div style={{ marginLeft: "-60px" }}>
                            {language === 'en' ? 'Email' : 'ইমেইল'}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          <div style={{ marginLeft: "-30px" }}>
                            {language === 'en' ? 'Phone' : 'ফোন'}
                          </div>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <div className="overflow-y-auto" style={{ maxHeight: "270px", position: "relative" }}>
                    <table className="min-w-full table-fixed">
                      <colgroup>
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "10%" }} />
                      </colgroup>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {ngos.map((ngo) => {
                          return (
                            <tr key={ngo._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{ngo.registrationNumber}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{ngo.name}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(ngo.totalreceivedonation)}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(ngo.lastdonate).toLocaleDateString(language === 'en' ? 'en-US' : 'bn-BD', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(ngo.lastdonate).getFullYear()}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{ngo.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{ngo.phoneNumber}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Modal */}
      {showDistributionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {language === 'en' ? 'Distribute to NGO' : 'এনজিওতে বিতরণ করুন'}
              </h3>
              <button onClick={() => setShowDistributionModal(false)} className="text-gray-400 hover:text-gray-500">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'en' ? 'Select NGO:' : 'এনজিও নির্বাচন করুন:'}
                </label>
                <select 
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={selectedNgo ? selectedNgo.registrationNumber : ''}
                  onChange={(e) => {
                    const ngo = ngos.find(n => n.registrationNumber === e.target.value);
                    setSelectedNgo(ngo || null);
                  }}
                >
                  <option value="">{language === 'en' ? '-- Select an NGO --' : '-- একটি এনজিও নির্বাচন করুন --'}</option>
                  {ngos.map(ngo => (
                    <option key={ngo.registrationNumber} value={ngo.registrationNumber}>
                      {ngo.name} ({ngo.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedNgo && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Registration: {selectedNgo.registrationNumber}</p>
                  <p>Email: {selectedNgo.email}</p>
                  <p>Phone: {selectedNgo.phoneNumber}</p>
                  <p>Total Received: {formatCurrency(selectedNgo.totalreceivedonation || 0)}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'en' ? 'Amount:' : 'পরিমাণ:'}
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  value={distributionAmount}
                  onChange={(e) => setDistributionAmount(e.target.value)}
                  placeholder={language === 'en' ? 'Enter amount' : 'পরিমাণ লিখুন'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDistributionModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  onClick={handleDistribute}
                  disabled={loading || !selectedNgo || !distributionAmount}
                  className={`px-4 py-2 rounded-md text-white ${loading || !selectedNgo || !distributionAmount ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {loading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    language === 'en' ? 'Distribute' : 'বিতরণ করুন'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes popup {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes success-check {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-popup {
          animation: popup 0.4s ease-out forwards;
        }
        
        .animate-success-check {
          animation: success-check 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </AuthorityLayout>
  );
};

export default AuthorityDonationManagement; 