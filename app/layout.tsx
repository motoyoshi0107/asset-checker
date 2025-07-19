import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '資産管理ダッシュボード',
  description: '資産、支出、投資目標を管理しましょう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
              <div className="flex items-center space-x-6">
                <h1 className="text-lg font-semibold">資産管理ダッシュボード</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t">
            <div className="container mx-auto px-4 py-4">
              <p className="text-sm text-muted-foreground text-center">
                資産管理ダッシュボード - あなたの資産形成をサポート
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}