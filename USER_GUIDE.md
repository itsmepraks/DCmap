# 🗺️ DC Map Explorer - User Guide

## 🎮 **How to Use the Map**

---

## ❓ **Your Questions Answered:**

### 1️⃣ **How to Exit Walk Mode?**

**Two ways:**
- **Press `ESC` key** on your keyboard
- **Click the green WALK button** at the bottom-right again (it will be darker when active)

The tooltip says: "Exit Walk Mode (ESC)"

---

### 2️⃣ **Why is the Minimap Not Working?**

The minimap only appears when you're in **Walk Mode**. Here's how to use it:

1. Click the **WALK** button (bottom-right, green Minecraft-style button)
2. Look at the **BOTTOM-LEFT corner** - minimap appears there with label "📍 YOUR LOCATION"
3. The minimap shows:
   - **Your position** as a colored dot
   - **Your direction** as an arrow showing where you're facing
   - **The surrounding area** in a small overview map
4. As you move with WASD keys, the minimap **updates in real-time** to show your precise location

**Note:** The minimap needs your Mapbox token to be set up. If it's not showing, check your `.env.local` file has:
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

---

### 3️⃣ **How to Change Seasons (Spring, Summer, Fall, Winter)?**

**Step-by-step:**

1. **Open the Sidebar** 
   - Click the **☰** (hamburger menu) button in the top-left corner

2. **Turn on Greenery Layer**
   - In the sidebar, toggle **"Greenery"** to ON (it will turn blue)

3. **Choose Your Season**
   - Below the layer toggles, you'll see **"Choose Season"**
   - Click on any season:
     - 🌸 **Spring** (Pink trees)
     - 🌿 **Summer** (Green trees)
     - 🍂 **Fall** (Orange trees)
     - ❄️ **Winter** (Gray/white trees)

4. The trees and parks will change colors immediately!

---

### 4️⃣ **How to Get Museum Information?**

**Step-by-step:**

1. **Open the Sidebar** (click ☰ button top-left)

2. **Turn on Museums Layer**
   - Toggle **"Museums"** to ON

3. **Click on Any Museum Icon** 🏛️
   - Museum icons will appear on the map
   - Click any museum icon
   - A popup will appear with:
     - **Museum Name**
     - **Description**
     - Museum details

**Tip:** Zoom in for better visibility of museum icons!

---

## 🎯 **Quick Controls Reference**

### **Sidebar Controls (Top-Left ☰)**
- **Museums** - Show/hide cultural institutions
- **Greenery** - Show/hide trees and parks
- **Heat Map** - Urban temperature data
- **Season Selector** - Change seasonal appearance (when Greenery is ON)

### **Map View Controls**
- **3D Toggle** (bottom-right) - Switch between 2D and 3D view
- **Walk Mode** (bottom-right, green) - First-person exploration mode

### **Walk Mode Controls**
- **W** - Move forward
- **A** - Move left  
- **S** - Move backward
- **D** - Move right
- **Mouse** - Look around (drag to rotate view)
- **ESC** - Exit walk mode

### **Other UI Elements**
- **Compass** (top-right when walking) - Shows direction and nearest landmark
- **Minimap** (top-right when walking) - Shows your position
- **Progress HUD** (top) - Shows landmarks discovered

---

## 💡 **Pro Tips**

1. **Best viewing experience:**
   - Turn on 3D mode first
   - Then enable Walk Mode
   - Navigate with WASD keys

2. **See seasons clearly:**
   - Open sidebar
   - Enable Greenery
   - Try all 4 seasons to see the difference!

3. **Explore museums:**
   - Enable Museums layer
   - Zoom in to see icons clearly
   - Click each icon for information

4. **Discover landmarks:**
   - Walk near landmarks to discover them
   - Check your progress in the top HUD
   - Click "STATS" for detailed achievements

---

## 🐛 **Troubleshooting**

**Minimap not showing?**
- Make sure you're in Walk Mode (green button pressed)
- Look in **BOTTOM-LEFT corner** (not top-right)
- Should see a label "📍 YOUR LOCATION" above it
- Check that your Mapbox token is configured in `.env.local` as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

**Trees not changing colors?**
- Make sure "Greenery" layer is enabled
- Season selector appears below layer toggles in sidebar
- Click different season buttons to see changes

**Museums not showing?**
- Open sidebar (☰ button)
- Toggle "Museums" to ON
- Zoom in for better visibility
- Click museum icons 🏛️ for information

---

## 🎨 **UI Layout**

```
┌─────────────────────────────────────────────────┐
│ ☰ Sidebar         PROGRESS           Compass    │
│                                                   │
│                                                   │
│                    MAP VIEW                       │
│                                                   │
│                                                   │
│ Minimap                                  3D  WALK │
│                                                   │
└─────────────────────────────────────────────────┘
```

**Left Side:**
- ☰ Sidebar toggle (top-left)
- 📍 Minimap (bottom-left, when walking)

**Right Side:**
- 3D toggle button (bottom-right)
- WALK mode button (bottom-right)

**Top:**
- Progress HUD (center)
- Compass (right, when walking)

**Bottom-Left (when walking):**
- Minimap with "📍 YOUR LOCATION" label

---

**Enjoy exploring Washington D.C.! 🏛️🌳**

