import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-600">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;