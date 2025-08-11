import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { FirefighterAuthProvider, useFirefighterAuth } from './context/FirefighterAuthContext';
import { NGOAuthProvider, useNGOAuth } from './context/NGOAuthContext';
import { AuthorityAuthProvider, useAuthorityAuth } from './context/AuthorityAuthContext';
import { DisasterResponseAuthProvider, useDisasterResponseAuth } from './context/DisasterResponseAuthContext.jsx';
import Login from './components/user/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import EmailVerification from './components/EmailVerification';
import ScrollToTop from './components/ScrollToTop';
import Home from './components/Home';

// User components
import Dashboard from './components/user/Dashboard';
import Map from './components/user/Map';
import Alerts from './components/user/Alerts';
import Profile from './components/user/Profile';
import Disaster from './components/user/Disaster';
import SOS from './components/user/SOS';
import Community from './components/user/Community';
import Earthquakes from './components/user/Earthquakes';
import BloodDonors from './components/user/BloodDonors';
import Donate from './components/user/Donate';

// Admin components
import AdminLogin from './components/admin/Login';
import AdminHome from './components/admin/Home';

// Firefighter components
import FirefighterLogin from './components/firefighter/Login';
import FirefighterLayout from './components/firefighter/FirefighterLayout';
import FirefighterDashboard from './components/firefighter/Dashboard';
import FirefighterProfile from './components/firefighter/Profile';
import FirefighterMap from './pages/FirefighterMap';
import FirefighterReports from './pages/FirefighterReports';
import Equipment from './components/firefighter/Equipment';

// NGO components
import NGOSignIn from './pages/NGOSignIn';
import NGOMap from './pages/NGOMap';
import NGOResources from './pages/NGOResources';
import { NGOLayout } from './components/ngo';
import { Dashboard as NGODashboard } from './components/ngo';
import { Profile as NGOProfile } from './components/ngo';
import { Reports as NGOReports } from './components/ngo';

// Authority components
import AuthoritySignIn from './pages/AuthoritySignIn';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityDisasters from './pages/AuthorityDisasters';
import AuthorityMap from './pages/AuthorityMap';
import AuthorityUserDisasterReport from './pages/AuthorityUserDisasterReport';
import AuthorityIsubmitReports from './pages/AuthorityIsubmitReports';
import AuthorityDonationManagement from './pages/AuthorityDonationManagement';
import AuthorityProfile from './pages/AuthorityProfile';

// Disaster Response components
import DisasterResponseSignIn from './pages/DisasterResponseSignIn.jsx';
import DisasterResponseDashboard from './pages/DisasterResponseDashboard.jsx';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/user/signin" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/user/home" />;
};

const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  return isAdminAuthenticated ? children : <Navigate to="/admin/signin" />;
};

const FirefighterRoute = ({ children }) => {
  const { isAuthenticated } = useFirefighterAuth();
  return isAuthenticated ? children : <Navigate to="/firefighter/signin" />;
};

const NGORoute = ({ children }) => {
  const { isAuthenticated } = useNGOAuth();
  return isAuthenticated ? children : <Navigate to="/ngo/signin" />;
};

const AuthorityRoute = ({ children }) => {
  const { isAuthenticated } = useAuthorityAuth();
  return isAuthenticated ? children : <Navigate to="/authority/signin" />;
};

