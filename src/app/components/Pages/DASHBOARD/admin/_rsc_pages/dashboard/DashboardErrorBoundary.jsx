'use client';

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard Error Boundary
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 *
 * @see https://github.com/bvaughn/react-error-boundary
 */
export class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to monitoring service (console for now)
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);

    // Store error details in state for display
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // Example with Sentry:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Card className="max-w-lg w-full border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred while loading the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show error details in development */}
              {isDevelopment && this.state.error && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono text-destructive mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs font-medium cursor-pointer">Component Stack</summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-32 text-muted-foreground">{this.state.errorInfo.componentStack}</pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={this.handleReset} variant="default" className="gap-2">
                  <RefreshCw size={16} />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                  <Home size={16} />
                  Go to Homepage
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">If this problem persists, please contact support.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 * Usage: withErrorBoundary(MyComponent)
 */
export function withErrorBoundary(WrappedComponent, fallback = null) {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <DashboardErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </DashboardErrorBoundary>
    );
  };
}
