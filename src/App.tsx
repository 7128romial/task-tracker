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
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'font-heebo',
            },
          }}
        />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
