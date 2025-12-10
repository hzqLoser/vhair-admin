import React, { Component, ReactNode, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Button, App as AntdApp } from 'antd';
import { router } from './router';
import { AuthProvider } from './hooks/useAuth';
import { setMessageApi } from './utils/messageApi';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch rendering errors
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <p className="text-gray-600 mb-6 bg-gray-100 p-4 rounded max-w-2xl overflow-auto border border-gray-300">
            {this.state.error?.message}
          </p>
          <Button type="primary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

const InnerApp: React.FC = () => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      {/* AntdApp provides context for static methods like message, notification, modal */}
      <AntdApp>
        <InnerApp />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;