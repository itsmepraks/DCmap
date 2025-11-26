# DCmap - Interactive Washington D.C. Explorer

An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations, quest mechanics, waypoint system, and immersive fly mode.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Mapbox](https://img.shields.io/badge/Mapbox-3.7-green)

## ✨ Features

### 🗺️ Interactive Map
- Full-screen Mapbox GL JS map centered on Washington, D.C.
- Custom cartoonish/Minecraft-style map rendering
- Multiple data layers (museums, trees, landmarks, parks)
- Seasonal tree variations (Spring, Summer, Fall, Winter)
- 3D building extrusions with real heights
- Terrain elevation and atmospheric sky

### 🎮 Game Mechanics
- **Quest System** - Complete challenges to earn points and badges
- **Daily Challenges** - New tasks every day with streak tracking
- **Landmarks Discovery** - Find and visit iconic D.C. locations
- **Experience System** - Gain XP from landmarks, quests, and challenges
- **Waypoint System** - Set waypoints and navigate to quest objectives
- **Achievement System** - Unlock rewards as you explore
- **Progress Tracking** - Save your exploration stats

### 🦅 Fly Mode
- Smooth bird-like flight through D.C. streets
- WASD/Arrow keys for movement
- Mouse drag for camera rotation
- Space/Shift for altitude control
- Automatic building collision avoidance
- Street-level landmark discovery
- Real-time speed, altitude, and position display

### 🎨 Modern UI/UX
- Minecraft-inspired design with pixelated aesthetics
- Polished HUD with stats tracking (streak, points, discoveries, XP)
- Floating control panel for layers and seasons
- Unified HUD system (context-aware for map/fly mode)
- Animated components with Framer Motion
- Responsive and accessible design
- Optimized layout to prevent overlaps

### 🌍 3D Visualization
- 3D building extrusions with real heights
- Terrain elevation data
- Atmospheric sky gradient
- Advanced lighting effects
- Manual tilt and rotation controls

## 🚀 Getting Started

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
   
   Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
   
   Add your Mapbox token:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

3. **Run development server**
   ```bash
   pnpm run dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting a Mapbox Token

1. Sign up at [Mapbox](https://account.mapbox.com/)
2. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token (starts with `pk.`)
4. Paste into `.env.local`

## 🎮 How to Use

### Map Controls
- **Pan:** Click and drag
- **Zoom:** Scroll wheel or pinch
- **Rotate:** Ctrl + drag (or two-finger rotate on mobile)
- **Tilt:** Right-click + drag

### UI Controls
- **📊 Stats Bar (Top-Left):** View your progress (streak, points, discoveries, active quests)
  - Click to open detailed stats modal
- **🗺️ Layers Button (Bottom-Right):** Toggle map layers and seasons
  - Press ESC or click outside to close
- **🧊 3D View Button:** Enable 3D buildings and terrain
- **🦅 Fly Button:** Enter fly mode for street-level exploration

### Fly Mode Controls
- **WASD / Arrow Keys:** Move forward/left/back/right
- **Mouse Drag:** Click and drag to look around
- **Space:** Ascend (increase altitude)
- **Shift:** Descend (decrease altitude)
- **ESC:** Exit fly mode

### Quest System
- View available quests in the Quest Panel (right side)
- Click "Start Quest" to begin tracking
- Waypoints automatically appear for quest objectives
- Visit landmarks to complete quest objectives
- Earn XP, points, and unlock badges

### Waypoint System
- Quest waypoints automatically appear for active quest objectives
- Click waypoints to navigate to locations
- Waypoints are color-coded (gold for quest objectives)

## 📁 Project Structure

```
DCmap/
├── app/
│   ├── components/
│   │   ├── game/              # Quest system, challenges, achievements, waypoints
│   │   ├── map/               # Map, layers, fly mode avatar, effects, waypoints
│   │   └── ui/                # HUD, panels, controls, modals
│   ├── hooks/                 # Custom React hooks (game state, quests, fly mode, waypoints, XP)
│   ├── lib/                   # Utilities, game logic, state management
│   └── types/                 # TypeScript definitions
├── public/
│   ├── data/                  # GeoJSON data files (landmarks, museums, trees, quests)
│   └── custom-isometric-style.json  # Custom cartoonish map style
├── v1prd.md                   # Product requirements document
└── todo.md                    # Development task tracking
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Mapping:** Mapbox GL JS v3
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **State:** React Context + Custom Hooks
- **Storage:** LocalStorage for game progress

## 📝 Available Commands

```bash
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run start         # Start production server
pnpm run lint          # Run ESLint
```

## 🎨 Key Features Details

### Unified HUD System
- **Mini Stats Bar:** Compact display of streak, points, discoveries, active quests, and XP
- **Fly Mode Stats:** Real-time speed, altitude, position, and compass direction
- **Landmark Recommendations:** Shows nearest unvisited landmark with distance
- **Floating Control Panel:** Glass-morphism design for layer/season controls
- **Proximity Hints:** Shows nearby landmarks with distance and direction

### Quest System
- Multiple quest types (exploration, discovery, challenges)
- Progress tracking for each quest objective
- Automatic waypoint generation for active quests
- Rewards system with XP, points, and badges
- Quest completion animations and notifications

### Experience System
- Gain XP from landmark discoveries (50 XP)
- Gain XP from quest completions (100 XP)
- Gain XP from daily challenges (25 XP)
- Level system (100 XP per level)
- XP history tracking

### Waypoint System
- Automatic waypoints for active quest objectives
- Manual waypoint creation (future feature)
- Click waypoints to navigate
- Persistent waypoint storage

### Landmark Discovery
- 10+ major D.C. landmarks
- Discovery animations when found
- Detailed information cards
- Fun facts for each location
- Auto-discovery when within 40m in fly mode

### Data Layers
- **Museums:** Cultural institutions with info popups
- **Trees:** Urban forestry with seasonal variations
- **Landmarks:** Major D.C. attractions
- **Parks:** Green spaces with seasonal colors
- **Roads:** Detailed road network visualization

## 🐛 Troubleshooting

### Map not loading
- Check Mapbox token in `.env.local`
- Ensure token starts with `pk.`
- Restart dev server after env changes

### Build errors
- Delete `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
- Reinstall dependencies: `pnpm install`
- Check Node.js version (18+ required)

### Performance issues
- Disable 3D view if needed
- Close unused panels
- Check browser console for errors

### Fly mode not working
- Ensure you're not in a restricted area (world border)
- Check browser console for errors
- Try refreshing the page

## 📄 License

MIT License - feel free to use for learning and projects

## 👤 Author

**Prakriti Bista**

## 🙏 Credits

- Map data and services by [Mapbox](https://www.mapbox.com/)
- Landmark data from [Open Data DC](https://opendata.dc.gov/)
- Inspired by game UX patterns from Minecraft and GTA

---

**Note:** This is an evolving project. Check `v1prd.md` for detailed feature specs and `todo.md` for current development tasks.
