import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFeedStore } from '@/store/feedStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSourcesStore } from '@/store/sourcesStore';
import Index from './pages/Index';
import Settings from './pages/Settings';
import Sources from './pages/Sources';
import NotFound from './pages/NotFound';

// Protected route wrapper - redirects to home if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuthenticator();

  if (authStatus !== 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Login page wrapper
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Authenticator />
    </div>
  );
}

function AppContent() {
  const { authStatus, signOut } = useAuthenticator();
  const isAuthenticated = authStatus === 'authenticated';
  const [showLogin, setShowLogin] = useState(false);

  const loadArticles = useFeedStore((state) => state.loadArticles);
  const setAuthenticated = useFeedStore((state) => state.setAuthenticated);
  const setSentimentFilters = useFeedStore((state) => state.setSentimentFilters);
  const loadPreferences = useSettingsStore((state) => state.loadPreferences);
  const loadSources = useSourcesStore((state) => state.loadSources);
  const preferences = useSettingsStore((state) => state.preferences);

  // Update auth state in store when it changes
  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Authenticated: load sources (creates subscriptions if needed), then articles and preferences
      loadSources().then(() => loadArticles());
      loadPreferences();
    } else {
      // Public: just load articles (from system sources)
      loadArticles();
    }
  }, [isAuthenticated, loadSources, loadArticles, loadPreferences]);

  // Sync sentiment filters from preferences to feed store (authenticated only)
  useEffect(() => {
    if (isAuthenticated && preferences?.sentimentFilters) {
      setSentimentFilters(preferences.sentimentFilters);
    }
  }, [isAuthenticated, preferences?.sentimentFilters, setSentimentFilters]);

  // Show login modal
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to feed
          </button>
          <Authenticator />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Index
                signOut={isAuthenticated ? signOut : undefined}
                onLogin={() => setShowLogin(true)}
                isAuthenticated={isAuthenticated}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings signOut={signOut ?? (() => {})} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sources"
            element={
              <ProtectedRoute>
                <Sources signOut={signOut ?? (() => {})} />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <Authenticator.Provider>
      <AppContent />
    </Authenticator.Provider>
  );
}
