import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { LandingPage } from '@/src/pages/LandingPage';
import { LoginPage } from '@/src/pages/LoginPage';
import { RegisterPage } from '@/src/pages/RegisterPage';
import { ConsumerDashboard } from '@/src/pages/ConsumerDashboard';
import { AdminDashboard } from '@/src/pages/AdminDashboard';
import { ProfilePage } from '@/src/pages/ProfilePage';
import { TicketDetails } from '@/src/pages/TicketDetails';
import { Toaster } from '@/components/ui/sonner';
import { NotificationListener } from '@/src/components/NotificationListener';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, userData, loading, isAdmin } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <NotificationListener />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ConsumerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="/ticket/:id" element={
                <ProtectedRoute>
                  <TicketDetails />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}
