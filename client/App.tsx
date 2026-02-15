
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

// Admin Route (Super Admin + Admin) - For CRM/Pipeline
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// Executive Route - For Project Management
const ExecutiveRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_EXECUTIVE' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') {
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

// Public Route (Redirects to CRM if already logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/crm" replace />;
    }
    return children;
};

// Root Redirect Logic
const RootRedirect: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Navigate to="/crm" replace />;
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
            
            {/* Projects - Executive Module */}
            <Route path="/projects" element={
                <ExecutiveRoute>
                    <ExecutivePage />
                </ExecutiveRoute>
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
    