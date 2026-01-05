import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for authentication pages.
 * Includes branded header and centers the auth content.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              <span className="text-gradient">MIN</span>
              <span className="text-foreground">FEED</span>
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2 font-display text-sm">
            Filter the noise, find the signal
          </p>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Go back
          </Link>
        </div>
      </main>
    </div>
  );
}
