import { Component, ErrorInfo, ReactNode } from 'react';
import { TriangleAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Storefront crash boundary.
 *
 * Mounted OUTSIDE LangProvider (it wraps the whole router), so it reads the
 * saved language preference directly from localStorage (same key as
 * LangContext). Users see a calm bilingual message, never raw error text or
 * implementation details.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Detailed logging in development only; production logs without detail.
    if (import.meta.env.DEV) {
      console.error('ED Retail app crashed:', error, info);
    } else {
      console.error('Application error occurred.');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const sw = typeof window !== 'undefined' && window.localStorage.getItem('edmark-lang') === 'sw';
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <TriangleAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-lg font-extrabold text-neutral-900">
                {sw ? 'Kuna tatizo limetokea' : 'Something went wrong'}
              </h1>
              <p className="text-sm text-neutral-500">
                {sw
                  ? 'Hitilafu isiyotarajiwa imetokea. Tafadhali pakia upya ukurasa na ujaribu tena.'
                  : 'An unexpected error occurred. Please reload the page and try again.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {sw ? 'Pakia Upya' : 'Reload App'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}