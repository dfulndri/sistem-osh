import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import DashboardLayout from '@/layouts/DashboardLayout.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import AIHIRADCPage from '@/pages/AIHIRADCPage.jsx';
import KalkulatorK3Page from '@/pages/KalkulatorK3Page.jsx';
import FTAPage from '@/pages/FTAPage.jsx';
import ETAPage from '@/pages/ETAPage.jsx';
import CCAPage from '@/pages/CCAPage.jsx';
import LaporanPage from '@/pages/LaporanPage.jsx';
import KontakPage from '@/pages/KontakPage.jsx';
import TentangSistemPage from '@/pages/TentangSistemPage.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected routes with DashboardLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-hiradc"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AIHIRADCPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/calculator"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <KalkulatorK3Page />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/fta"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <FTAPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/eta"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ETAPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cca"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CCAPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LaporanPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/kontak"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <KontakPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tentang-sistem"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TentangSistemPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;