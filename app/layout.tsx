import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: 'RQB 593 - Admin',
  description: 'Panel de administracion de propiedades inmobiliarias',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="https://xpznugqofelwvteosjny.supabase.co/storage/v1/object/sign/rqb-bucket/rqb-icon.ico?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xNGFlM2ZmNy1jMDJkLTRmNzUtYWVhYS0wNTY3NzI3YTAxYzYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJycWItYnVja2V0L3JxYi1pY29uLmljbyIsImlhdCI6MTc3MjU5OTc0MCwiZXhwIjoxODM1NjcxNzQwfQ.XLwyq-QgJB7ZwTp1smO6D2D5MYnaSp7K-3HIa6uHw5g" />
      </head>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
