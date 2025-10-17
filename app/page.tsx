'use client'

import { useState } from 'react'
import Map from './components/map/Map'
import Sidebar from './components/ui/Sidebar'
import SidebarToggle from './components/ui/SidebarToggle'
import { MapProvider } from './lib/MapContext'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [layersVisible, setLayersVisible] = useState({
    museums: false,
    trees: false,
    heatmap: false,
  })

  const handleToggleLayer = (layerId: keyof typeof layersVisible) => {
    setLayersVisible(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }))
  }

  return (
    <MapProvider>
      <main className="relative w-full h-screen overflow-hidden">
        <Map layersVisible={layersVisible} />
        <SidebarToggle
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          layersVisible={layersVisible}
          onToggleLayer={handleToggleLayer}
        />
      </main>
    </MapProvider>
  )
}

