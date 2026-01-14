# DC Map - Interactive Washington D.C. Explorer

An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations and immersive fly mode.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Mapbox](https://img.shields.io/badge/Mapbox-3.7-green)

## Features

- **Interactive Map**: Full-screen Mapbox GL JS map centered on Washington, D.C. with custom cartoonish/Minecraft-style rendering.
- **Fly Mode**: Smooth bird-like flight through D.C. streets with WASD controls.
- **Landmark Discovery**: Find and visit iconic D.C. locations and museums.
- **Seasonal Variations**: Visuals adapt to Spring, Summer, Fall, and Winter.
- **3D Visualization**: Real building heights, terrain elevation, and atmospheric sky.

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm (or npm)
- A Mapbox account (free tier works)

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd DCmap
   pnpm install
   ```

2. **Set up environment variables**
   
   Copy `env.example` to `.env.local` and add your Mapbox token:
   ```bash
   cp env.example .env.local
   ```
   
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

3. **Run development server**
   ```bash
   pnpm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Controls

### Map View
- **Pan:** Click and drag
- **Zoom:** Scroll wheel or pinch
- **Rotate:** Ctrl + drag
- **Tilt:** Right-click + drag

### Fly Mode
- **WASD / Arrow Keys:** Move
- **Mouse:** Look around
- **Space:** Ascend
- **Shift:** Descend
- **ESC:** Exit fly mode

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Mapping:** Mapbox GL JS v3
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **State:** React Context + Custom Hooks

## License

MIT License

## Author

**Prakriti Bista**

## Credits

- Map data and services by [Mapbox](https://www.mapbox.com/)
- Landmark data from [Open Data DC](https://opendata.dc.gov/)
