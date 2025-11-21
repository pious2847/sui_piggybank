import React, { Component, ReactNode } from 'react';
import { Text } from '@radix-ui/themes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6" role="alert">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl" aria-hidden="true">⚠️</span>
            <Text className="text-red-400 font-semibold text-lg">Something went wrong</Text>
          </div>
          <Text className="text-red-300 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </Text>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg px-4 py-2 text-red-300 text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}