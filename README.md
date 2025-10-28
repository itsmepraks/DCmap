# Project Anima DC

An interactive, animated digital portrait of Washington, D.C. that visualizes the city's dynamic data layers through a sleek, modern user interface.

![Project Status](https://img.shields.io/badge/status-phase%201%20complete-success)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Mapbox](https://img.shields.io/badge/Mapbox-3.7-green)

## 🎯 Overview

This portfolio project showcases advanced frontend development skills using:
- **Next.js 15** with App Router and TypeScript
- **Mapbox GL JS** for interactive map visualization
- **Framer Motion** for smooth UI animations
- **Tailwind CSS** for styling

## ✨ Features

### Phase 1 (MVP) - ✅ Complete
- ✅ Full-screen interactive map centered on Washington, D.C.
- ✅ **Bold, vibrant UI matching illustrated map style**
- ✅ **Animated sidebar with spring physics animations**
- ✅ Museums data layer with custom blue gradient popups
- ✅ **Rich hover effects and smooth transitions throughout**
- ✅ Custom illustrated map style with warm beige/terracotta/green palette
- ✅ **Modern design system with cohesive color language**

### Phase 2 - Partially Complete  
- ✅ **Animated greenery layer with seasonal variations** (F4)
  - Interactive tree canopy visualization with green gradient popups
  - 4 seasonal icon sets with color-coded season picker
  - Emojis for visual appeal (🌸☀️🍂❄️)
  - Smart clustering for performance (50+ trees)
  - Click clusters to zoom, click trees for beautiful popups
  - **Bold seasonal controls with glow effects**
- 🔄 Dynamic urban heat map with monthly data (F5 - Coming Soon)

### UI/UX Design - ✅ Complete Redesign
- ✅ **Bold, vibrant color palette** from illustrated map
- ✅ **Spring physics animations** on all interactions
- ✅ **Gradient headers** with emojis in popups
- ✅ **Color-coded layer toggles** with active indicators
- ✅ **Season-specific buttons** with hover glow
- ✅ **Custom scrollbars** matching terracotta theme
- ✅ **Hover effects** on all interactive elements
- ✅ **Warm beige background** matching map aesthetic

### Live Location Tracking - ✅ New Feature
- ✅ **Real-time GPS tracking** with blue pulsing dot
- ✅ **Auto-center** on first location detection
- ✅ **Accuracy circle** showing GPS precision
- ✅ **Continuous tracking** as you move
- ✅ **Styled button** matching UI theme (bottom-right)
- ✅ **Direction arrow** when heading available
- ✅ **Privacy-first** with user permission control

### Apple Maps-Style 3D View - ✅ New Feature
- ✅ **3D Buildings** - Terracotta extruded buildings with real heights
- ✅ **3D Terrain** - Elevation data with 1.5x exaggeration
- ✅ **Atmospheric Sky** - Realistic horizon gradient
- ✅ **Advanced Lighting** - Ambient occlusion for depth
- ✅ **Manual Tilt** - Right-click + drag to tilt (up to 85°)
- ✅ **Rotation** - Ctrl + drag to rotate view
- ✅ **Smooth Controls** - Cinematic camera movements
- ✅ **Performance** - Optimized 60fps rendering
- ✅ **3D Toggle Button** - Chunky Minecraft-style button to enable/disable 3D

### Minecraft-Style Walk Mode - ✅ New Feature
- ✅ **First-Person Walking** - WASD controls to walk around D.C.
- ✅ **Mouse Look** - Click and drag to look around
- ✅ **Street-Level View** - Explore at ground level like Minecraft
- ✅ **Smooth Movement** - 60fps animation loop for fluid motion
- ✅ **On-Screen HUD** - Minecraft-style controls display
- ✅ **Walk Button** - Chunky green Minecraft block button
- ✅ **Pulsing Indicator** - Shows when walk mode is active
- ✅ **ESC to Exit** - Quick exit back to overhead view
- ✅ **Strafe Controls** - A/D keys for sideways movement
- ✅ **Works with 3D** - Walk between buildings and trees

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Mapbox account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DCmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example env file:
   ```bash
   cp env.example .env.local
   ```
   
   Then edit `.env.local` and add your Mapbox access token:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_mapbox_token_here
   NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/light-v11
   ```

### Getting Your Mapbox Access Token

1. Go to [Mapbox](https://account.mapbox.com/) and sign up for a free account
2. Navigate to [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token (starts with `pk.`)
4. Paste it into your `.env.local` file

### (Optional) Creating a Custom Map Style

For a truly custom look:
1. Visit [Mapbox Studio](https://studio.mapbox.com/)
2. Create a new style or customize an existing one
3. Click "Share" and copy the Style URL (e.g., `mapbox://styles/username/style-id`)
4. Update `NEXT_PUBLIC_MAPBOX_STYLE` in your `.env.local` file

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Sources

### Current Data (Phase 1)

#### Museums (`/public/data/museums.geojson`)
- **Status**: Mock data included
- **Real Data Source**: [Open Data DC - Museums](https://opendata.dc.gov/)
- **Format**: GeoJSON (Point features)
- **Properties**: NAME, ADDRESS, DESCRIPTION

### Future Data (Phase 2)

#### Trees (`/public/data/dc_trees.geojson`)
- **Status**: ✅ Implemented with 50 trees
- **Data Source**: Curated dataset with realistic D.C. tree species
- **Format**: GeoJSON (Point features)
- **Properties**: COMMON_NAME, SPECIES, DBH, CONDITION, SEASON_TYPE
- **Features**: Seasonal icon switching, clustering, interactive popups
- **Real Data Source**: [Open Data DC - Urban Forestry Street Trees](https://opendata.dc.gov/datasets/urban-forestry-street-trees) (optional upgrade)

#### Heat Map (`/public/data/dc_heat_monthly.geojson`)
- **Status**: Placeholder only
- **Real Data Source**: NASA MODIS Land Surface Temperature or similar satellite data
- **Format**: GeoJSON (Polygon/Grid features)
- **Properties Required**: temp_jan, temp_feb, ..., temp_dec
- **Processing**: Significant preprocessing required using QGIS/Python to:
  - Download satellite LST data
  - Convert to monthly averages
  - Create grid polygons
  - Export as GeoJSON

### How to Obtain Real GeoJSON Data

1. **Museums Data**
   - Visit [Open Data DC](https://opendata.dc.gov/)
   - Search for "museums" or "cultural institutions"
   - Download as GeoJSON
   - Replace `/public/data/museums.geojson`

2. **Tree Data**
   - Visit [Open Data DC - Urban Forestry](https://opendata.dc.gov/datasets/urban-forestry-street-trees)
   - Download as GeoJSON
   - Verify properties: COMMON_NAME, SPECIES
   - Save as `/public/data/dc_trees.geojson`

3. **Heat Map Data**
   - Download NASA MODIS LST data for D.C. area
   - Use QGIS or Python (rasterio, geopandas) to process
   - Create monthly average grids
   - Export with properties: temp_jan through temp_dec
   - Save as `/public/data/dc_heat_monthly.geojson`

## 🏗️ Project Structure

```
DCmap/
├── app/
│   ├── components/
│   │   ├── map/
│   │   │   ├── Map.tsx              # Main map component
│   │   │   └── layers/
│   │   │       ├── MuseumsLayer.tsx # Museums data layer
│   │   │       ├── TreesLayer.tsx   # Phase 2: Trees layer
│   │   │       └── HeatmapLayer.tsx # Phase 2: Heat map layer
│   │   └── ui/
│   │       ├── Sidebar.tsx          # Animated sidebar
│   │       ├── SidebarToggle.tsx    # Toggle button
│   │       ├── LayerToggle.tsx      # Individual layer controls
│   │       └── controls/
│   │           ├── SeasonalControls.tsx  # Phase 2: Season picker
│   │           └── MonthSlider.tsx       # Phase 2: Month slider
│   ├── lib/
│   │   └── MapContext.tsx           # Map state management
│   ├── types/
│   │   └── map.ts                   # TypeScript type definitions
│   ├── globals.css                  # Global styles + Mapbox CSS
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── public/
│   ├── data/                        # GeoJSON data files
│   │   ├── museums.geojson
│   │   ├── dc_trees.geojson
│   │   └── dc_heat_monthly.geojson
│   └── icons/                       # SVG icons for map markers
│       └── museum.svg
├── docs/
│   └── phase2-guide.md              # Phase 2 implementation guide
├── v1prd.md                         # Product Requirements Document
└── todo.md                          # Task tracking
```

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) - Interactive maps
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Customization

### Changing Map Default View
Edit `app/components/map/Map.tsx`:
```typescript
center: [-77.0369, 38.9072], // [longitude, latitude]
zoom: 11,
```

### Adding New Data Layers
1. Create GeoJSON file in `/public/data/`
2. Create layer component in `/app/components/map/layers/`
3. Add layer toggle to `app/components/ui/Sidebar.tsx`
4. Import and render in `app/components/map/Map.tsx`

## 🐛 Troubleshooting

### Map not loading
- Check that your Mapbox token is set correctly in `.env.local`
- Ensure token starts with `pk.` (public token)
- Refresh the page after updating environment variables
- Check browser console for specific errors

### GeoJSON not displaying
- Verify file is in `/public/data/` directory
- Check GeoJSON validity at [geojson.io](http://geojson.io/)
- Ensure coordinates are in [longitude, latitude] format
- Check browser Network tab for 404 errors

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild
- Check Node.js version (18+ required)

## 📚 Learning Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [GeoJSON Specification](https://geojson.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Prakriti Bista**

## 🙏 Acknowledgments

- Museum data sourced from [Open Data DC](https://opendata.dc.gov/)
- Map tiles and services by [Mapbox](https://www.mapbox.com/)
- Inspiration from modern data visualization projects

---

**Note**: This is Phase 1 (MVP). See `docs/phase2-guide.md` for upcoming features and `todo.md` for current tasks.

