import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'PoC Expediente Clínico - EQUIPO 6',
  description: 'POC'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" aria-label="home">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
              </svg>
            </Link>
            <h1>Sistema Nacional de Expediente Clínico (POC)</h1>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
