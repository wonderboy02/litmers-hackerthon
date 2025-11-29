import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ToastProvider } from './providers/ToastProvider'

export const metadata: Metadata = {
  title: 'Unlooped MVP',
  description: 'Unlooped MVP Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
