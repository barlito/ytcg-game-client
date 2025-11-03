# Card Effects Library

Standalone visual effects for card-like elements. Framework-agnostic hooks for React.

## Features

- **useHoverTilt**: 3D tilt effect on hover with customizable parameters
- **useDragWind**: Physics-based wind effect from drag velocity

## Installation

This is currently embedded in the project. To use in another project, copy the `card-effects/` folder.

## Usage

### useHoverTilt

```tsx
import { useHoverTilt } from '@/lib/card-effects'

function Card() {
  const tilt = useHoverTilt({
    maxRotate: 10,
    maxTranslate: 10,
    scale: 1.05,
    attractMode: true // Card tilts toward cursor
  })

  const shineStyle = {
    background: `radial-gradient(circle at ${tilt.shine.xPct}% ${tilt.shine.yPct}%, rgba(255,255,255,0.3), transparent 50%)`
  }

  return (
    <div
      ref={tilt.ref}
      onPointerMove={tilt.handlePointerMove}
      onPointerLeave={tilt.reset}
      style={tilt.style}
    >
      <div style={shineStyle} /> {/* Holographic shine */}
      Card content
    </div>
  )
}
```

### useDragWind

```tsx
import { useDragWind } from '@/lib/card-effects'

function DraggableCard() {
  const { wind, callbacks } = useDragWind({ maxTilt: 15 })

  return (
    <div
      draggable
      onDrag={(e) => callbacks.onMove(e.movementX, e.movementY)}
      onDragEnd={callbacks.onEnd}
      style={{
        transform: `perspective(700px) rotateX(${wind.rx}deg) rotateY(${wind.ry}deg)`
      }}
    >
      Card content
    </div>
  )
}
```

## Configuration

### TiltOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| maxRotate | number | 8 | Max rotation angle (degrees) |
| maxTranslate | number | 8 | Slight XY displacement (pixels) |
| scale | number | 1.03 | Zoom level on hover |
| attractMode | boolean | true | Tilt toward cursor (true) or away (false) |

### DragWindOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| maxTilt | number | 12 | Max tilt angle (degrees) |

## Export to Other Projects

To use this library elsewhere:

1. Copy the entire `card-effects/` folder
2. Adjust imports as needed
3. Install peer dependencies: `react@^19`

## License

MIT (or project license)
