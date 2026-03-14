import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nexly — Réservations',
  description: 'Réservez votre séjour, dîner, spa ou padel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0, padding: 0,
        background: '#0c0c0e',
        color: '#f0ece4',
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
        minHeight: '100vh',
      }}>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          ::selection { background: #c9a96e40; color: #f0ece4; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0c0c0e; }
          ::-webkit-scrollbar-thumb { background: #c9a96e60; border-radius: 2px; }
          a { color: inherit; text-decoration: none; }
          input, select, textarea, button { font-family: "'Jost', sans-serif"; }
          
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .anim-fadeup { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .anim-fadeup-2 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
          .anim-fadeup-3 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
          .anim-fadeup-4 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
          .anim-fadeup-5 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both; }
          .anim-fadein { animation: fadeIn 1s ease both; }
          
          .service-card {
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease;
          }
          .service-card:hover {
            transform: translateY(-6px);
          }
          .gold-btn {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .gold-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: translateX(-100%);
            transition: transform 0.5s ease;
          }
          .gold-btn:hover::after { transform: translateX(100%); }
          .gold-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,169,110,0.3); }
          
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #c9a96e !important;
          }
          input::placeholder, textarea::placeholder { color: #ffffff40; }
        `}</style>
        {children}
      </body>
    </html>
  )
}
