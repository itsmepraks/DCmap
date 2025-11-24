# DCmap - Interactive Washington D.C. Explorer

An interactive, game-like map application for exploring Washington, D.C. with beautiful visualizations, quest mechanics, and immersive walk mode.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Mapbox](https://img.shields.io/badge/Mapbox-3.7-green)

## ✨ Features

### 🗺️ Interactive Map
- Full-screen Mapbox GL JS map centered on Washington, D.C.
- Custom beige/terracotta themed style
- Multiple data layers (museums, trees, landmarks, hidden gems)
- Activity heatmap visualization
- Seasonal tree variations (Spring, Summer, Fall, Winter)

### 🎮 Game Mechanics
- **Quest System** - Complete challenges to earn points and badges
- **Daily Challenges** - New tasks every day with streak tracking
- **Landmarks Discovery** - Find and visit iconic D.C. locations
- **Achievement System** - Unlock rewards as you explore
- **Progress Tracking** - Save your exploration stats

### 🚶 Walk Mode
- First-person exploration with WASD controls
- Mouse look controls for 360° view
- Smooth camera animations
- Third-person follow camera option
- Street-level landmark discovery

### 🎨 Modern UI/UX
- Glass-morphism design with backdrop blur
- Polished HUD with stats tracking
- Floating control panel for settings
- Animated components with Framer Motion
- Responsive and accessible design

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
- **📊 Stats Bar (Top-Left):** View your progress
  - Click to open detailed stats modal
- **🗺️ Layers Button (Bottom-Right):** Toggle map layers and seasons
  - Press ESC or click outside to close
- **🧊 3D View Button:** Enable 3D buildings and terrain
- **🚶 Walk Button:** Enter first-person walk mode

### Walk Mode Controls
- **WASD:** Move forward/left/back/right
- **Mouse:** Click and drag to look around
- **Shift:** Run
- **ESC:** Exit walk mode

### Quest System
- View available quests in the Quest Panel (left side)
- Click "Start Quest" to begin tracking
- Visit landmarks to complete quest objectives
- Earn points and unlock badges

## 📁 Project Structure

```
DCmap/
├── app/
│   ├── components/
│   │   ├── game/              # Quest system, challenges, achievements
│   │   ├── map/               # Map, layers, avatars, effects
│   │   └── ui/                # HUD, panels, controls, modals
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and game logic
│   └── types/                 # TypeScript definitions
├── public/
│   └── data/                  # GeoJSON data files
├── v1prd.md                   # Product requirements
└── todo.md                    # Task tracking
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Mapping:** Mapbox GL JS
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **State:** React Context + Custom Hooks

## 📝 Available Commands

```bash
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run start         # Start production server
pnpm run lint          # Run ESLint
pnpm run build:walk-graph  # Regenerate walk graph (experimental)
```

## 🎨 Key Features Details

### Polished HUD System
- **Mini Stats Bar:** Compact display of streak, points, discoveries, and active quests
- **Floating Control Panel:** Beautiful glass-morphism design for layer/season controls
- **Smart HUD:** Context-aware displays for map vs walk mode
- **Proximity Hints:** Shows nearby landmarks with distance and direction

### Quest System
- Multiple quest types (exploration, discovery, challenges)
- Progress tracking for each quest
- Rewards system with points and badges
- Quest completion animations

### Landmark Discovery
- 10+ major D.C. landmarks
- Discovery animations when found
- Detailed information cards
- Fun facts for each location

### Data Layers
- **Museums:** Cultural institutions with info popups
- **Trees:** Urban forestry with seasonal variations
- **Landmarks:** Major D.C. attractions
- **Hidden Gems:** Secret spots to discover
- **Heatmap:** Activity visualization

## 🐛 Troubleshooting

### Map not loading
- Check Mapbox token in `.env.local`
- Ensure token starts with `pk.`
- Restart dev server after env changes

### Build errors
- Delete `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check Node.js version (18+ required)

### Performance issues
- Disable 3D view if needed
- Close unused panels
- Check browser console for errors

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
