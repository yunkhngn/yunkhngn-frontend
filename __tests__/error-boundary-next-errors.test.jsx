import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

function Thrower({ error }) {
  throw error;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  test('renders fallback for ordinary runtime errors', () => {
    render(
      <ErrorBoundary>
        <Thrower error={new Error('boom')} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
  });

  test('re-throws Next.js notFound() errors so the framework can render not-found.jsx', () => {
    const nextError = new Error('NEXT_NOT_FOUND');
    nextError.digest = 'NEXT_NOT_FOUND';

    const outerCatch = jest.fn();
    class OuterBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { caughtDigest: null };
      }
      static getDerivedStateFromError(error) {
        return { caughtDigest: error?.digest ?? 'unknown' };
      }
      componentDidCatch(error) {
        outerCatch(error?.digest);
      }
      render() {
        if (this.state.caughtDigest) {
          return <div data-testid="outer-caught">{this.state.caughtDigest}</div>;
        }
        return this.props.children;
      }
    }

    render(
      <OuterBoundary>
        <ErrorBoundary>
          <Thrower error={nextError} />
        </ErrorBoundary>
      </OuterBoundary>
    );

    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('outer-caught')).toHaveTextContent('NEXT_NOT_FOUND');
    expect(outerCatch).toHaveBeenCalledWith('NEXT_NOT_FOUND');
  });

  test('re-throws Next.js redirect() errors as well', () => {
    const redirectError = new Error('NEXT_REDIRECT');
    redirectError.digest = 'NEXT_REDIRECT;replace;/login;307;';

    class OuterBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { caught: null };
      }
      static getDerivedStateFromError(error) {
        return { caught: error?.digest ?? 'unknown' };
      }
      render() {
        if (this.state.caught) {
          return <div data-testid="redirect-caught">{this.state.caught}</div>;
        }
        return this.props.children;
      }
    }

    render(
      <OuterBoundary>
        <ErrorBoundary>
          <Thrower error={redirectError} />
        </ErrorBoundary>
      </OuterBoundary>
    );

    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('redirect-caught').textContent).toMatch(/^NEXT_REDIRECT/);
  });
});
