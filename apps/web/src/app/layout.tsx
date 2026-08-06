import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZeroDesk AI | AI-Powered Front Desk for Service Businesses',
  description: 'Transform your front desk with AI. Handle calls, WhatsApp, and chat with a single intelligent brain. CRM, appointments, and analytics built-in.',
  keywords: ['AI front desk', 'voice AI', 'WhatsApp automation', 'CRM', 'appointment booking'],
};

import { PostHogProvider } from '@/components/providers/posthog-provider';
import { RoleProvider } from '@/components/providers/role-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <PostHogProvider>
            <ThemeProvider defaultTheme="dark">
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
            </ThemeProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
