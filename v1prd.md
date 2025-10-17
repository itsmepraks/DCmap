
***

## **Product Requirements Document: "Project Anima DC"**

* **Author:** Prakriti Bista
* **Status:** Ready for Development
* **Version:** 1.2
* **Last Updated:** October 16, 2025

---

### **1. Vision & Goals**

**Vision:** To create a web-based, interactive digital portrait of Washington, D.C., that visualizes the city's dynamic data layers through a sleek, animated, and artistically "cartoonish" user interface.

**Primary Goal:** To serve as a high-impact portfolio project that demonstrates advanced skills in frontend development (Next.js, TypeScript), data visualization (Mapbox), and UI/UX design.

---

### **2. High-Level User Flow**

1.  **Landing:** User arrives on the site and is immediately presented with the full-screen interactive map of D.C., centered and zoomed appropriately. The UI controls (sidebar toggle) gracefully animate into view.
2.  **Exploration:** User pans and zooms the map. The map feels fluid and responsive.
3.  **Interaction:** User clicks the sidebar toggle. The sidebar animates open, revealing a list of data layers.
4.  **Discovery:** User toggles a layer (e.g., "Museums"). Custom icons fade onto the map. The user clicks an icon, and a styled popup with information appears.
5.  **Deeper Dive:** User activates a dynamic layer (e.g., "Greenery"). They interact with the layer's specific controls (seasonal buttons) and see the map visualization update instantly.

---

### **3. Phase 1: MVP Features (Sprint 1)**

This is the initial, shippable version of the application.

#### **F1: Core Map Canvas**

* **User Story:** As a user, I want to see a full-screen, interactive map of D.C. when I land on the page so I can immediately begin exploring.
* **Technical Requirements:**
    * The map will be rendered using the **Mapbox GL JS** library inside a Next.js Client Component (`<Map />`).
    * **Default View:**
        * Center: `[-77.0369, 38.9072]`
        * Zoom Level: `11`
        * Pitch: `0`
        * Bearing: `0`
    * **Map Style:** Use a custom, minimalist style created in Mapbox Studio (e.g., `mapbox://styles/your-username/your-style-id`). This style should de-emphasize road networks and use a simplified color palette.
    * The Mapbox access token will be stored in an environment variable: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
* **Acceptance Criteria:**
    * ✅ On page load, the map component renders and fills 100% of the viewport's height and width.
    * ✅ Standard map interactions (pan, zoom with scroll, drag) are smooth.
    * ✅ The custom Mapbox style is correctly applied.

#### **F2: Animated UI Shell & Controls**

* **User Story:** As a user, I want an intuitive and non-intrusive way to access map controls and layer options.
* **Technical Requirements:**
    * Create a `<Sidebar />` component and a `<SidebarToggle />` button component.
    * **Animation (Framer Motion):**
        * On initial page load, the `<SidebarToggle />` button fades in and slides up.
        * Clicking the toggle button animates the `<Sidebar />` component, sliding it into view from the left over `300ms` with an `ease-out` curve.
        * The content *inside* the sidebar (layer toggles) should use a `staggerChildren` animation, fading in sequentially.
    * State will be managed in the parent `page.tsx` component using `useState` and passed down as props.
* **Acceptance Criteria:**
    * ✅ The sidebar toggle is visible and clickable.
    * ✅ The sidebar opens and closes with a smooth, non-janky animation.
    * ✅ The map remains interactive while the sidebar is open.

#### **F3: Data Layer - Points of Interest (Museums)**

* **User Story:** As a user, I want to be able to see the locations of museums on the map so I can understand the city's cultural layout.
* **Technical Requirements:**
    * **Data Source:** A static `museums.geojson` file located in the `/public/data` directory.
    * The data will be added to the map using `map.addSource()` and `map.addLayer()`.
    * **Layer ID:** `museums-layer`
    * **Iconography:** Use a custom SVG icon (e.g., a simplified museum building icon) loaded via `map.loadImage()`.
    * **Interactivity:** On `click` of the `museums-layer`, a `mapboxgl.Popup` will be generated. The popup's HTML content will be populated from the feature's properties (e.g., `e.features[0].properties.NAME`).
    * The layer's visibility will be controlled by a boolean prop passed from `page.tsx`, toggled using `map.setLayoutProperty('museums-layer', 'visibility', 'visible'/'none')`.
