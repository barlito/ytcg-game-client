# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# CardView — Standalone usage
You can render CardView without any DnD context. Just pass a CardData and (optionally) interactive to enable the hover tilt.

``` tsx
import CardView from './components/hand/CardView'
import type { CardData } from './components/hand/CardView'

const demoCards: CardData[] = [
  { id: 't1', name: 'Standalone Alpha', cost: 2, rarity: 'C',  clan: 'Test' },
  { id: 't2', name: 'Standalone Beta',  cost: 3, rarity: 'R',  clan: 'Test' },
  { id: 't3', name: 'Standalone Gamma', cost: 4, rarity: 'SR', clan: 'Test' },
]

export default function StandaloneShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <h2 className="text-sm opacity-70 mb-2">Standalone CardView (no DnD)</h2>
      <div className="flex flex-wrap gap-4">
        {demoCards.map((c) => (
          <CardView key={c.id} card={c} interactive />
        ))}
      </div>
    </section>
  )
}
```
