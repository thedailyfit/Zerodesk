import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NicheProvider } from '@/components/providers/niche-provider';
import { Toaster } from 'sonner';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { RoleProvider } from '@/components/providers/role-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZeroDesk AI | AI-Powered Front Desk for Service Businesses',
  description: 'Transform your front desk with AI. Handle calls, WhatsApp, and chat with a single intelligent brain. Lead Management, appointments, and analytics built-in.',
  keywords: ['AI front desk', 'voice AI', 'WhatsApp automation', 'Lead Management', 'appointment booking'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_aWRlYWwtZWxlcGhhbnQtNDMuY2xlcmsuYWNjb3VudHMuZGV2JA'}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <PostHogProvider>
            <ThemeProvider defaultTheme="dark">
              <NicheProvider>
                <RoleProvider>
                  {children}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      },
                    }}
                  />
                </RoleProvider>
              </NicheProvider>
            </ThemeProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
