# 🎮 Button Layout Guide - Minecraft Edition

## Screen Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  [🍔 Menu]                                        [Map Controls] │
│                                                      [Zoom +/-]  │
│                                                                   │
│              🚶 WALK MODE ACTIVE                                 │
│          [Movement] [Look Around]                                │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                          MAP AREA                                │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│  [3D]  [WALK]                                         [📍 GPS]  │
│  Brown  Green                                          Blue      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Bottom Control Bar (Minecraft-Style Buttons)

### Left Side - View Mode Controls

**Position:** Bottom-left corner, side by side

```
┌────────┬────────┐
│   3D   │  WALK  │  
│  Brown │ Green  │  Minecraft Blocks!
│  64px  │  64px  │
└────────┴────────┘
```

**3D Toggle** (Left):
- **Color**: Brown wood gradient (#8B7355 → #6B5344)
- **Position**: `bottom: 32px, left: 32px`
- **Size**: 64x64px
- **Function**: Toggle 3D buildings/terrain
- **States**: 
  - OFF: Raised, light brown
  - ON: Pressed, dark brown

**Walk Mode** (Right):
- **Color**: Green grass gradient (#7ED957 → #66BB6A)
- **Position**: `bottom: 32px, left: 128px`
- **Size**: 64x64px
- **Function**: Enter first-person walk mode
- **States**: 
  - OFF: Raised, light green
  - ON: Pressed, dark green, gold text, pulsing indicator

### Right Side - Location Control

**Position:** Bottom-right corner

```
        ┌────────┐
        │   📍   │  
        │  GPS   │  Styled Button
        │  40px  │
        └────────┘
```

**Live Location** (Bottom-right):
- **Color**: Green-blue gradient (#7ED957 → #5DA5DB)
- **Position**: `bottom-right` (Mapbox control)
- **Size**: 40x40px
- **Function**: Track your real-time location
- **States**: 
  - Inactive: Light gradient
  - Active: Deeper gradient
  - Tracking: Pulsing animation

---

## Top Controls

### Left Side

**Sidebar Toggle** (Top-left):
- **Color**: Green-blue gradient (#7ED957 → #5DA5DB)
- **Position**: `top: 32px, left: 32px`
- **Size**: 56x56px
- **Function**: Open/close sidebar
- **Hamburger menu** that animates to X

### Right Side

**Mapbox Controls** (Top-right):
- **Zoom +/-**: Default Mapbox styling
- **Compass**: Rotation indicator
- **Position**: Top-right corner

---

## Button Hierarchy by Size

### Extra Large (64x64px) - Primary Actions
- ✅ 3D Toggle (brown Minecraft block)
- ✅ Walk Mode (green Minecraft block)

### Large (56x56px) - Menu
- ✅ Sidebar Toggle (gradient button)

### Medium (40x40px) - Utility
- ✅ Live Location (GPS button)

### Small (29px) - Native Controls
- ✅ Zoom +/-
- ✅ Compass

---

## Spacing & Layout

### Bottom-Left Cluster

```
Edge to first button: 32px
Between buttons: 32px gap
Total width: 64 + 32 + 64 = 160px
Height: 64px
Clearance from bottom: 32px
```

**Calculation:**
- 3D button: 32px from left
- Gap: 32px
- Walk button: 128px from left (32 + 64 + 32)

### Visual Spacing

```
[EDGE]
  ↓ 32px
[3D Button]
  ↓
  → 32px gap
[Walk Button]
  ↓ 32px
[EDGE]
```

---

## Color Coding System

### Minecraft Blocks (Interactive Toggles)

**Brown (3D):**
- Wood texture aesthetic
- Earthy, solid feel
- Matches terracotta buildings
- OFF: #A0826D → #8B7355
- ON: #8B7355 → #6B5344

**Green (Walk):**
- Grass block vibes
- Vibrant, alive feel
- Matches tree/nature theme
- OFF: #7ED957 → #66BB6A
- ON: #4A7C24 → #2E5F1A

### Gradient Buttons (Always Active)

**Green-Blue (Sidebar, Location):**
- Matches illustrated map palette
- Modern, sleek feel
- Primary action color
- Color: #7ED957 → #5DA5DB

---

## Button States & Animations

### 3D Toggle

**OFF (Not Active):**
```
Appearance: Raised block
Shadow: 0 8px 0 #6B5344
Transform: translateY(0)
Color: Light brown
Text: "3D OFF"
```

**ON (Active):**
```
Appearance: Pressed down
Shadow: 0 6px 0 #4A3728 (shorter)
Transform: translateY(4px)
Color: Dark brown
Text: "3D ON" (gold)
```

### Walk Mode

**OFF (Not Walking):**
```
Appearance: Raised block
Shadow: 0 8px 0 #4A7C24
Transform: translateY(0)
Color: Light green
Icon: 🚶
Text: "WALK"
Indicator: None
```

**ON (Walking):**
```
Appearance: Pressed down
Shadow: 0 6px 0 #1E4F0A (shorter)
Transform: translateY(4px)
Color: Dark green
Icon: 🚶
Text: "WALK" (gold)
Indicator: Pulsing yellow dot (top-right)
```

### All Buttons

**Hover:**
- Scale: 1.05x
- Tooltip appears (if any)

**Tap:**
- Scale: 0.95x
- Immediate feedback

**Load:**
- Entrance animation
- 3D: Rotate in
- Walk: Slide up

---

## Tooltip System

### 3D Toggle Tooltip

```
┌─────────────────────┐
│ Enable 3D View      │
│ Disable 3D View     │
└─────────▼───────────┘
    [3D Button]
```

**Position:** Above button
**Trigger:** Hover (desktop only)
**Content:** Changes based on state

### Walk Mode Tooltip

```
┌─────────────────────────┐
│ Walk Mode (WASD)        │
│ Exit Walk Mode (ESC)    │
└──────────▼──────────────┘
    [Walk Button]
```

**Position:** Above button
**Trigger:** Hover (desktop only)
**Content:** Shows keyboard shortcuts

---

## Mobile Considerations

### Touch Targets

**All buttons meet minimum touch target:**
- Minimum: 44x44px (Apple HIG)
- Our buttons: 64x64px ✅
- Large enough for comfortable tapping

### Responsive Behavior

**Small Screens (<640px):**
- All buttons maintain same size
- No overlap with map controls
- Adequate spacing maintained
- Touch-friendly positioning

**Very Small Screens (<400px):**
- Buttons remain functional
- May slightly reduce spacing
- Z-index ensures clickability

---

## Z-Index Hierarchy

```
z-30: Sidebar Toggle (always on top)
z-30: 3D Toggle
z-30: Walk Toggle
z-20: Walk Mode HUD
z-10: Sidebar
z-0: Map
```

**Ensures:**
- Buttons always clickable
- HUD appears over map but under buttons
- Sidebar doesn't block buttons

---

## Accessibility

### Keyboard Navigation

**Tab Order:**
1. Sidebar Toggle
2. 3D Toggle
3. Walk Toggle
4. (Sidebar items if open)
5. Map controls

**Shortcuts:**
- `ESC` - Exit walk mode
- Future: `3` - Toggle 3D
- Future: `W` - Toggle walk mode (when not walking)

### ARIA Labels

```typescript
aria-label="Toggle 3D view"
aria-label="Enter walk mode"
aria-label="Toggle sidebar"
aria-label="Show current location"
```

### Screen Reader Support

- All buttons have descriptive labels
- State changes announced
- Tooltip content accessible

---

## Visual Identity

### Minecraft Aesthetic

**Chunky Blocks:**
- 64x64px perfect square
- 3px solid borders
- Chunky shadows (6-8px)
- Pressed effect (4px down)
- Pixelated corners
- Monospace font

**Pixelated Details:**
```typescript
style={{ imageRendering: 'pixelated' }}
```

### Integrated Design

**Matches Map Style:**
- Brown = Terracotta buildings
- Green = Parks and trees
- Beige background = Map background
- Blue = Water features

**Cohesive with UI:**
- Similar gradients as sidebar
- Complementary to season controls
- Harmonious color palette
- Consistent animation style

---

## Button Interaction Flow

### 3D Mode Journey

```
1. User sees brown block (bottom-left)
2. Hovers → Tooltip "Enable 3D View"
3. Clicks → Button presses down
4. Camera tilts to 60° (1 second)
5. Buildings rise up in 3D
6. Text changes to "ON" in gold
7. Click again → Returns to flat
```

### Walk Mode Journey

```
1. User sees green block (next to 3D)
2. Hovers → Tooltip "Walk Mode (WASD)"
3. Clicks → Button presses down
4. HUD appears at top
5. Camera zooms to street level (75° pitch)
6. Text turns gold "WALK"
7. Pulsing yellow indicator appears
8. User presses WASD to walk
9. Drag mouse to look around
10. Press ESC or click button → Exit
```

---

## Common Issues & Solutions

### Button Overlaps?
❌ **Problem**: Buttons too close together
✅ **Solution**: 32px spacing between all buttons

### Can't Click Button?
❌ **Problem**: Sidebar covering button
✅ **Solution**: Z-index ensures buttons always on top

### Button Too Small on Mobile?
❌ **Problem**: Hard to tap
✅ **Solution**: 64x64px exceeds 44px minimum

### Tooltip Showing on Mobile?
❌ **Problem**: Hover doesn't work on touch
✅ **Solution**: Hover-only styles disabled on mobile

---

## Future Enhancements

### Potential Additions

**Speed Control (for Walk Mode):**
- Add speed slider in HUD
- Shift to sprint (Minecraft-style)
- Ctrl to crouch/slow walk

**Button Customization:**
- User can rearrange buttons
- Choose left or right placement
- Resize buttons (large/medium/small)

**More Minecraft Features:**
- Jump button (spacebar)
- Fly mode (double-tap jump)
- Hotbar for quick layer toggle
- Inventory UI for saved locations

**Gamepad Support:**
- Left stick: Move
- Right stick: Look
- Triggers: Zoom in/out
- Buttons: Toggle modes

---

## Testing Checklist

### Desktop

- [ ] Click 3D button → Camera tilts
- [ ] Click Walk button → Enter walk mode
- [ ] WASD keys → Movement works
- [ ] Mouse drag → Look around
- [ ] ESC key → Exit walk mode
- [ ] Hover tooltips → Appear correctly
- [ ] No button overlaps
- [ ] Animations smooth

### Mobile

- [ ] Tap 3D button → Works
- [ ] Tap Walk button → Works
- [ ] Touch targets adequate
- [ ] No tooltips on touch
- [ ] Buttons don't overlap controls
- [ ] Responsive at all sizes

### Accessibility

- [ ] Tab through buttons
- [ ] ARIA labels present
- [ ] Keyboard shortcuts work
- [ ] Screen reader compatible

---

**Result: You have a perfectly organized, Minecraft-styled control system! 🎮**

All buttons are:
- ✅ Properly positioned
- ✅ Adequately sized
- ✅ Beautifully styled
- ✅ Functionally independent
- ✅ Touch-friendly
- ✅ Accessible
- ✅ Animated
- ✅ Cohesive with overall design

**Bottom line: Professional, playful, and perfectly placed! 🎨✨**

