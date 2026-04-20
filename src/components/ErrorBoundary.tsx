import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '@/locales/he';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card-surface max-w-md p-8 text-center">
            <h2 className="font-fraunces text-2xl italic text-ink">
              {t.errors.boundaryTitle}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.errors.boundaryBody}
            </p>
            <Button
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              {t.errors.reload}
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
