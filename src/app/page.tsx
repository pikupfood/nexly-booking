export default function HomePage() {
  return (
    <main style={{ minHeight:'100vh', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ textAlign:'center', maxWidth:'440px' }}>
        <div style={{ width:'48px', height:'48px', background:'#1a1a1a', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'20px', margin:'0 auto 24px' }}>N</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:'26px', fontWeight:400, color:'#1a1a1a', margin:'0 0 12px' }}>Portail de réservations</h1>
        <p style={{ fontSize:'14px', color:'#6b6760', lineHeight:1.7, margin:'0 0 24px' }}>
          Ce lien est incomplet. Pour accéder au portail de votre établissement, utilisez le lien complet fourni par votre hôtel ou structure.
        </p>
        <div style={{ background:'#f5f5f3', borderRadius:'10px', padding:'14px 18px', fontSize:'13px', color:'#8a8680', fontFamily:'monospace' }}>
          nexly-booking.vercel.app/<strong style={{ color:'#1a1a1a' }}>nom-de-votre-structure</strong>
        </div>
        <div style={{ marginTop:'32px', fontSize:'11px', color:'#c0bdb8' }}>
          Propulsé par <a href="https://nexlyhub.com" target="_blank" rel="noopener" style={{ color:'#9a9690' }}>Nexly Hub</a>
        </div>
      </div>
    </main>
  )
}
