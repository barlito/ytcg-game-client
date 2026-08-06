# YTCG Game Client

Web client for **Youl TCG**, a trading card game played on a hexagonal board. This is the front-end companion to the [youl-tcg](https://github.com/barlito/youl-tcg) game server — see also the [youl-tcg-showcase](https://github.com/barlito/youl-tcg-showcase).

Current state: a gameplay proof of concept — a hex map you can drag cards onto from your hand, with card tilt/motion effects.

## Stack

- [React 19](https://react.dev/) + TypeScript, built with [Vite](https://vite.dev/)
- [Zustand](https://github.com/pmndrs/zustand) for game state (hand, board)
- [dnd-kit](https://dndkit.com/) for drag & drop (hand → hex tiles)
- [react-hexgrid](https://github.com/Hellenic/react-hexgrid) for the hexagonal map
- [Framer Motion](https://motion.dev/) and [react-parallax-tilt](https://github.com/mkosir/react-parallax-tilt) for card animations

## Getting started

With Docker (recommended):

```bash
make up        # docker compose up --build, dev server on http://localhost:5173
```

Or locally with npm:

```bash
npm install
npm run dev    # dev server on http://localhost:5173
```

Other commands: `npm run build` (type-check + production build), `npm run lint`, `npm run preview`.

## Configuration

- `VITE_SERVER_URL` — WebSocket URL of the game server (defaults to `ws://localhost:2567` in `docker-compose.yaml`).
