import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import AppShell from './components/layout/AppShell'
import SignIn from './pages/SignIn'
import Home from './pages/Home'
import Issues from './pages/Issues'
import IssueDetail from './pages/IssueDetail'
import Report from './pages/Report'
import FormGuide from './pages/FormGuide'
import FormGuideDetail from './pages/FormGuideDetail'
import Neta from './pages/Neta'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'
import './styles/landing.css'

// Helper to redirect while dynamically replacing route params (e.g. :id)
const RedirectWithParams = ({ to }) => {
  const params = useParams()
  let target = to
  Object.entries(params).forEach(([key, value]) => {
    target = target.replace(`:${key}`, value)
  })
  return <Navigate to={target} replace />
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Authenticated layout routes */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="issues" element={<Issues />} />
              <Route path="issues/:id" element={<IssueDetail />} />
              <Route path="report" element={<Report />} />
              <Route path="forms" element={<FormGuide />} />
              <Route path="forms/:id" element={<FormGuideDetail />} />
              <Route path="neta" element={<Neta />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirects from old routes to /app/* */}
            <Route path="/issues" element={<Navigate to="/app/issues" replace />} />
            <Route path="/issues/:id" element={<RedirectWithParams to="/app/issues/:id" />} />
            <Route path="/forms" element={<Navigate to="/app/forms" replace />} />
            <Route path="/forms/:id" element={<RedirectWithParams to="/app/forms/:id" />} />
            <Route path="/report" element={<Navigate to="/app/report" replace />} />
            <Route path="/neta" element={<Navigate to="/app/neta" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />

            {/* Public 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
