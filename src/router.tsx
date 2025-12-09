import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import HairstylesPage from './pages/Hairstyles/HairstylesPage';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/Route/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// We need a wrapper component to handle the "Logged in user goes to /hairstyles if hitting /login" logic
// because standard router loaders don't easily access React Context hooks.
const LoginRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/hairstyles" replace />;
    }
    return <LoginPage />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/hairstyles" replace />,
      },
      {
        element: <AdminLayout />,
        children: [
          {
            path: 'hairstyles',
            element: <HairstylesPage />,
          },
          // Future routes here
          {
            path: '*',
            element: <div>404 Not Found</div>
          }
        ],
      },
    ],
  },
]);
