# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Youl TCG** - a multiplayer Trading Card Game client built with React 19, TypeScript, Vite, and Colyseus.js. Two players compete to capture hexagonal territories on a game board by strategically playing cards. The project features real-time multiplayer synchronization, drag-and-drop card mechanics, and polished 3D visual effects.

## Development Commands

### Local Development
```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # TypeScript check + production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Docker Development
The project is containerized for consistent development environments:
```bash
make up            # Start Docker container with hot reload
make down          # Stop Docker container
make rebuild       # Force rebuild and restart container
make bash          # Enter container shell
make logs          # View container logs
make build         # Build inside container
make lint          # Lint inside container
```

Docker uses polling for file watching (WSL2 compatibility) and maps port 5173.

## Architecture

### State Management (Client-Server)
- **Colyseus.js Client** (`src/game/hooks/useGameRoom.ts`) - Real-time multiplayer state sync
  - Connects to Colyseus server via WebSocket
  - `gameState`: Synchronized game state from server (source of truth)
  - `playCard()`: Sends command to server for validation
  - `endTurn()`: Notifies server to switch turns
  - Works in "demo mode" when server is unavailable
- **Local UI State** - React `useState` for drag interactions, animations, and UI toggles
  - No Zustand - game state comes from server, UI state is ephemeral

### Drag & Drop System
The application uses `@dnd-kit/core` with a custom architecture:

1. **DndContext** (`App.tsx`) - Global drag state coordinator
   - Tracks `activeCard` and `activeId` during drags
   - Calculates wind effects from drag velocity in `handleDragMove`
   - Uses `PointerSensor` with 5px activation distance to distinguish clicks from drags

2. **DraggableCard** (`components/hand/DraggableCard.tsx`) - Source items
   - Wraps CardView with `useDraggable` hook
   - Passes card data via `data.current.card`
   - Disables hover tilt during active drag (`muted` state)

3. **DragLayer** (`components/hand/DragLayer.tsx`) - Custom overlay
   - Uses `DragOverlay` to render dragged card above all content
   - Applies real-time wind effects from drag velocity
   - Maintains 3D perspective

4. **Board** (`components/board/Board.tsx`) - Drop target
   - Root-level droppable zone with id `"board"`
   - Each hex cell is also droppable with id `"hex:q,r"`
   - Uses `honeycomb-grid` v4 for hexagonal grid math
   - PRESET_CELLS defines 7-hex layout

### Visual Effects (Standalone Library)

**Card Effects Library** (`src/lib/card-effects/`)
- **Fully standalone** - can be extracted and reused in other projects
- Includes README with usage examples

**3D Card Tilt** (`lib/card-effects/useHoverTilt.ts`)
- Applies perspective transform on pointer movement
- Configurable: `maxRotate`, `maxTranslate`, `scale`, `attractMode`
- Uses "attract" mode by default (card tilts toward cursor)
- Calculates shine gradient position for holographic effect
- Framework-agnostic React hook

**Wind Animation** (`lib/card-effects/useDragWind.ts`)
- **Physics-based**: Computed from drag velocity (`ddx/dt`, `ddy/dt`)
- Applies rotateX/Y based on movement direction
- Strength normalized 0-1, configurable max tilt
- Framework-agnostic - works with any drag library
- Returns `{ wind, callbacks: { onMove, onEnd } }`

**CardView Component** (`components/cards/CardView.tsx`)
- Standalone card renderer (works without DnD context - see README)
- 63:88 aspect ratio (standard TCG card)
- States: `muted` (during drag), `highlight` (drop target), `interactive` (hover tilt)
- Random placeholder images from picsum.photos keyed by card.id

### Hex Grid System
- Uses `honeycomb-grid` v4 with topLeft origin
- 28-unit hex dimensions
- **Configurable layouts** (`src/game/utils/hexGrid.ts`):
  - `SMALL`: 7 hexes (quick games)
  - `MEDIUM`: 19 hexes (balanced)
  - `LARGE`: 37 hexes (long games)
- **Utility functions**:
  - `hexDistance()`: Calculate distance between hexes
  - `hexNeighbors()`: Get all 6 adjacent hexes
  - `hexInRange()`: Get hexes within radius
- SVG rendering with dynamic viewBox calculation
- Each hex shows:
  - Axial coordinates (q,r)
  - **Territory color** based on owner (blue/red)
  - Stroke highlight on hover/valid drop target
  - Occupied marker with card initial
  - Subtle scale animation on hover

### Drop Validation System
- **Real-time validation** (`src/game/utils/validation.ts`)
  - `canPlayCardAt()`: Checks if a card can be played at a hex
  - Rules: cell must be empty, in bounds, not opponent's territory
  - Returns `{ valid: boolean, reason?: string }`
- **Visual feedback** (`src/components/ui/DropPreview.tsx`)
  - Shows green/red alert during drag
  - Displays validation errors to user
- **useDropValidation hook** - Manages validation state during drag operations

## Tech Stack Specifics

- **React 19.1**: Latest stable with improved concurrent features
- **TypeScript 5.8**: Strict mode enabled
- **Vite 7**: ESM-first bundler with HMR
- **Tailwind 4 + DaisyUI**: Utility-first CSS with component library
- **Colyseus.js**: Client SDK for real-time multiplayer (connects to separate server project)
- **@dnd-kit**: Modern drag-and-drop for React
- **honeycomb-grid**: Hexagonal grid mathematics

## Code Patterns

### Type Safety
- CardData type is canonical: `{ id, name, cost, rarity?, clan?, imageUrl? }`
- Zustand store types defined inline
- React.CSSProperties for style objects

### Performance Optimizations
- `useMemo` for static card lists and grid calculations
- `useCallback` for drag handlers to prevent re-renders
- `requestAnimationFrame` for smooth tilt animations
- `transform-gpu` class for hardware acceleration

### Component Organization
```
src/
├── lib/
│   └── card-effects/  # Standalone visual effects library (exportable)
│       ├── useHoverTilt.ts
│       ├── useDragWind.ts
│       ├── index.ts
│       └── README.md
├── game/
│   ├── hooks/         # Game logic hooks (useGameRoom, useDropValidation)
│   ├── types/         # Shared types with server (CardData, GameState, etc.)
│   └── utils/         # Pure functions (hexGrid, validation)
├── components/
│   ├── cards/         # Card rendering and dragging
│   ├── board/         # Hex grid board
│   └── ui/            # Generic UI components (DropPreview)
└── App.tsx            # Root coordinator
```

## Environment Variables
- `VITE_SERVER_URL`: WebSocket server URL for Colyseus (default: `ws://localhost:2567`)
  - Displayed in navbar for debugging
  - Set via docker-compose.yaml for container
  - App works in "demo mode" if server is unavailable