* **Acceptance Criteria:**
    * ✅ A "Museums" toggle switch is present in the sidebar.
    * ✅ Toggling the switch ON makes the museum icons fade in on the map. Toggling it OFF makes them fade out.
    * ✅ Clicking a museum icon displays a popup containing the correct museum name.

---

### **4. Phase 2: Post-MVP Features (Sprint 2)**

#### **F4: Data Layer - Animated Greenery**

* **User Story:** As a user, I want to explore the city's tree canopy and see how it changes with the seasons.
* **Technical Requirements:**
    * **Data Source:** `dc_trees.geojson`.
    * **Performance Management:** For this version, performance will be managed using **Mapbox GL JS's built-in clustering functionality**.
        * The GeoJSON source will be configured with: `{ cluster: true, clusterMaxZoom: 14, clusterRadius: 50 }`.
        * Two layers will be created: one for the clustered points (showing a circle with a count) and one for the unclustered, individual tree icons.
    * **Iconography:** Create custom SVG icons for at least three seasonal states (e.g., `leaf-summer.svg`, `leaf-fall.svg`, `cherry-blossom.svg`).
    * **UI Controls:** When this layer is active, a set of seasonal buttons ("Spring," "Summer," "Fall") will appear in the sidebar.
    * **Dynamic Styling:** Clicking a season button will call `map.setLayoutProperty()` on the unclustered tree layer to change the `icon-image` based on the tree's species property (e.g., if `SPECIES === 'Cherry'` and season is "Spring", use the blossom icon).
* **Acceptance Criteria:**
    * ✅ When zoomed out, trees are grouped into clusters.
    * ✅ Zooming in breaks clusters apart, eventually revealing individual tree icons. The experience is performant.
    * ✅ Clicking a season button correctly and immediately updates the icons for relevant trees on the map.

#### **F5: Data Layer - Dynamic Heat Map**

* **User Story:** As a user, I want to see how temperature varies across the city and throughout the year to understand urban heat islands.
* **Technical Requirements:**
    * **Data Source:** A pre-processed `dc_heat_monthly.geojson`. This data should be in a grid format, where each feature has properties for each month's average temperature (e.g., `temp_jan`, `temp_feb`).
    * **Layer Type:** Use a `heatmap` layer in Mapbox (`type: 'heatmap'`).
    * **UI Controls:** A `month` slider (`<input type="range" min="1" max="12">`) will appear in the sidebar when this layer is active.
    * **Dynamic Styling:** The `heatmap-weight` property will be dynamically set based on the slider's current month. An event listener on the slider will update a data expression that selects the correct month's property (e.g., `['get', 'temp_mar']`).
* **Acceptance Criteria:**
    * ✅ The heatmap layer displays correctly when toggled on.
    * ✅ Moving the month slider updates the heatmap visualization in real-time with no noticeable delay.

---

### **5. Data Dependencies**

| Layer | Source File | Expected Format | Pre-processing Required? |
| :--- | :--- | :--- | :--- |
| **Museums** | `museums.geojson` | GeoJSON (Points) | No, use directly from Open Data DC. |
| **Trees** | `dc_trees.geojson` | GeoJSON (Points) | Yes, download from Open Data DC and ensure properties like `COMMON_NAME` are clean. |
| **Heatmap** | `dc_heat_monthly.geojson` | GeoJSON (Polygons/Grid) | Yes, significant offline work required using QGIS/Python to process satellite LST data into a monthly GeoJSON grid. |

---

### **6. Out of Scope (For this Version)**

* AI/ML predictive models.
* Real-time data feeds (e.g., live bus tracking).
* User accounts or saving preferences.
* Mobile-specific layouts (initial focus is a responsive desktop experience).
* Search functionality.
* Accessibility features beyond standard HTML semantics (will be addressed in a future version).