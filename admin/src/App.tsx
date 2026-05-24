import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAdmin } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import MapView from './pages/Map';
import Citizens from './pages/Citizens';
import Posts from './pages/Posts';
import Admins from './pages/Admins';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { admin, loading } = useAdmin();
  if (loading) return null; // or spinner
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/issues" element={<Issues />} />
                  <Route path="/issues/:id" element={<Issues />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/citizens" element={<Citizens />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/admins" element={<Admins />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