const DisasterResponseRoute = ({ children }) => {
  const { isAuthenticated } = useDisasterResponseAuth();
  return isAuthenticated ? children : <Navigate to="/disasterresponse/signin" />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <ScrollToTop />
      {/* Only show Navbar on non-admin, non-firefighter, non-NGO, and non-Authority routes */}
      {!window.location.pathname.startsWith('/admin') && 
       !window.location.pathname.startsWith('/firefighter') &&
       !window.location.pathname.startsWith('/ngo') &&
       !window.location.pathname.startsWith('/authority') &&
       !window.location.pathname.startsWith('/disasterresponse') && <Navbar />}
      
      {/* Main content area with responsive padding for sidebar */}
      <main className={`flex-1 ${isAuthenticated ? 'md:pl-72' : ''} pt-16 transition-all duration-200`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route
            path="/user/signin"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/user/signup"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <EmailVerification />
              </PublicRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user/home"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/disaster"
            element={
              <PrivateRoute>
                <Disaster />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/disaster/:type"
            element={
              <PrivateRoute>
                <Disaster />
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
            element={<SOS />}
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
            path="/user/earthquakes"
            element={
              <PrivateRoute>
                <Earthquakes />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/blood-donors"
            element={
              <PrivateRoute>
                <BloodDonors />
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

          {/* Admin Routes */}
          <Route path="/admin/signin" element={<AdminLogin />} />
          <Route 
            path="/admin/home" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/disasters" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/map" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/sos" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/donations" 
            element={
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            } 
          />

          {/* Firefighter Routes */}
          <Route path="/firefighter" element={<Navigate to="/firefighter/signin" />} />
          <Route path="/firefighter/signin" element={<FirefighterLogin />} />
          <Route 
            path="/firefighter/dashboard" 
            element={
              <FirefighterRoute>
                <FirefighterLayout>
                  <FirefighterDashboard />
                </FirefighterLayout>
              </FirefighterRoute>
            }
          />
          <Route
            path="/firefighter/reports"
            element={
              <FirefighterRoute>
                <FirefighterReports />
              </FirefighterRoute>
            }
          />
          <Route
            path="/firefighter/map"
            element={
              <FirefighterRoute>
                <FirefighterMap />
              </FirefighterRoute>
            }
          />
          <Route
            path="/firefighter/profile"
            element={
              <FirefighterRoute>
                <FirefighterLayout>
                  <FirefighterProfile />
                </FirefighterLayout>
              </FirefighterRoute>
            }
          />
          <Route
            path="/firefighter/equipment"
            element={
              <FirefighterRoute>
                <FirefighterLayout>
                  <Equipment />
                </FirefighterLayout>
              </FirefighterRoute>
            }
          />
          
          {/* NGO Routes */}
          <Route path="/ngo" element={<Navigate to="/ngo/signin" />} />
          <Route path="/ngo/signin" element={<NGOSignIn />} />
          <Route 
            path="/ngo/dashboard" 
            element={
              <NGORoute>
                <NGOLayout>
                  <NGODashboard />
                </NGOLayout>
              </NGORoute>
            }
          />
          <Route
            path="/ngo/reports"
            element={
              <NGORoute>
                <NGOLayout>
                  <NGOReports />
                </NGOLayout>
              </NGORoute>
            }
          />
          <Route
            path="/ngo/map"
            element={
              <NGORoute>
                <NGOMap />
              </NGORoute>
            }
          />
          <Route
            path="/ngo/profile"
            element={
              <NGORoute>
                <NGOLayout>
                  <NGOProfile />
                </NGOLayout>
              </NGORoute>
            }
          />
          <Route
            path="/ngo/resources"
            element={
              <NGORoute>
                <NGOResources />
              </NGORoute>
            }
          />
          
          {/* Authority Routes */}
          <Route path="/authority/signin" element={<AuthoritySignIn />} />
          <Route
            path="/authority/dashboard"
            element={
              <AuthorityRoute>
                <AuthorityDashboard />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/disasters"
            element={
              <AuthorityRoute>
                <AuthorityDisasters />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/map"
            element={
              <AuthorityRoute>
                <AuthorityMap />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/user-disaster-report"
            element={
              <AuthorityRoute>
                <AuthorityUserDisasterReport />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/sos-reports"
            element={
              <Navigate to="/authority/user-disaster-report" replace />
            }
          />
          <Route
            path="/authority/isubmit-reports"
            element={
              <AuthorityRoute>
                <AuthorityIsubmitReports />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/donation-manage"
            element={
              <AuthorityRoute>
                <AuthorityDonationManagement />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/profile"
            element={
              <AuthorityRoute>
                <AuthorityProfile />
              </AuthorityRoute>
            }
          />
          
          {/* Disaster Response Routes */}
          <Route path="/disasterresponse/signin" element={<DisasterResponseSignIn />} />
          <Route
            path="/disasterresponse/dashboard"
            element={
              <DisasterResponseRoute>
                <DisasterResponseDashboard />
              </DisasterResponseRoute>
            }
          />
          <Route
            path="/disasterresponse/map"
            element={
              <DisasterResponseRoute>
                <div className="mt-4">Map Page Under Construction</div>
              </DisasterResponseRoute>
            }
          />
          <Route
            path="/disasterresponse/reports"
            element={
              <DisasterResponseRoute>
                <div className="mt-4">Reports Page Under Construction</div>
              </DisasterResponseRoute>
            }
          />
          <Route
            path="/disasterresponse/profile"
            element={
              <DisasterResponseRoute>
                <div className="mt-4">Profile Page Under Construction</div>
              </DisasterResponseRoute>
            }
          />
          <Route
            path="/disasterresponse/team"
            element={
              <DisasterResponseRoute>
                <div className="mt-4">Team Page Under Construction</div>
              </DisasterResponseRoute>
            }
          />

          {/* Redirect root to user home */}
          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />
        </Routes>
      </main>

      {/* Only show BottomNav on non-admin, non-firefighter, non-NGO, and non-Authority routes */}
      {isAuthenticated && 
       !window.location.pathname.startsWith('/admin') && 
       !window.location.pathname.startsWith('/firefighter') &&
       !window.location.pathname.startsWith('/ngo') &&
       !window.location.pathname.startsWith('/authority') &&
       !window.location.pathname.startsWith('/disasterresponse') && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
    <AuthProvider>
        <AdminAuthProvider>
          <FirefighterAuthProvider>
            <NGOAuthProvider>
              <AuthorityAuthProvider>
                <DisasterResponseAuthProvider>
                  <AppContent />
                </DisasterResponseAuthProvider>
              </AuthorityAuthProvider>
            </NGOAuthProvider>
          </FirefighterAuthProvider>
        </AdminAuthProvider>
      </AuthProvider>
      </Router>
  );
}

export default App; 