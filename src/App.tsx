import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import AuthGuard from '@/components/auth/AuthGuard'

// Lazy-loaded pages
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Signup = lazy(() => import('@/pages/auth/Signup'))
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const Portfolios = lazy(() => import('@/pages/app/Portfolios'))
const PortfolioDetail = lazy(() => import('@/pages/app/PortfolioDetail'))
const Optimizer = lazy(() => import('@/pages/app/Optimizer'))
const Analytics = lazy(() => import('@/pages/app/Analytics'))
const History = lazy(() => import('@/pages/app/History'))
const Settings = lazy(() => import('@/pages/app/Settings'))
const SharedPortfolio = lazy(() => import('@/pages/public/SharedPortfolio'))

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/share/:token" element={<SharedPortfolio />} />

      {/* Protected app routes */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="portfolios" element={<Portfolios />} />
        <Route path="portfolios/:id" element={<PortfolioDetail />} />
        <Route path="portfolios/:id/optimize" element={<Optimizer />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
