import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';

// Agencies Module
import AgenciesList from './pages/agencies/AgenciesList';
import AgencyDetail from './pages/agencies/AgencyDetail';
import AgencyForm from './pages/agencies/AgencyForm';

// Users Module
import UsersList from './pages/users/UsersList';
import UserDetail from './pages/users/UserDetail';
import UserForm from './pages/users/UserForm';

// Voyages Module
import VoyagesList from './pages/voyages/VoyagesList';
import VoyageForm from './pages/voyages/VoyageForm';
import VoyageDetail from './pages/voyages/VoyageDetail';

// Reservations Module
import ReservationsList from './pages/reservations/ReservationsList';
import ReservationForm from './pages/reservations/ReservationForm';
import ReservationDetails from './pages/reservations/ReservationDetails';

// Finance Module
import FinanceDashboard from './pages/finance/FinanceDashboard';
import TransactionsList from './pages/finance/TransactionsList';
import Commissions from './pages/finance/Commissions';

// Admin Module
import CriticalActions from './pages/admin/CriticalActions';
import SubAdminsList from './pages/admin/SubAdminsList';

// Support Module
import ComplaintsList from './pages/support/ComplaintsList';
import ComplaintDetail from './pages/support/ComplaintDetail';

// Settings Module
import Settings from './pages/settings/Settings';

// Pages placeholder (à créer)
const PlaceholderPage = ({ title }) => (
    <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Cette page est en cours de développement.</p>
    </div>
);

const router = createBrowserRouter([
    // Route publique - Login
    {
        path: '/login',
        element: <Login />
    },

    // Routes protégées
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: 'agencies',
                element: <AgenciesList />
            },
            {
                path: 'agencies/new',
                element: <AgencyForm />
            },
            {
                path: 'agencies/:id',
                element: <AgencyDetail />
            },
            {
                path: 'agencies/:id/edit',
                element: <AgencyForm />
            },
            {
                path: 'users',
                element: <UsersList />
            },
            {
                path: 'users/new',
                element: <UserForm />
            },
            {
                path: 'users/:id',
                element: <UserDetail />
            },
            {
                path: 'users/:id/edit',
                element: <UserForm />
            },
            {
                path: 'voyages',
                element: <VoyagesList />
            },
            {
                path: 'voyages/new',
                element: <VoyageForm />
            },
            {
                path: 'voyages/:id',
                element: <VoyageDetail />
            },
            {
                path: 'voyages/:id/edit',
                element: <VoyageForm />
            },
            // Ancienne route trips redirige vers voyages
            {
                path: 'trips',
                element: <Navigate to="/voyages" replace />
            },
            {
                path: 'trips/:id',
                element: <PlaceholderPage title="Détail Voyage" />
            },
            {
                path: 'reservations',
                element: <ReservationsList />
            },
            {
                path: 'reservations/new',
                element: <ReservationForm />
            },
            {
                path: 'reservations/:id',
                element: <ReservationDetails />
            },
            {
                path: 'finance',
                element: <FinanceDashboard />
            },
            {
                path: 'finance/transactions',
                element: <TransactionsList />
            },
            {
                path: 'finance/commissions',
                element: <Commissions />
            },
            {
                path: 'support',
                element: <ComplaintsList />
            },
            {
                path: 'support/complaints',
                element: <ComplaintsList />
            },
            {
                path: 'support/:id',
                element: <ComplaintDetail />
            },
            {
                path: 'critical-actions',
                element: <CriticalActions />
            },
            {
                path: 'sub-admins',
                element: <SubAdminsList />
            },
            {
                path: 'settings',
                element: <Settings />
            }
        ]
    },

    // Catch-all redirect
    {
        path: '*',
        element: <Navigate to="/" replace />
    }
]);

function Router() {
    return <RouterProvider router={router} />;
}

export default Router;
