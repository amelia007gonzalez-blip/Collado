import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Collado Europa Conecta',
    description: 'Red de dominicanos en Europa que apoyan a David Collado',
    keywords: ['David Collado', 'dominicanos', 'Europa', 'política dominicana'],
    openGraph: {
        title: 'Collado Europa Conecta',
        description: 'Red de dominicanos en Europa que apoyan a David Collado',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid #002D62',
                        },
                    }}
                />
                {children}
            </body>
        </html>
    )
}
