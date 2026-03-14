import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réservations en ligne',
  description: 'Réservez votre chambre, table, soin ou terrain en quelques clics',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#fafaf9', color: '#1a1a1a', fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 400, minHeight: '100vh' }}>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          a { color: inherit; text-decoration: none; }
          input, select, textarea, button { font-family: "'DM Sans', system-ui, sans-serif"; }
          ::selection { background: #1a1a1a18; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .anim-fadeup   { animation: fadeUp 0.5s ease both; }
          .anim-fadeup-2 { animation: fadeUp 0.5s ease 0.08s both; }
          .anim-fadeup-3 { animation: fadeUp 0.5s ease 0.16s both; }
          .anim-fadeup-4 { animation: fadeUp 0.5s ease 0.24s both; }
          .anim-fadeup-5 { animation: fadeUp 0.5s ease 0.32s both; }

          .service-card { transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s; }
          .service-card:hover { transform: translateY(-2px); }

          input:focus, select:focus, textarea:focus { outline: none; border-color: #1a1a1a !important; }
          input::placeholder, textarea::placeholder { color: #c0bdb8; }
          select option { background: white; color: #1a1a1a; }

          .btn-primary {
            background: #1a1a1a; color: white; border: none;
            padding: 13px 24px; border-radius: 8px; cursor: pointer;
            font-size: 14px; font-weight: 500; font-family: "'DM Sans', system-ui, sans-serif";
            transition: background 0.15s, transform 0.15s;
          }
          .btn-primary:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
          .btn-primary:disabled { background: #d0cdc8; cursor: not-allowed; color: #a0a0a0; }
          .btn-secondary {
            background: transparent; color: #6b6760; border: 1px solid #d8d5d0;
            padding: 12px 20px; border-radius: 8px; cursor: pointer;
            font-size: 14px; font-family: "'DM Sans', system-ui, sans-serif";
            transition: border-color 0.15s;
          }
          .btn-secondary:hover { border-color: #1a1a1a; color: #1a1a1a; }

          @media (max-width: 640px) {
            nav { padding: 16px 20px !important; }
            section { padding-left: 20px !important; padding-right: 20px !important; }
          }
        `}</style>
        {children}
      </body>
    </html>
  )
}
