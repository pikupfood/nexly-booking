'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function RistoranteRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/') }, [])
  return <div style={{minHeight:'100vh',background:'#fafaf9',display:'flex',alignItems:'center',justifyContent:'center',color:'#8a8680',fontSize:'14px'}}>Redirection...</div>
}
