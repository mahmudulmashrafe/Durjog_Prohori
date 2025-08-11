import React, { useState } from 'react';
import { 
  FaPhone, 
  FaExclamationCircle, 
  FaAmbulance, 
  FaFire, 
  FaShieldAlt,
  FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function SOS() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [disasterType] = useState('other');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [description] = useState('');
  const [sosError, setSosError] = useState(null);
  const [isubmitSubmitting, setIsubmitSubmitting] = useState(false);
  
  const emergencyContacts = [
    {
      icon: FaPhone,
      title: t('nationalEmergency'),
      number: "999",
    },
    {
      icon: FaAmbulance,
      title: t('ambulanceService'),
      number: "999",
    },
    {
      icon: FaFire,
      title: t('fireService'),
      number: "16163",
    },
    {
      icon: FaShieldAlt,
      title: t('policeHelpline'),
      number: "999",
    },
    {
      icon: FaShieldAlt,
      title: "Legal Aid Helpline",
      number: "16430",
      visible: false, // Hidden but not removed
    },
    {
      icon: FaExclamationCircle,
      title: "Disaster Info",
      number: "1090",
      visible: false, // Hidden but not removed
    }
  ];

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError(t('geolocationNotSupported'));
      return;
    }

    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setLocationError(null);
      return position.coords; // Return coords for quick SOS
    } catch (error) {
      let errorMessage = t('locationError') + " ";
      if (error.code) {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += t('locationPermissionDenied');
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += t('locationUnavailable');
            break;
          case 3: // TIMEOUT
            errorMessage += t('locationTimeout');
            break;
          default:
            errorMessage += t('unknownError');
        }
      } else {
        errorMessage += error.message || t('unknownError');
      }
      setLocationError(errorMessage);
      setLocation(null);
      return null;
    }
  };

  const SuccessModal = ({ show, onClose }) => {
    if (!show) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Report Submitted Successfully
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
        </button>
      </div>

          <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-lg mb-4 flex items-center`}>
            <FaCheckCircle className={`text-2xl mr-3 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Your report has been submitted. Emergency services have been notified of your location.
            </p>
        </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className={`px-4 py-2 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const ErrorModal = ({ show, onClose }) => {
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              Report Submission Failed
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          
          <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-red-50'} rounded-lg mb-4`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {sosError || 'An unknown error occurred while submitting your report. Please try again.'}
            </p>
            </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className={`px-4 py-2 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg`}
            >
              OK
            </button>
          </div>
        </div>
            </div>
    );
  };

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-0 py-0 mt-0">
        {/* Action Buttons - Two buttons side by side */}
        <div className="mb-4 text-center">
          <div className="flex justify-center">
            {/* iSubmit Button */}
            <button
              onClick={async () => {
                // First get location if not already available
                let currentLocation = location;
                if (!currentLocation) {
                  const coords = await handleGetLocation();
                  if (!coords) {
                    setLocationError(t('locationRequired'));
                    setShowErrorModal(true);
                    return;
                  }
                  currentLocation = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy
                  };
                }
                
                // Don't show the form anymore, just submit immediately
                setIsubmitSubmitting(true);
                
                try {
                  const isubmitPayload = {
                    name: user?.name || 'Anonymous',
                    phoneNumber: user?.phone_number || 'Unknown',
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    disasterType: disasterType || 'other',
                    description: description || 'Automatic report submitted from iSubmit button'
                  };
                  
                  console.log('Quick iSubmit being sent:', isubmitPayload);
                  
                  // Submit to the server
                  const response = await axios.post('/api/isubmit', isubmitPayload);
                  
                  if (response.data.success) {
                    toast.success('Your report has been submitted successfully!');
                    setShowSuccessModal(true);
                  } else {
                    toast.error(response.data.message || 'Failed to submit report');
                    setSosError(response.data.message || 'Failed to submit report');
                    setShowErrorModal(true);
                  }
                } catch (error) {
                  console.error('Error submitting iSubmit form:', error);
                  toast.error(error.response?.data?.message || 'Failed to submit report');
                  setSosError(error.response?.data?.message || 'Failed to submit report');
                  setShowErrorModal(true);
                } finally {
                  setIsubmitSubmitting(false);
                }
              }}
              disabled={isubmitSubmitting}
              className={`relative w-32 h-32 rounded-full ${
                isubmitSubmitting 
                  ? 'bg-gray-400' 
                  : 'bg-green-600 hover:bg-green-700 pulse-animation-green'
              } text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors shadow-lg`}
              aria-label="Submit SOS Report"
            >
              {isubmitSubmitting ? (
                <svg className="animate-spin h-16 w-16" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <FaPaperPlane className="text-5xl" />
                  <span className="absolute -bottom-8 whitespace-nowrap text-md font-bold text-green-600 dark:text-green-400">
                    iSubmit
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {locationError && (
          <div className={`${darkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6 transition-colors max-w-lg mx-auto`}>
            <h2 className={`font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'} mb-2`}>{t('locationError')}:</h2>
            <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{locationError}</p>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className={`mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Emergency Contacts
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.filter(contact => contact.visible !== false).map((contact, index) => (
              <a 
                key={index}
                href={`tel:${contact.number}`}
                className={`flex items-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-200'
                } mr-3`}>
                  <contact.icon className={`text-xl ${
                    index === 0 ? 'text-red-500' :
                    index === 1 ? 'text-blue-500' :
                    index === 2 ? 'text-orange-500' :
                    'text-green-500'
                  }`} />
                </div>
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {contact.title}
            </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {contact.number}
                  </p>
            </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <ErrorModal show={showErrorModal} onClose={() => setShowErrorModal(false)} />
      
      {/* CSS animations - Update color for pulse animation */}
      <style>{`
        .pulse-animation-green {
          animation: pulse-green 1.5s infinite;
        }
        
        @keyframes pulse-green {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default SOS;