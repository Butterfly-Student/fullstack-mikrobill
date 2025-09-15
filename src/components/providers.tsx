import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/navigation-progress";
// Context Providers
import { ThemeProvider } from '@/context/theme-provider';
import { FontProvider } from '@/context/font-provider';
import { DirectionProvider } from '@/context/direction-provider';
import { StrictMode } from 'react';

interface AppProvidersProps {
  children: React.ReactNode
}

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export default function Providers({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <NavigationProgress />
              {children}
              <Toaster duration={3000} />
              {import.meta.env.MODE === 'development' && (
                <>
                  <ReactQueryDevtools buttonPosition="bottom-left" />
                  <TanStackRouterDevtools position="bottom-right" />
                </>
              )}
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}