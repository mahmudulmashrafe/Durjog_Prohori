import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNGOAuth } from '../../context/NGOAuthContext';
import { FaClipboardList, FaBoxOpen, FaMapMarkedAlt, FaPhone } from 'react-icons/fa';

const Dashboard = () => {
  const { ngo } = useNGOAuth();
  const navigate = useNavigate();

  if (!ngo) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading NGO information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-0">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 mt-20">
          <h2 className="text-xl font-semibold mb-2">Welcome, {ngo.name}!</h2>
          <p className="text-gray-600">
            You are logged in as a <span className="font-medium text-green-600">{ngo.role}</span> at <span className="font-medium">{ngo.organization}</span>
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Registration Number: {ngo.registrationNumber}</p>
            <p>Last Login: {ngo.lastLogin ? new Date(ngo.lastLogin).toLocaleString() : 'First time login'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                <FaClipboardList className="h-6 w-6" />
              </span>
              <h4 className="font-semibold">Disaster Reports</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">View and create reports for disaster incidents</p>
            <button 
              onClick={() => navigate('/ngo/reports')}
              className="text-green-600 font-medium text-sm hover:text-green-700"
            >
              View Reports →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                <FaMapMarkedAlt className="h-6 w-6" />
              </span>
              <h4 className="font-semibold">Map</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">View active disasters and relief operations</p>
            <button 
              onClick={() => navigate('/ngo/map')}
              className="text-green-600 font-medium text-sm hover:text-green-700"
            >
              Open Map →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 text-green-600 p-3 rounded-full mr-4">
                <FaBoxOpen className="h-6 w-6" />
              </span>
              <h4 className="font-semibold">Donation Management</h4>
            </div>
            <p className="text-gray-600 text-sm mb-4">Manage and track donation resources</p>
            <button 
              onClick={() => navigate('/ngo/resources')}
              className="text-green-600 font-medium text-sm hover:text-green-700"
            >
              Manage Donations →
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white fixed bottom-0 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
              <h3 className="font-bold text-lg mb-1">Emergency Contacts</h3>
              <div className="flex items-center">
                <FaPhone className="mr-2" />
                <span>Emergency: 999</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Durjog Prohori. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Add padding to prevent content from being hidden behind fixed footer */}
      <div className="pb-32"></div>
    </div>
  );
};

export default Dashboard; 