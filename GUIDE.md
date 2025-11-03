# 🎮 Youl TCG - Guide de Développement

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Installation & Démarrage](#installation--démarrage)
- [Architecture](#architecture)
- [Comment Jouer (Mode Démo)](#comment-jouer-mode-démo)
- [Développement](#développement)
- [Intégration Serveur Colyseus](#intégration-serveur-colyseus)
- [Structure du Projet](#structure-du-projet)

---

## Vue d'ensemble

**Youl TCG** est un jeu de cartes à collectionner multijoueur où deux joueurs s'affrontent pour capturer des territoires hexagonaux. Le client est construit avec :

- ⚛️ **React 19** + TypeScript
- 🎨 **Tailwind CSS 4** + DaisyUI
- 🎯 **@dnd-kit** pour le drag & drop
- 🔷 **honeycomb-grid** pour la grille hexagonale
- 🌐 **Colyseus.js** pour le multijoueur (prêt à connecter)

---

## Installation & Démarrage

### Prérequis

- Docker Desktop (pour Windows/WSL2)
- Node.js 22+ (si développement local)

### Démarrage avec Docker

```bash
# Démarrer le container
make up

# Voir les logs
make logs

# Entrer dans le container
make bash

# Arrêter le container
make down

# Rebuild complet
make rebuild
```

L'application sera accessible sur **http://localhost:5173/**

### Développement Local (sans Docker)

```bash
npm install
npm run dev
```

---

## Architecture

### État du Jeu

Le projet utilise une architecture **client-serveur** où :

- **Serveur Colyseus** (à créer) : Source de vérité, valide toutes les actions
- **Client React** : Affiche l'état, envoie des commandes

```
┌─────────────────────────────────────┐
│  Client (React)                     │
│  - Affiche room.state               │
│  - Drag & drop cartes               │
│  - Envoie playCard() au serveur     │
└─────────────┬───────────────────────┘
              │ WebSocket
              │
┌─────────────▼───────────────────────┐
│  Serveur Colyseus (à créer)         │
│  - Valide les coups                 │
│  - Gère le tour par tour            │
│  - Broadcast l'état à tous          │
└─────────────────────────────────────┘
```

**Actuellement en Mode Démo** : Le client fonctionne sans serveur, parfait pour tester l'UI et les animations.

### Composants Clés

#### `App.tsx` - Coordinateur Principal
- Layout fullscreen (Header + Board + Hand)
- Gestion du drag & drop global
- Connexion Colyseus (mode démo si serveur absent)
- Validation de drop en temps réel

#### `Board.tsx` - Plateau Hexagonal
- 7 hexagones (layout SMALL)
- Feedback visuel (hover, valid targets)
- Notification de drop
- Support drag & drop via @dnd-kit

#### `PlayerHand.tsx` - Main du Joueur
- Affichage vertical de 5 cartes
- Cartes draggables avec effet 3D
- Scroll si nécessaire

#### `CardView.tsx` - Rendu de Carte
- Composant standalone (réutilisable)
- Effet tilt 3D au hover
- États : muted, highlight, interactive

### Hooks Personnalisés

#### `useGameRoom` - Connexion Colyseus
```typescript
const { gameState, isConnected, playCard, endTurn } = useGameRoom('game_room', false)
```

- Gère la connexion WebSocket
- Synchronise `room.state` automatiquement
- Mode démo si serveur indisponible

#### `useDropValidation` - Validation de Drop
```typescript
const { currentTarget, validationResult, handleDragMove } = useDropValidation(board, playerId, isPlayerTurn)
```

- Valide chaque cellule en temps réel
- Retourne `{ valid: boolean, reason?: string }`
- Affiche feedback visuel

### Librairie Standalone : Card Effects

Dans `src/lib/card-effects/` - **100% exportable** vers d'autres projets :

#### `useHoverTilt` - Effet 3D au Hover
```typescript
const tilt = useHoverTilt({ maxRotate: 10, scale: 1.04, attractMode: true })
return <div ref={tilt.ref} onPointerMove={tilt.handlePointerMove} style={tilt.style}>...</div>
```

#### `useDragWind` - Effet de Vent au Drag
```typescript
const { wind, callbacks } = useDragWind({ maxTilt: 12 })
// Appeler callbacks.onMove(deltaX, deltaY) pendant le drag
```

---

## Comment Jouer (Mode Démo)

### Interface

```
┌────────────────────────────────────────────────────────┐
│ Header: [Youl TCG] [Demo] [End Turn]                  │
├────────────────────────────────────────────────────────┤
│                        │                               │
│                        │        Your Hand              │
│      Board             │    ┌───────────┐             │
│   (7 hexagones)        │    │  Card 1   │             │
│                        │    └───────────┘             │
│    Drag cards here!    │    ┌───────────┐             │
│                        │    │  Card 2   │             │
│                        │    └───────────┘             │
│                        │         ...                   │
└────────────────────────────────────────────────────────┘
```

### Actions

1. **Drag une carte** depuis la main (droite)
2. **Survole le board** → Cellules vertes = zones valides
3. **Drop sur une cellule** → Notification verte "Card dropped: c1 → 0,0"
4. **Feedback visuel** :
   - 🟢 Cellule valide : stroke vert + animation pointillée
   - 🔵 Hover : glow bleu + scale 1.05
   - 🔴 Invalide : message rouge en bas

### Règles (validées côté client)

- ✅ Cellule doit être vide
- ✅ Cellule doit exister (in bounds)
- ❌ Pas de drop sur territoire adverse (quand implémenté)

---

## Développement

### Commandes Utiles

```bash
# Dev server avec HMR
npm run dev

# Build production
npm run build

# Lint
npm run lint

# Preview build
npm run preview
```

### Ajouter une Nouvelle Carte

Dans `src/components/cards/PlayerHand.tsx` :

```typescript
const cards = useMemo<CardData[]>(() => ([
    { id: 'c6', name: 'Ma Nouvelle Carte', cost: 3, rarity: 'SR', clan: 'Mystic' },
    // ...
]), [])
```

### Changer la Taille du Board

Dans `src/game/utils/hexGrid.ts`, modifier le layout utilisé dans `Board.tsx` :

```typescript
// Actuellement SMALL (7 hexagones)
const grid = useMemo(() => new Grid(Hex, HexLayouts.MEDIUM), [Hex]) // 19 hexagones
```

Layouts disponibles :
- `SMALL` : 7 hexagones (rapide)
- `MEDIUM` : 19 hexagones (équilibré)
- `LARGE` : 37 hexagones (long)

### Personnaliser les Effets Visuels

#### Changer le tilt des cartes

Dans `src/components/cards/CardView.tsx` :

```typescript
const tilt = useHoverTilt({
    maxRotate: 15,      // Amplitude rotation (degrés)
    maxTranslate: 12,   // Déplacement XY (pixels)
    scale: 1.08,        // Zoom au hover
    attractMode: true   // Tilt vers le curseur (true) ou à l'opposé (false)
})
```

#### Modifier le vent au drag

Dans `src/App.tsx`, ligne 79-88 :

```typescript
const maxTilt = 20  // Augmenter pour plus d'effet
```

---

## Intégration Serveur Colyseus

### Étape 1 : Créer le Serveur

Créer un nouveau projet Node.js séparé :

```bash
mkdir ytcg-game-server
cd ytcg-game-server
npm init -y
npm install colyseus @colyseus/schema express
```

### Étape 2 : Définir le Schema

Créer `src/rooms/schema/GameState.ts` :

```typescript
import { Schema, type, MapSchema } from "@colyseus/schema"

export class CardData extends Schema {
    @type("string") id: string
    @type("string") name: string
    @type("number") cost: number
    @type("string") rarity: string
    @type("string") clan: string
}

export class BoardCell extends Schema {
    @type("number") q: number
    @type("number") r: number
    @type(CardData) card?: CardData
    @type("string") ownerId?: string
}

export class Player extends Schema {
    @type("string") id: string
    @type("string") name: string
    @type([CardData]) hand = new ArraySchema<CardData>()
    @type([string]) territories = new ArraySchema<string>()
}

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>()
    @type({ map: BoardCell }) board = new MapSchema<BoardCell>()
    @type("string") currentTurn: string
    @type("string") phase: string = "waiting"
}
```

### Étape 3 : Créer la Room

Créer `src/rooms/GameRoom.ts` :

```typescript
import { Room, Client } from "colyseus"
import { GameState, Player, BoardCell } from "./schema/GameState"

export class GameRoom extends Room<GameState> {
    onCreate() {
        this.setState(new GameState())

        // Initialiser le board (7 cellules)
        const cells = [[0,0], [1,0], [0,1], [-1,1], [1,-1], [2,-1], [2,0]]
        cells.forEach(([q, r]) => {
            const cell = new BoardCell()
            cell.q = q
            cell.r = r
            this.state.board.set(`${q},${r}`, cell)
        })

        // Gérer les commandes
        this.onMessage("playCard", (client, { cardId, hexKey }) => {
            this.handlePlayCard(client, cardId, hexKey)
        })

        this.onMessage("endTurn", (client) => {
            this.handleEndTurn(client)
        })
    }

    onJoin(client: Client) {
        const player = new Player()
        player.id = client.sessionId
        player.name = `Player ${this.clients.length}`

        // Donner 5 cartes de départ
        const startingCards = [
            { id: 'c1', name: 'Prairie Ranger', cost: 2, rarity: 'C', clan: 'Warden' },
            // ...
        ]
        startingCards.forEach(card => player.hand.push(card))

        this.state.players.set(client.sessionId, player)

        if (this.clients.length === 2) {
            // Démarrer la partie
            this.state.currentTurn = this.clients[0].sessionId
            this.state.phase = "playing"
        }
    }

    handlePlayCard(client: Client, cardId: string, hexKey: string) {
        // Valider : c'est le tour du joueur ?
        if (this.state.currentTurn !== client.sessionId) return

        const player = this.state.players.get(client.sessionId)
        const cell = this.state.board.get(hexKey)

        // Valider : cellule existe et est vide ?
        if (!cell || cell.card) return

        // Trouver la carte dans la main
        const cardIndex = player.hand.findIndex(c => c.id === cardId)
        if (cardIndex === -1) return

        const card = player.hand[cardIndex]

        // Jouer la carte
        cell.card = card
        cell.ownerId = client.sessionId
        player.hand.splice(cardIndex, 1)
        player.territories.push(hexKey)
    }

    handleEndTurn(client: Client) {
        if (this.state.currentTurn !== client.sessionId) return

        // Passer au joueur suivant
        const playerIds = Array.from(this.state.players.keys())
        const currentIndex = playerIds.indexOf(client.sessionId)
        const nextIndex = (currentIndex + 1) % playerIds.length
        this.state.currentTurn = playerIds[nextIndex]
    }
}
```

### Étape 4 : Lancer le Serveur

Créer `src/index.ts` :

```typescript
import { Server } from "colyseus"
import { createServer } from "http"
import express from "express"
import { GameRoom } from "./rooms/GameRoom"

const app = express()
const gameServer = new Server({ server: createServer(app) })

gameServer.define("game_room", GameRoom)

gameServer.listen(2567)
console.log("🎮 Colyseus server running on ws://localhost:2567")
```

### Étape 5 : Activer la Connexion Côté Client

Dans `src/App.tsx`, ligne 30 :

```typescript
// Changer false → true pour auto-connect
const { ... } = useGameRoom('game_room', true)
```

Redémarrer le client → Badge "Connected" apparaît !

---

## Structure du Projet

```
ytcg-game-client/
├── src/
│   ├── lib/
│   │   └── card-effects/          # 📦 Librairie standalone (exportable)
│   │       ├── useHoverTilt.ts
│   │       ├── useDragWind.ts
│   │       ├── index.ts
│   │       └── README.md
│   │
│   ├── game/
│   │   ├── hooks/
│   │   │   ├── useGameRoom.ts     # Connexion Colyseus
│   │   │   └── useDropValidation.ts
│   │   ├── types/
│   │   │   └── index.ts           # Types partagés client/serveur
│   │   └── utils/
│   │       ├── hexGrid.ts         # Layouts + helper functions
│   │       └── validation.ts      # Règles de validation
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   ├── CardView.tsx       # Rendu carte standalone
│   │   │   ├── DraggableCard.tsx  # Wrapper @dnd-kit
│   │   │   ├── DragLayer.tsx      # Overlay drag
│   │   │   ├── DragCardOverlay.tsx
│   │   │   └── PlayerHand.tsx     # Main verticale
│   │   ├── board/
│   │   │   └── Board.tsx          # Plateau hexagonal
│   │   └── ui/
│   │       └── DropPreview.tsx    # Feedback drop
│   │
│   ├── App.tsx                    # Root coordinator
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Styles globaux
│
├── public/
├── .docker/
├── docker-compose.yaml
├── Makefile
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── CLAUDE.md                      # Instructions pour Claude Code
└── GUIDE.md                       # Ce fichier !
```

---

## 🚀 Prochaines Étapes

### Court Terme
- [ ] Créer le serveur Colyseus
- [ ] Implémenter le tour par tour
- [ ] Ajouter les règles de jeu complètes
- [ ] Gérer la victoire/défaite

### Moyen Terme
- [ ] Système de deck building
- [ ] Effets de cartes (dégâts, buffs, etc.)
- [ ] Animations de combat
- [ ] Son et musique

### Long Terme
- [ ] Matchmaking
- [ ] Système de ranking
- [] Collection de cartes
- [ ] Crafting / Économie

---

## 🐛 Debug & Logs

### Voir les logs du serveur Vite
```bash
make logs
```

### Voir les logs de drop
Ouvrir la console navigateur (F12) → Tab "Console"
- `[Board] Dropped c1 → 0,0` : Drop validé
- `[Demo Mode] Card played: c1 at 0,0` : Commande envoyée (mode démo)

### Vérifier la connexion Colyseus
- Badge "Demo" = Pas de serveur
- Badge "Connecting..." = Tentative de connexion
- Badge "Live" = Connecté au serveur

---

## 📚 Ressources

- [Colyseus Documentation](https://docs.colyseus.io/)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [honeycomb-grid API](https://abbekeultjes.nl/honeycomb/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)

---

## 🤝 Contribution

Ce projet est un PoC personnel. Pour toute question ou suggestion :
1. Ouvrir une issue
2. Proposer une PR
3. Discuter dans les commentaires

---

**Bon développement !** 🎮✨
