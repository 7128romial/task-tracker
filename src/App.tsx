import { Toaster } from 'sonner';
import { Dashboard } from '@/components/Dashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <Dashboard />
        <Toaster
          dir="rtl"
          position="top-center"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'font-sans text-xs',
            },
          }}
        />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
