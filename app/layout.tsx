import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '資産チェック - 日本語対応の個人資産管理ダッシュボード',
  description: '現金・預金、証券・投資、仮想通貨などの資産を一元管理。税率対応、投資シミュレーション機能付きの日本語対応資産管理ツール。',
  keywords: ['資産管理', '投資', 'ポートフォリオ', '家計簿', '仮想通貨', 'NISA', 'iDeCo'],
  authors: [{ name: '資産チェック' }],
  creator: '資産チェック',
  publisher: '資産チェック',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://steady-babka-a5fda8.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '資産チェック - 日本語対応の個人資産管理ダッシュボード',
    description: '現金・預金、証券・投資、仮想通貨などの資産を一元管理。税率対応、投資シミュレーション機能付きの日本語対応資産管理ツール。',
    url: 'https://steady-babka-a5fda8.netlify.app',
    siteName: '資産チェック',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '資産チェック - 日本語対応の個人資産管理ダッシュボード',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '資産チェック - 日本語対応の個人資産管理ダッシュボード',
    description: '現金・預金、証券・投資、仮想通貨などの資産を一元管理。税率対応、投資シミュレーション機能付き。',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
            <div className="container mx-auto flex h-14 items-center justify-between px-2 sm:px-4">
              <div className="flex items-center space-x-2 sm:space-x-6">
                <h1 className="text-sm sm:text-lg font-semibold whitespace-nowrap">
                  <span className="hidden sm:inline">資産管理ダッシュボード</span>
                  <span className="sm:hidden">資産チェック</span>
                </h1>
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

          {/* Fixed X (Twitter) Link */}
          <a
            href="https://x.com/motoyoshi0107"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Follow on X (Twitter)"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </ThemeProvider>
      </body>
    </html>
  )
}