## Known Patterns to Preserve

1. **Server is source of truth**: Game state comes from Colyseus, client only sends commands
2. **Wind calculation**: Uses velocity-based physics (`ddx/dt`) - don't simplify to position-based
3. **Hex IDs**: Format is always `"hex:q,r"` (droppable ID) vs `"q,r"` (board state key)
4. **Tilt direction**: "Attract" mode default - card tilts toward cursor, not away
5. **CardView independence**: Can be used without DndContext - maintain this flexibility
6. **Card effects library**: Keep standalone and framework-agnostic for reusability

## Multiplayer Architecture

### Client-Server Flow
```
Client                          Colyseus Server
  │                                   │
  ├─ User drags card                  │
  ├─ Local validation                 │
  ├─ Visual feedback                  │
  │                                   │
  ├─ playCard(cardId, hexKey) ───────>│
  │                                   ├─ Validate move
  │                                   ├─ Update game state
  │                                   ├─ Broadcast to all clients
  │<────── room.state updated ────────┤
  │                                   │
  ├─ Re-render with new state         │
```

### Demo Mode
- Client can run standalone without server
- UI interactions logged to console
- Useful for testing visual effects and UX
- To enable: `useGameRoom('game_room', false)` (autoConnect: false)

## Testing Notes
No test suite currently configured. When adding tests:
- Consider Vitest (Vite-native)
- Test drag physics calculations separately from React
- Mock honeycomb-grid for unit tests (heavy library)
