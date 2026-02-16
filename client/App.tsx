
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LayoutProvider } from './context/LayoutContext';
import { CRMPage } from './pages/CRMPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ExecutivePage } from './pages/ExecutivePage';
import { SalesCoordinatorPage } from './pages/SalesCoordinatorPage';
import { AccountsPage } from './pages/AccountsPage';
import { InstallationPage } from './pages/InstallationPage';
import { WorkCompletedPage } from './pages/WorkCompletedPage';
import { DashboardPage } from './pages/DashboardPage';

// Super Admin Route - For Analytics Dashboard Only
const SuperAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_SUPER_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Admin Route (Admin + Super Admin) - For CRM/Pipeline and overview pages
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Executive Route - For Project Management (ADMIN only, not SUPER_ADMIN)
const ExecutiveRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_EXECUTIVE' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Sales Route - For Sales Coordinator (ADMIN only, not SUPER_ADMIN)
const SalesRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_SALES_COORDINATOR' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Accounts Route - For Accounts Department (ADMIN only, not SUPER_ADMIN)
const AccountsRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_ACCOUNTS' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Installation Route - For Installation Team (ADMIN only, not SUPER_ADMIN)
const InstallationRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_INSTALLATION' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Operational Route (SA + Admin + Employee) - For Companies/Registry
const OperationalRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_CLIENT') {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};

// Public Route (Redirects to appropriate page if already logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        // Use root redirect which handles role-based routing
        return <Navigate to="/" replace />;
    }
    return children;
};

// Root Redirect Logic - Routes users to appropriate default page based on role
const RootRedirect: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Route based on user role to their primary workspace
    const role = user?.role;
    
    switch (role) {
        case 'ROLE_SUPER_ADMIN':
            // Super Admin goes to analytics dashboard
            return <Navigate to="/dashboard" replace />;
        
        case 'ROLE_ADMIN':
            // Admin goes to CRM/Pipeline for operations management
            return <Navigate to="/crm" replace />;
        
        case 'ROLE_EXECUTIVE':
            return <Navigate to="/projects" replace />;
        
        case 'ROLE_SALES_COORDINATOR':
            return <Navigate to="/sales" replace />;
        
        case 'ROLE_ACCOUNTS':
            return <Navigate to="/accounts" replace />;
        
        case 'ROLE_INSTALLATION':
            return <Navigate to="/installation" replace />;
        
        case 'ROLE_EMPLOYEE':
            return <Navigate to="/companies" replace />;
        
        case 'ROLE_CLIENT':
            // Clients have limited access - redirect to unauthorized
            return <Navigate to="/unauthorized" replace />;
        
        default:
            // Fallback for unknown roles
            return <Navigate to="/projects" replace />;
    }
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />

            <Route path="/forgot-password" element={
                <PublicRoute>
                    <ForgotPasswordPage />
                </PublicRoute>
            } />
            
            {/* Dashboard - Super Admin Only */}
            <Route path="/dashboard" element={
                <SuperAdminRoute>
                    <DashboardPage />
                </SuperAdminRoute>
            } />
            
            {/* Projects - Executive Module */}
            <Route path="/projects" element={
                <ExecutiveRoute>
                    <ExecutivePage />
                </ExecutiveRoute>
            } />
            
            {/* Sales Coordinator Module */}
            <Route path="/sales" element={
                <SalesRoute>
                    <SalesCoordinatorPage />
                </SalesRoute>
            } />
            
            {/* Accounts Module */}
            <Route path="/accounts" element={
                <AccountsRoute>
                    <AccountsPage />
                </AccountsRoute>
            } />
            
            {/* Installation Module */}
            <Route path="/installation" element={
                <InstallationRoute>
                    <InstallationPage />
                </InstallationRoute>
            } />
            
            {/* Work Completed Archive - All authenticated users */}
            <Route path="/completed" element={
                <OperationalRoute>
                    <WorkCompletedPage />
                </OperationalRoute>
            } />
            
            {/* Pipeline - Admin and Super Admin only */}
            <Route path="/crm" element={
                <AdminRoute>
                    <CRMPage />
                </AdminRoute>
            } />
            
            {/* Registry - All operational users (SA + Admin + Employee) */}
            <Route path="/companies" element={
                <OperationalRoute>
                    <CompaniesPage />
                </OperationalRoute>
            } />

            {/* System Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Catch All - Order Matters */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <ToastProvider>
            <LayoutProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </LayoutProvider>
        </ToastProvider>
    </AuthProvider>
  );
};

export default App;
    