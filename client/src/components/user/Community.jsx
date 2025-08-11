import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FaDonate, FaHandHoldingMedical, FaUsers, FaHandshake } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Add keyframe animation at the top of the file
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

// Add the style tag to inject the animation
const styleTag = document.createElement('style');
styleTag.textContent = pulseAnimation;
document.head.appendChild(styleTag);

const Community = () => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [donationLoading, setDonationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [ngos, setNgos] = useState([]);
  
  // Default user info for testing (remove in production)
  const DEFAULT_USER = {
    name: "Test User",
    phone_number: "01712345678",
    email: "test@example.com"
  };
  
  // Donation system state
  const [donorName, setDonorName] = useState(DEFAULT_USER.name);
  const [donorPhone, setDonorPhone] = useState(DEFAULT_USER.phone_number);
  const [recentDonations, setRecentDonations] = useState([]);
  const [donationsInitialized, setDonationsInitialized] = useState(false);
  
  // Support payment state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportAmount, setSupportAmount] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [showSupportSuccess, setShowSupportSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // Default payment method
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Update itemsPerPage based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 3 : 4;
  
  // Log current state values for debugging
  useEffect(() => {
    console.log('Current community component state:');
    console.log('donorName:', donorName);
    console.log('donorPhone:', donorPhone);
    console.log('currentUserInfo:', currentUserInfo);
  }, [donorName, donorPhone, currentUserInfo]);
  
  // Handle amount input directly without any filtering
  const handleAmountChange = (e) => {
    setSupportAmount(e.target.value);
  };
  
  // Get current user info from local storage or auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          return;
        }

        // Fetch user profile
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Fetched user data:', response.data);
        
        if (response.data.success && response.data.user) {
          setCurrentUserInfo(response.data.user);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
          
          // Pre-fill donor info if user is logged in
          setDonorName(response.data.user.name || '');
          setDonorPhone(response.data.user.phone_number || '');
        } else {
          console.log('No user data in response');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Try to get from localStorage as fallback
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            console.log('Using cached user data:', parsedUserData);
            setCurrentUserInfo(parsedUserData);
            
            // Pre-fill donor info from cached data
            setDonorName(parsedUserData.name || '');
            setDonorPhone(parsedUserData.phone_number || '');
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
      
      // Get the current user's ID from localStorage first
      const userData = localStorage.getItem('userData');
      let userId = null;
      
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          userId = parsedUserData._id;
        } catch (e) {
          console.error('Error parsing cached user data:', e);
        }
      }
      
      // If no userId in localStorage, try from currentUserInfo
      if (!userId && currentUserInfo?._id) {
        userId = currentUserInfo._id;
        }
      
      if (!userId) {
        console.log('No user ID available');
        setRecentDonations([]);
        setDonationsInitialized(true);
      return;
    }
    
      // Fetch user's support payments
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
        console.log('Fetched user support payments:', supportPayments);
      }
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      toast.error('Failed to fetch donation history');
    } finally {
      setDonationLoading(false);
      setDonationsInitialized(true);
    }
  };

  // Call fetchRecentDonations whenever currentUserInfo changes
  useEffect(() => {
    if (currentUserInfo?._id) {
            fetchRecentDonations();
        }
  }, [currentUserInfo]);

  // Handle support form submission
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    
    if (!supportAmount || isNaN(supportAmount) || Number(supportAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!donorName) {
      toast.error('Please enter your name');
      return;
    }
    
    setSupportSubmitting(true);
    
    try {
      const supportPayload = {
        name: donorName,
        phoneNumber: donorPhone,
        amount: parseFloat(supportAmount),
        description: supportDescription,
        paymentMethod: paymentMethod,
        user_id: currentUserInfo?._id || null
      };
      
      const supportResponse = await axios.post('/api/support', supportPayload);
      
      if (supportResponse.data.success) {
        setShowSupportModal(false);
        setShowSupportSuccess(true);
        
        // Reset form
        setSupportAmount('');
        setSupportDescription('');
        
        // Refresh recent donations after a short delay
        setTimeout(() => {
          fetchRecentDonations();
        }, 1000);
      } else {
        toast.error(supportResponse.data.message || 'Failed to process support payment');
      }
    } catch (error) {
      console.error('Error submitting support payment:', error);
      toast.error('An error occurred while processing your payment. Please try again later.');
    } finally {
      setSupportSubmitting(false);
    }
  };

  // Load dummy data for groups and NGOs
  useEffect(() => {
    // Load mock groups data
    const mockGroups = [
      { id: 'group1', name: 'Dhaka Disaster Relief', members: 156, joined: true, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 1000000) },
      { id: 'group2', name: 'Chattogram Volunteers', members: 89, joined: false, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 2000000) },
      { id: 'group3', name: 'Flood Support Network', members: 211, joined: true, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 3000000) },
      { id: 'group4', name: 'Cyclone Preparedness', members: 113, joined: false, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 4000000) },
      { id: 'group5', name: 'Emergency Medical Support', members: 67, joined: true, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 5000000) },
      { id: 'group6', name: 'Shelter Coordination', members: 92, joined: false, image: 'https://via.placeholder.com/50', timestamp: new Date(Date.now() - 6000000) },
    ];
    
    setGroups(mockGroups);
    setNgos(mockGroups);
  }, []);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredNgos = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ngo.description && ngo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ngo.focus && ngo.focus.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return (
      <div className="flex flex-col space-y-0.5">
        <span className="font-medium text-sm">{time}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">{dateStr}</span>
      </div>
    );
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  // Filter donations based on search query
  const filteredDonations = recentDonations.filter(donation => {
    const searchLower = searchQuery.toLowerCase();
          return (
      donation.paymentMethod.toLowerCase().includes(searchLower) ||
      formatTimestamp(donation.timestamp).toLowerCase().includes(searchLower) ||
      donation.amount.toString().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonations = filteredDonations.slice(startIndex, startIndex + itemsPerPage);

  // Support Modal Component
  const SupportModal = ({ show, onClose }) => {
    console.log('SupportModal rendering with donorName:', donorName, 'donorPhone:', donorPhone);
    
    // Local state for form values to ensure they're preserved
    const [localName, setLocalName] = useState(donorName || DEFAULT_USER.name);
    const [localPhone, setLocalPhone] = useState(donorPhone || DEFAULT_USER.phone_number);
    
    // Move useEffect outside the conditional return
    useEffect(() => {
      if (show) {
        console.log('Support modal opened, current user info:', currentUserInfo);
        console.log('Current donor state values - Name:', donorName, 'Phone:', donorPhone);
        
        // Update local state from parent state
        setLocalName(donorName);
        setLocalPhone(donorPhone);
        
        if (currentUserInfo) {
          // Update the local state with the user's information
          setLocalName(currentUserInfo.name || '');
          setLocalPhone(currentUserInfo.phone_number || '');
          
          // Also update parent state
          setDonorName(currentUserInfo.name || '');
          setDonorPhone(currentUserInfo.phone_number || '');
          
          console.log('Setting donor info from currentUserInfo - Name:', currentUserInfo.name, 'Phone:', currentUserInfo.phone_number);
        } else {
          // Try to get user data from localStorage as fallback
          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const parsedUserData = JSON.parse(userData);
              console.log('Using cached user data from localStorage:', parsedUserData);
              
              setLocalName(parsedUserData.name || '');
              setLocalPhone(parsedUserData.phone_number || '');
              
              // Also update parent state
              setDonorName(parsedUserData.name || '');
              setDonorPhone(parsedUserData.phone_number || '');
            } catch (e) {
              console.error('Error parsing cached user data:', e);
            }
          }
        }
      }
    }, [show, currentUserInfo, donorName, donorPhone]);
    
    // Effect to sync local state back to parent when changed locally
    useEffect(() => {
      if (show) {
        setDonorName(localName);
        setDonorPhone(localPhone);
      }
    }, [localName, localPhone, show]);
    
    // Local version of the support submit handler
    const handleLocalSupportSubmit = (e) => {
      e.preventDefault();
      
      if (!supportAmount || isNaN(supportAmount) || Number(supportAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      if (!localName) {
        toast.error('Please enter your name');
        return;
      }
      
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      
      // Update parent state with local values before submitting
      setDonorName(localName);
      setDonorPhone(localPhone);

      console.log('Support form submitted with values - Name:', localName, 'Phone:', localPhone, 'Amount:', supportAmount);
      
      // Show the payment gateway instead of submitting immediately
      setShowPaymentGateway(true);
    };
    
    // Early return after the useEffect
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-sm rounded-lg shadow-xl max-w-sm w-full overflow-hidden`}>
          <div className="p-3 bg-blue-600 bg-opacity-85 backdrop-blur-sm text-white flex justify-between items-center">
            <div className="flex items-center">
              <FaHandHoldingMedical className="text-lg mr-2" />
              <h3 className="text-base font-bold">Send to Support</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {!showPaymentGateway ? (
            <form onSubmit={handleLocalSupportSubmit} className="p-4 bg-opacity-90 backdrop-blur-sm">
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  User ID
                </label>
                <input
                  type="text"
                  value={currentUserInfo?._id || ''}
                  disabled
                  className={`w-full px-3 py-1.5 text-sm rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 bg-opacity-75 border-gray-600 text-gray-500'
                      : 'bg-gray-100 bg-opacity-75 border-gray-300 text-gray-500'
                  } backdrop-blur-sm`}
                />
              </div>
              
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={donorName || DEFAULT_USER.name}
                  onChange={(e) => {
                    setLocalName(e.target.value);
                    setDonorName(e.target.value);
                  }}
                  className={`w-full px-3 py-1.5 text-sm rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 bg-opacity-75 border-gray-600 text-white'
                      : 'bg-white bg-opacity-75 border-gray-300 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue={donorPhone || DEFAULT_USER.phone_number}
                  onChange={(e) => {
                    setLocalPhone(e.target.value);
                    setDonorPhone(e.target.value);
                  }}
                  className={`w-full px-3 py-1.5 text-sm rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 bg-opacity-75 border-gray-600 text-white'
                      : 'bg-white bg-opacity-75 border-gray-300 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Amount to Pay <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    ৳
                  </div>
                  <input
                    type="number"
                    value={supportAmount}
                    onChange={handleAmountChange}
                    className={`w-full pl-6 px-3 py-1.5 text-sm rounded-md border ${
                      darkMode
                        ? 'bg-gray-700 bg-opacity-75 border-gray-600 text-white'
                        : 'bg-white bg-opacity-75 border-gray-300 text-gray-900'
                    } backdrop-blur-sm`}
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>
                
                {/* Preset amount options */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {[100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 70000, 100000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setSupportAmount(amount.toString())}
                      className={`px-2 py-1 text-xs rounded-md border ${
                        supportAmount === amount.toString()
                          ? `${darkMode ? 'bg-blue-700 bg-opacity-80 text-white border-blue-600' : 'bg-blue-100 bg-opacity-80 text-blue-800 border-blue-200'}`
                          : `${darkMode ? 'bg-gray-700 bg-opacity-80 text-gray-300 border-gray-600' : 'bg-gray-100 bg-opacity-80 text-gray-800 border-gray-200'}`
                      } hover:opacity-80 transition-colors backdrop-blur-sm`}
                    >
                      ৳{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Payment Method Options */}
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <div 
                    className={`p-2 border rounded-md text-center cursor-pointer transition-colors text-sm ${
                      paymentMethod === 'bkash' 
                        ? (darkMode ? 'bg-purple-800 bg-opacity-80 border-purple-700' : 'bg-purple-100 bg-opacity-80 border-purple-300') 
                        : (darkMode ? 'bg-gray-700 bg-opacity-80 border-gray-600' : 'bg-white bg-opacity-80 border-gray-300')
                    } backdrop-blur-sm`}
                    onClick={() => setPaymentMethod('bkash')}
                  >
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>bKash</div>
                  </div>
                  <div 
                    className={`p-2 border rounded-md text-center cursor-pointer transition-colors text-sm ${
                      paymentMethod === 'nagad' 
                        ? (darkMode ? 'bg-orange-800 bg-opacity-80 border-orange-700' : 'bg-orange-100 bg-opacity-80 border-orange-300') 
                        : (darkMode ? 'bg-gray-700 bg-opacity-80 border-gray-600' : 'bg-white bg-opacity-80 border-gray-300')
                    } backdrop-blur-sm`}
                    onClick={() => setPaymentMethod('nagad')}
                  >
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nagad</div>
                  </div>
                  <div 
                    className={`p-2 border rounded-md text-center cursor-pointer transition-colors text-sm ${
                      paymentMethod === 'rocket' 
                        ? (darkMode ? 'bg-blue-800 bg-opacity-80 border-blue-700' : 'bg-blue-100 bg-opacity-80 border-blue-300') 
                        : (darkMode ? 'bg-gray-700 bg-opacity-80 border-gray-600' : 'bg-white bg-opacity-80 border-gray-300')
                    } backdrop-blur-sm`}
                    onClick={() => setPaymentMethod('rocket')}
                  >
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Rocket</div>
                  </div>
                  <div 
                    className={`p-2 border rounded-md text-center cursor-pointer transition-colors text-sm ${
                      paymentMethod === 'card' 
                        ? (darkMode ? 'bg-green-800 bg-opacity-80 border-green-700' : 'bg-green-100 bg-opacity-80 border-green-300') 
                        : (darkMode ? 'bg-gray-700 bg-opacity-80 border-gray-600' : 'bg-white bg-opacity-80 border-gray-300')
                    } backdrop-blur-sm`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bank Card</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  Payment Description (Optional)
                </label>
                <textarea
                  value={supportDescription}
                  onChange={(e) => setSupportDescription(e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm rounded-md border ${
                    darkMode
                      ? 'bg-gray-700 bg-opacity-75 border-gray-600 text-white'
                      : 'bg-white bg-opacity-75 border-gray-300 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Describe your payment (optional)"
                  rows="1"
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-3 py-1.5 text-sm rounded-md mr-2 ${
                    darkMode
                      ? 'bg-gray-700 bg-opacity-80 text-white hover:bg-gray-600'
                      : 'bg-gray-200 bg-opacity-80 text-gray-800 hover:bg-gray-300'
                  } backdrop-blur-sm`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm rounded-md bg-blue-600 bg-opacity-85 text-white hover:bg-blue-700 backdrop-blur-sm"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          ) : (
            // Payment gateways now much smaller
            <div className="p-3 bg-opacity-90 backdrop-blur-sm">
              {/* bKash Payment Gateway - Significantly smaller */}
              {paymentMethod === 'bkash' && (
                <div className="text-center">
                  {/* bKash Header */}
                  <div className="bg-pink-600 p-2 -mx-3 -mt-3 mb-2">
                    <div className="flex justify-between items-center">
                      <div className="w-16">
                        <span className="text-white font-bold text-base">bKash</span>
                      </div>
                      <div className="text-white text-xs">
                        <div>Ref: DPBK{Math.floor(Math.random() * 10000)}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount Display */}
                  <div className="bg-pink-50 py-2 rounded mb-2">
                    <p className="text-gray-500 text-xs mb-0">Amount</p>
                    <p className="text-pink-600 text-lg font-bold">{formatCurrency(supportAmount)}</p>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="mb-3">
                    <div className="mb-2">
                      <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                        bKash Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 text-xs rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          +88
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="01XXXXXXXXX"
                          className="flex-1 text-xs appearance-none border border-gray-300 w-full py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-r-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                        PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter PIN"
                        className="w-full text-xs appearance-none border border-gray-300 py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* bKash Security Notice */}
                  <div className="bg-gray-50 p-2 rounded mb-2 text-left">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Security:</span>
                      Never share your PIN with anyone
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentGateway(false)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSupportSubmit}
                      disabled={supportSubmitting}
                      className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium rounded shadow-sm"
                    >
                      {supportSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Nagad Payment Gateway - Redesigned to match the image */}
              {paymentMethod === 'nagad' && (
                <div className="text-center">
                  {/* Nagad Header with red background */}
                  <div className="bg-red-600 p-3 -mx-3 -mt-3 mb-0 flex justify-center">
                    <div className="w-32">
                      <div className="text-white font-bold text-lg">
                        <span className="text-white">নগদ</span>
                        <span className="text-white text-xs block">NAGAD</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Red background container for the entire content */}
                  <div className="bg-gradient-to-b from-red-700 to-red-500 -mx-3 -mt-0 p-4 text-white">
                    {/* Invoice information */}
                    <div className="mb-6 text-left">
                      <p className="mb-1"><span className="font-semibold">Invoice No:</span> {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                      <p className="mb-1"><span className="font-semibold">Total Amount:</span> BDT {supportAmount}</p>
                      <p className="mb-1"><span className="font-semibold">Charge:</span> BDT 0</p>
                    </div>
                    
                    {/* Account number input */}
                    <div className="mb-4">
                      <p className="text-left font-semibold mb-2">Your Nagad Account Number</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength="11"
                        className="w-full py-2 px-3 text-center bg-white text-black rounded"
                        placeholder="Enter your 11-digit Nagad number"
                      />
                    </div>
                    
                    {/* PIN input */}
                    <div className="mb-4">
                      <p className="text-left font-semibold mb-2">PIN</p>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="Enter Nagad PIN"
                        className="w-full py-2 px-3 text-center bg-white text-black rounded"
                      />
                    </div>
                    
                    {/* Terms and conditions checkbox */}
                    <div className="mb-6 flex items-start">
                      <input 
                        type="checkbox" 
                        id="nagad-terms" 
                        className="mt-1 mr-2"
                      />
                      <label htmlFor="nagad-terms" className="text-white text-left text-sm">
                        I agree to the <span className="underline">terms and conditions</span>
                      </label>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-between gap-4 mt-4">
                      <button
                        type="button"
                        onClick={handleSupportSubmit}
                        className="flex-1 py-2 bg-white text-red-600 font-medium rounded shadow-sm"
                      >
                        Proceed
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPaymentGateway(false)}
                        className="flex-1 py-2 bg-white text-red-600 font-medium rounded shadow-sm"
                      >
                        Close
                      </button>
                    </div>
                    
                    {/* Nagad logo at bottom */}
                    <div className="mt-8 flex justify-center">
                      <div className="w-16 h-16 bg-white rounded-full p-1 flex items-center justify-center">
                        <div className="text-red-600 font-bold text-lg">নগদ</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Rocket Payment Gateway - Significantly smaller */}
              {paymentMethod === 'rocket' && (
                <div className="text-center">
                  <div className="bg-blue-600 p-2 -mx-3 -mt-3 mb-2">
                    <div className="flex justify-between items-center">
                      <div className="w-16">
                        <span className="text-white font-bold text-base">Rocket</span>
                      </div>
                      <div className="text-white text-xs">
                        <div>Ref: DPRK{Math.floor(Math.random() * 10000)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 py-2 rounded mb-2">
                    <p className="text-gray-500 text-xs mb-0">Amount</p>
                    <p className="text-blue-600 text-lg font-bold">{formatCurrency(supportAmount)}</p>
                  </div>
                  
                  <div className="mb-3">
                    <div className="mb-2">
                      <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                        Rocket Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 text-xs rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                          +88
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="01XXXXXXXXX"
                          className="flex-1 text-xs appearance-none border border-gray-300 w-full py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-r-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                        PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter PIN"
                        className="w-full text-xs appearance-none border border-gray-300 py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentGateway(false)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSupportSubmit}
                      disabled={supportSubmitting}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm"
                    >
                      {supportSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Bank Card Payment Gateway - Significantly smaller */}
              {paymentMethod === 'card' && (
                <div className="text-center">
                  <div className="bg-green-600 p-2 -mx-3 -mt-3 mb-2">
                    <div className="flex justify-between items-center">
                      <div className="w-16">
                        <span className="text-white font-bold text-base">Card</span>
                      </div>
                      <div className="text-white text-xs">
                        <div>Ref: DPCD{Math.floor(Math.random() * 10000)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 py-2 rounded mb-2">
                    <p className="text-gray-500 text-xs mb-0">Amount</p>
                    <p className="text-green-600 text-lg font-bold">{formatCurrency(supportAmount)}</p>
                  </div>
                  
                  <div className="mb-3">
                    <div className="mb-2">
                      <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                        Card Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="w-full text-xs appearance-none border border-gray-300 py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-md"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full text-xs appearance-none border border-gray-300 py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-left text-gray-700 font-medium">
                          CVV
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="XXX"
                          className="w-full text-xs appearance-none border border-gray-300 py-1 px-2 bg-white text-gray-700 placeholder-gray-400 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentGateway(false)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSupportSubmit}
                      disabled={supportSubmitting}
                      className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow-sm"
                    >
                      {supportSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Support Success Modal
  const SupportSuccessModal = ({ show, onClose }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} mb-4`}>
              <FaDonate className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Successful!</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your payment has been submitted successfully.
            </p>
            <button 
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the renderRecentDonations function
  const renderRecentDonations = () => {
    // Show loading only on initial load
    if (donationLoading && !donationsInitialized) {
      return (
        <div className="text-center py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      );
    }

    // Check for user login status
    const isLoggedIn = currentUserInfo?._id || localStorage.getItem('token');
    if (!isLoggedIn) {
    return (
        <div className="text-center py-4">
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('pleaseLogin')}
          </p>
          </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex justify-end mb-4">
              <input
                type="text"
            placeholder={t('searchDonations')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className={`px-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
              />
            </div>
            
        {/* Donations Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-green-500'}>
              <tr>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDonations.length > 0 ? (
                paginatedDonations.map((donation, index) => (
                  <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-medium text-sm">{formatTimestamp(donation.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                      {donation.paymentMethod}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(donation.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-3 py-2 sm:px-6 sm:py-4 text-center text-sm">
                    {t('noDonationsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
            </div>
            
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
              <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'
              } disabled:cursor-not-allowed`}
              >
              {t('previous')}
              </button>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {t('page', { current: currentPage, total: totalPages })}
            </span>
              <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'
              } disabled:cursor-not-allowed`}
            >
              {t('next')}
              </button>
            </div>
        )}
      </div>
    );
  };

  if (donationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Hide the tabs section */}
        <div className="hidden">
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'groups'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaUsers className="inline-block mr-2" />
              {t('groups')}
            </button>
            <button
              onClick={() => setActiveTab('ngos')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'ngos'
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FaHandshake className="inline-block mr-2" />
              {t('ngos')}
            </button>
                      </div>
                  </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Hide groups and NGOs lists */}
          <div className="hidden lg:col-span-2">
            {activeTab === 'groups' && (
              <div className="space-y-4">
                {/* Search bar for groups */}
                <div className="relative">
                <input
                  type="text"
                    placeholder={t('searchGroups')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

                {/* Groups list */}
                {filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`rounded-lg overflow-hidden ${
                        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                      } transition-colors shadow-sm cursor-pointer`}
                    >
                  <div className="p-4">
                        <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                        <FaUsers className="text-white text-xl" />
                          </div>
                      <div className="ml-3 flex-grow">
                            <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg truncate">{group.name}</h3>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTimestamp(group.timestamp)}
                              </span>
                            </div>
                        <div className="flex items-center text-sm">
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {group.members} {t('members')}
                              </span>
                              {group.joined && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                                  Joined
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
                )}

            {activeTab === 'ngos' && (
              <div className="space-y-4">
                {/* Search bar for NGOs */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('searchNgos')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
              </div>

                {/* NGOs list */}
                {filteredNgos.map((ngo) => (
                    <div
                      key={ngo.id}
                      className={`rounded-lg overflow-hidden ${
                        darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                      } transition-colors shadow-sm cursor-pointer`}
                    >
                  <div className="p-4">
                        <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                        <FaHandshake className="text-white text-xl" />
                          </div>
                      <div className="ml-3 flex-grow">
                            <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg truncate">{ngo.name}</h3>
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTimestamp(ngo.timestamp)}
                              </span>
                            </div>
                        <div className="flex items-center text-sm">
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {ngo.members} {t('members')}
                              </span>
                              {ngo.joined && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                                  Joined
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
        )}
      </div>
      
          {/* Right column - Keep donation and support sections */}
          <div className="lg:col-span-3">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
              <div className="sm:col-span-2 lg:col-span-1 flex justify-center">
              <button
                onClick={() => setShowSupportModal(true)}
                  className={`p-4 rounded-lg w-full lg:w-2/3 ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white flex items-center justify-center transition-all duration-300 
                animate-pulse hover:animate-none hover:scale-105 hover:shadow-lg 
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 
                focus:ring-opacity-50`}
              >
                <FaHandHoldingMedical className="text-2xl mr-2 animate-bounce" />
                <span className="font-medium">{t('support')}</span>
              </button>
              </div>
            </div>

            {/* Donation History Section */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaDonate className="mr-2" />
                Donation History
              </h2>
              {renderRecentDonations()}
            </div>
          </div>
        </div>

        {/* Keep all modals except donation modals */}
      <SupportModal show={showSupportModal} onClose={() => setShowSupportModal(false)} />
      <SupportSuccessModal show={showSupportSuccess} onClose={() => setShowSupportSuccess(false)} />
      </div>
    </div>
  );
};

export default Community; 