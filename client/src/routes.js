import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityProfile from './pages/AuthorityProfile';
import AuthorityMap from './pages/AuthorityMap';
import AuthoritySosReports from './pages/AuthoritySosReports';
import AuthorityIsubmitReports from './pages/AuthorityIsubmitReports';
import AuthorityDonationManagement from './pages/AuthorityDonationManagement';
import AuthorityDisasters from './pages/AuthorityDisasters';
import { Reports as NGOReports } from './components/ngo';
import NGOResources from './pages/NGOResources';

// Authority Routes
export const authorityRoutes = [
  {
    path: '/authority/dashboard',
    element: AuthorityDashboard,
    exact: true,
  },
  {
    path: '/authority/profile',
    element: AuthorityProfile,
    exact: true,
  },
  {
    path: '/authority/map',
    element: AuthorityMap,
    exact: true,
  },
  {
    path: '/authority/reports',
    element: AuthoritySosReports,
    exact: true,
  },
  {
    path: '/authority/isubmit-reports',
    element: AuthorityIsubmitReports,
    exact: true,
  },
  {
    path: '/authority/donation-manage',
    element: AuthorityDonationManagement,
    exact: true,
  },
  {
    path: '/authority/disasters',
    element: AuthorityDisasters,
    exact: true,
  }
];

// NGO Routes
export const ngoRoutes = [
  {
    path: '/ngo/reports',
    element: NGOReports,
    exact: true,
  },
  {
    path: '/ngo/resources',
    element: NGOResources,
    exact: true,
  }
]; 