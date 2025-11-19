'use client'

import { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface HiddenLandmark {
  id: string
  name: string
  coordinates: [number, number]
  description: string
  funFact: string
  category: string
  icon: string
  hint: string
  reward: number
}

interface HiddenLandmarksLayerProps {
  map: mapboxgl.Map | null
  isVisible: boolean
  visitedLandmarks: string[]
  onDiscovered: (landmarkId: string) => void
}

export default function HiddenLandmarksLayer({
  map,
  isVisible,
  visitedLandmarks,
  onDiscovered
}: HiddenLandmarksLayerProps) {
  const [landmarks, setLandmarks] = useState<HiddenLandmark[]>([])
  const [markers, setMarkers] = useState<Map<string, mapboxgl.Marker>>(new Map())

  // Load hidden landmarks data
  useEffect(() => {
    fetch('/data/hidden-landmarks.json')
      .then(res => res.json())
      .then(data => setLandmarks(data))
      .catch(err => console.error('Failed to load hidden landmarks:', err))
  }, [])

  // Add markers to map
  useEffect(() => {
    if (!map || !landmarks.length) return

    // Clear existing markers
    markers.forEach(marker => marker.remove())
    const newMarkers = new Map<string, mapboxgl.Marker>()

    if (isVisible) {
      landmarks.forEach(landmark => {
        const isVisited = visitedLandmarks.includes(landmark.id)
        
        // Create custom marker element
        const el = document.createElement('div')
        el.className = 'hidden-landmark-marker'
        el.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: ${isVisited 
            ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' 
            : 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
          };
          border: 3px solid ${isVisited ? '#B8860B' : '#4A148C'};
          box-shadow: 0 4px 12px ${isVisited ? 'rgba(255,215,0,0.5)' : 'rgba(156,39,176,0.5)'};
          transition: all 0.3s ease;
          animation: ${isVisited ? 'none' : 'pulse 2s infinite'};
        `
        el.innerHTML = `<span style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${landmark.icon}</span>`
        
        // Add CSS animation
        const style = document.createElement('style')
        style.textContent = `
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(156,39,176,0.5); }
            50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(156,39,176,0.8); }
          }
          .hidden-landmark-marker:hover {
            transform: scale(1.15) !important;
            box-shadow: 0 6px 20px rgba(156,39,176,0.9) !important;
          }
        `
        document.head.appendChild(style)

        // Create popup HTML
        const popupHTML = `
          <div style="
            padding: 0;
            margin: -15px;
            border-radius: 8px;
            overflow: hidden;
            font-family: monospace;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            border: 3px solid ${isVisited ? '#FFD700' : '#9C27B0'};
            background: linear-gradient(145deg, #F3E5F5 0%, #E1BEE7 100%);
            max-width: 280px;
          ">
            <!-- Header -->
            <div style="
              padding: 12px;
              background: linear-gradient(135deg, ${isVisited ? '#FFD700' : '#9C27B0'} 0%, ${isVisited ? '#FFA500' : '#7B1FA2'} 100%);
              border-bottom: 3px solid ${isVisited ? '#B8860B' : '#4A148C'};
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                  ${landmark.icon}
                </div>
                <div style="flex: 1;">
                  <h3 style="
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    font-weight: bold;
                    color: #FFF;
                    text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
                  ">${landmark.name}</h3>
                  <div style="
                    font-size: 10px;
                    color: rgba(255,255,255,0.9);
                    font-weight: bold;
                  ">🎁 Hidden Gem</div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div style="padding: 16px; background: linear-gradient(145deg, #F3E5F5 0%, #E1BEE7 100%);">
              ${isVisited ? `
                <div style="
                  margin-bottom: 12px;
                  padding: 10px;
                  background: rgba(255,255,255,0.8);
                  border: 2px solid ${isVisited ? '#FFD700' : '#9C27B0'};
                  border-radius: 6px;
                ">
                  <div style="
                    font-size: 10px;
                    font-weight: bold;
                    color: #4A148C;
                    margin-bottom: 4px;
                  ">📖 About</div>
                  <p style="
                    margin: 0;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #2C1810;
                  ">${landmark.description}</p>
                </div>

                <div style="
                  margin-bottom: 12px;
                  padding: 10px;
                  background: rgba(255,255,255,0.8);
                  border: 2px solid ${isVisited ? '#FFD700' : '#9C27B0'};
                  border-radius: 6px;
                ">
                  <div style="
                    font-size: 10px;
                    font-weight: bold;
                    color: #4A148C;
                    margin-bottom: 4px;
                  ">💡 Did You Know?</div>
                  <p style="
                    margin: 0;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #2C1810;
                  ">${landmark.funFact}</p>
                </div>

                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 8px 12px;
                  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                  border: 2px solid #B8860B;
                  border-radius: 6px;
                  box-shadow: 0 2px 8px rgba(255,215,0,0.3);
                ">
                  <span style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #FFF;
                    text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                  ">✨ DISCOVERED!</span>
                  <span style="
                    font-size: 11px;
                    font-weight: bold;
                    color: #FFF;
                    text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
                  ">+${landmark.reward} XP</span>
                </div>
              ` : `
                <div style="text-align: center; padding: 20px 10px;">
                  <div style="font-size: 48px; margin-bottom: 12px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));">
                    🔮
                  </div>
                  <div style="
                    font-size: 14px;
                    font-weight: bold;
                    color: #4A148C;
                    margin-bottom: 8px;
                  ">Mysterious Location</div>
                  <p style="
                    margin: 0 0 12px 0;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #5D4037;
                    font-style: italic;
                  ">"${landmark.hint}"</p>
                  <div style="
                    font-size: 10px;
                    padding: 6px 12px;
                    background: rgba(156,39,176,0.2);
                    border: 1px solid #9C27B0;
                    border-radius: 4px;
                    color: #4A148C;
                    font-weight: bold;
                  ">Click to discover and earn +${landmark.reward} XP!</div>
                </div>
              `}
            </div>
          </div>
        `

        // Create marker with popup
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(landmark.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML))
          .addTo(map)

        // Handle click for discovery
        el.addEventListener('click', () => {
          if (!isVisited) {
            onDiscovered(landmark.id)
          }
        })

        newMarkers.set(landmark.id, marker)
      })
    }

    setMarkers(newMarkers)

    return () => {
      newMarkers.forEach(marker => marker.remove())
    }
  }, [map, landmarks, isVisible, visitedLandmarks, onDiscovered])

  return null
}

