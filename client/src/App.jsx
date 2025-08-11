import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/user/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import EmailVerification from './components/EmailVerification';
import ScrollToTop from './components/ScrollToTop';
import Home from './components/user/Home';
import Profile from './components/user/Profile';
import Community from './components/user/Community';
import Donate from './components/user/Donate';
import { Toaster } from 'react-hot-toast';
import './index.css';

// User components
import Dashboard from './components/user/Dashboard';
import Map from './components/user/Map';
import Alerts from './components/user/Alerts';
import Disaster from './components/user/Disaster';
import SOS from './components/user/SOS';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/user/signin" />;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="pt-16 pb-16">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/user/home" element={<Home />} />
              <Route path="/user/signin" element={<Login />} />
              <Route path="/user/signup" element={<Register />} />
              <Route path="/user/verify-email" element={<EmailVerification />} />
              <Route
                path="/user/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/map"
                element={
                  <PrivateRoute>
                    <Map />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/alerts"
                element={
                  <PrivateRoute>
                    <Alerts />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/sos"
                element={
                  <PrivateRoute>
                    <SOS />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/disasters/:type"
                element={
                  <PrivateRoute>
                    <Disaster />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/community"
                element={
                  <PrivateRoute>
                    <Community />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/donate"
                element={
                  <PrivateRoute>
                    <Donate />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
};

export default App; 