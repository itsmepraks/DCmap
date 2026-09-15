'use client'

import dynamic from 'next/dynamic'
const WorldExplorer = dynamic(() => import('./components/world/WorldExplorer'), { ssr: false })
export default function Home() { return <WorldExplorer /> }
