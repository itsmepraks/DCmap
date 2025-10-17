# Quick Start Guide - Project Anima DC

Welcome! This guide will help you get your Project Anima DC up and running in just a few minutes.

## ✅ What's Been Completed

Phase 1 (MVP) has been fully implemented:
- ✅ Next.js 15 project with TypeScript
- ✅ Mapbox GL JS integration
- ✅ Framer Motion animations
- ✅ Full-screen interactive map
- ✅ Animated sidebar and controls
- ✅ Museums data layer with popups
- ✅ Phase 2 scaffolding (ready for future features)
- ✅ Comprehensive documentation

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Mapbox Token

1. **Create a free Mapbox account**: [https://account.mapbox.com/](https://account.mapbox.com/)

2. **Get your access token**: [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - Copy your default public token (starts with `pk.`)

3. **Create `.env.local` file** in the project root:
   ```bash
   # Copy the example file
   cp env.example .env.local
   ```

4. **Edit `.env.local`** and add your token:
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
   NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/light-v11
   ```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Open Your Browser

Visit [http://localhost:3000](http://localhost:3000)

**That's it!** 🎉 You should see the interactive D.C. map.

## 🎮 How to Use

1. **Toggle Sidebar**: Click the hamburger button (top-left)
2. **Enable Museums Layer**: Toggle the "Museums" switch
3. **Explore**: Pan and zoom the map, click museum icons for info
4. **Phase 2 layers**: Currently placeholders (see Phase 2 section below)

## 🎨 Optional: Custom Map Style

For a more polished look, create a custom style:

1. Visit [Mapbox Studio](https://studio.mapbox.com/)
2. Create a new style or customize an existing one
3. Recommended: Use the "Light" or "Streets" template and:
   - Reduce road prominence
   - Use a simplified color palette
   - Emphasize parks and water features
4. Click "Share" → Copy Style URL
5. Update `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/your-username/your-style-id
   ```

## 📁 Project Structure Overview

```
DCmap/
├── app/                          # Next.js App Router
│   ├── components/
│   │   ├── map/                 # Map-related components
│   │   │   ├── Map.tsx          # Main map component
│   │   │   └── layers/          # Data layer components
│   │   │       ├── MuseumsLayer.tsx   # ✅ Phase 1
│   │   │       ├── TreesLayer.tsx     # 🔄 Phase 2
│   │   │       └── HeatmapLayer.tsx   # 🔄 Phase 2
│   │   └── ui/                  # UI components
│   │       ├── Sidebar.tsx      # Animated sidebar
│   │       ├── SidebarToggle.tsx
│   │       └── controls/        # Layer-specific controls
│   ├── lib/                     # Utilities
│   │   └── MapContext.tsx       # Map state management
│   ├── types/                   # TypeScript definitions
│   └── page.tsx                 # Home page
├── public/
│   ├── data/                    # GeoJSON data files
│   └── icons/                   # Map marker SVGs
├── docs/
│   └── phase2-guide.md          # Detailed Phase 2 guide
├── README.md                    # Full documentation
├── todo.md                      # Task tracking
└── v1prd.md                     # Product requirements
```

## 🔄 Phase 2 Features (Next Steps)

Phase 2 features are scaffolded but not yet implemented. When you're ready:

1. **Read the Phase 2 Guide**: `docs/phase2-guide.md` has detailed implementation instructions

2. **Key Phase 2 Features**:
   - **Greenery Layer**: Clustered trees with seasonal variations
   - **Heat Map Layer**: Monthly urban temperature visualization

3. **Data Required**:
   - Real tree data from [Open Data DC](https://opendata.dc.gov/)
   - Processed heat map data (requires satellite data + QGIS/Python)

See `README.md` for detailed data acquisition instructions.

## 🐛 Troubleshooting

### Map shows error or doesn't load
**Solution**: Check that your Mapbox token is correctly set in `.env.local`
- Token should start with `pk.`
- No quotes around the token
- Restart dev server after changing `.env.local`

### Museum icons don't appear
**Solution**: 
1. Check browser console for errors
2. Verify `/public/data/museums.geojson` exists
3. Try refreshing the page
4. Make sure you toggled the Museums layer ON in the sidebar

### Build errors
**Solution**:
```bash
# Delete build cache
rm -rf .next

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## 📚 Additional Resources

- **README.md**: Complete documentation with all features
- **todo.md**: Track your progress and see what's next
- **docs/phase2-guide.md**: Detailed Phase 2 implementation guide
- **v1prd.md**: Original product requirements document

## 🎯 What to Do Next

1. **Explore the app**: Test all Phase 1 features
2. **Customize the UI**: Modify colors, fonts, animations
3. **Create custom Mapbox style**: Make it uniquely yours
4. **Plan Phase 2**: Review `docs/phase2-guide.md`
5. **Get real data**: Download museums data from Open Data DC

## 💡 Tips

- Press `F12` in browser to open DevTools and see console logs
- Use the Mapbox Studio style editor to customize your map appearance
- Check `todo.md` for a complete checklist of Phase 1 and Phase 2 tasks
- The code is fully typed with TypeScript - your IDE will help you!

## 📞 Need Help?

- Check the browser console for errors
- Review the README.md troubleshooting section
- Verify your Mapbox token is valid
- Ensure all dependencies are installed (`npm install`)

---

**Congratulations!** 🎉 Phase 1 is complete and ready to use. Have fun exploring D.C.!

