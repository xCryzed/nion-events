import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '@/hooks/use-google-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Track the error in Google Analytics
    trackError(error, 'react_error_boundary', 'global', {
      error_info: {
        componentStack: errorInfo.componentStack?.substring(0, 1000), // Limit length
        error_boundary: true
      },
      props: {
        children_type: typeof this.props.children
      }
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    try {
      trackError('User initiated reload after error', 'user_action', 'error_boundary');
      window.location.reload();
    } catch (reloadError) {
      console.error('Error during reload:', reloadError);
    }
  };

  handleRetry = () => {
    try {
      trackError('User retry after error', 'user_action', 'error_boundary');
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } catch (retryError) {
      console.error('Error during retry:', retryError);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
          <Card className="glass-card max-w-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl text-destructive">Ups, etwas ist schief gelaufen</CardTitle>
              <CardDescription>
                Ein unerwarteter Fehler ist aufgetreten. Das Problem wurde automatisch gemeldet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <p className="font-medium mb-2">Technische Details:</p>
                <code className="text-xs break-all">
                  {this.state.error?.message || 'Unbekannter Fehler'}
                </code>
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Seite neu laden
                </Button>
              </div>

              <div className="text-center">
                <a
                  href="/"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    try {
                      trackError('User navigated to home after error', 'user_action', 'error_boundary');
                    } catch (e) {
                      console.error('Error tracking navigation:', e);
                    }
                  }}
                >
                  Zurück zur Startseite
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;