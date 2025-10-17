import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import TouchButton from './TouchButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onRetry, onGoHome }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ¡Oops! Algo salió mal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <TouchButton
              onClick={onRetry}
              className="w-full flex justify-center items-center"
              variant="primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar nuevamente
            </TouchButton>

            <TouchButton
              onClick={onGoHome}
              className="w-full flex justify-center items-center"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </TouchButton>
          </div>

          {isDevelopment && error && (
            <div className="mt-8">
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Detalles del error (desarrollo)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded border text-left">
                  <p className="font-semibold text-red-600">Error:</p>
                  <pre className="whitespace-pre-wrap text-red-800 mb-2">
                    {error.toString()}
                  </pre>
                  
                  {errorInfo && (
                    <>
                      <p className="font-semibold text-red-600">Stack trace:</p>
                      <pre className="whitespace-pre-wrap text-red-800">
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;