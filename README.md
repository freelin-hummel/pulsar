# Pulsar

A system-agnostic collaborative canvas with an Entity Component System (ECS) extension framework. Fork of [BlockSuite](https://github.com/toeverything/blocksuite), extended with [RivetKit](https://rivet.dev) multiplayer and WebGL effects.

> **Reference docs for development:**
> - https://blocksuite.io
> - https://rivet.dev/llms.txt
> - https://developers.cloudflare.com/llms.txt

## Overview

Pulsar is the edgeless canvas editor, extended with a composable ECS that enables modular, reusable behaviors on canvas elements. While designed for virtual tabletop (VTT) use cases, the architecture is intentionally domain-agnostic — any collaborative board scenario benefits from the extensible component/system pattern.

### Key Features

- **ECS Extension System** — Define components (data) and systems (logic) that attach to any canvas element. Extensions are composable, live-editable, and require no build tooling.
- **Multiplayer Sync** — Hybrid consistency model: document/canvas state syncs via built-in Yjs CRDT, while game logic state is validated by an authoritative RivetKit server actor.
- **WebGL Shader Effects** — A shader overlay system for visual effects applied per-element, selection, or globally.
- **AI Agent Friendly** — Simple, well-typed APIs designed for programmatic interaction and automated content generation.

## Architecture

Pulsar uses a **hybrid consistency model** — document/canvas state syncs via built-in Yjs CRDT, while game logic state is validated by an authoritative RivetKit server actor. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design.

```
┌──────────────────── Client ──────────────────────────┐
│                                                       │
│  Pulsar Editor (Edgeless)         ECS World           │
│  ┌──────────────────────┐  ┌────────────────────────┐│
│  │ Y.Doc (CRDT)         │  │ Game Components        ││
│  │ • Block positions     │  │ • HP, status, rules    ││
│  │ • Text, styles        │  │ • Extension systems    ││
│  │ • Surface layout      │  │ • Permissions          ││
│  └─────────┬────────────┘  └──────────┬─────────────┘│
│       Yjs sync                  Authoritative msgs    │
│            │                          │               │
└────────────┼──────────────────────────┼───────────────┘
             │                          │
             ▼                          ▼
┌──────────────────── Server (RivetKit Actor) ─────────┐
│  ┌──────────────────┐  ┌────────────────────────────┐│
│  │ Yjs Persistence  │  │ Game State Authority       ││
│  │ • Relay + store  │  │ • Validate mutations       ││
│  │ • Durable log    │  │ • Enforce permissions      ││
│  └──────────────────┘  └────────────────────────────┘│
│  ┌───────────────────────────────────────────────────┐│
│  │ User Presence (cursors, selections)               ││
│  └───────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

## Project Structure

```
pulsar/
├── src/                     # Main application source
│   ├── ecs/                 # Entity Component System framework
│   ├── shared/              # Shared types, protocols, built-in components
│   ├── editor/              # Editor initialization and context
│   ├── components/          # React UI components
│   │   └── ui/              # MenuBar, ScenePicker, Toolbar, StatusBar
│   ├── hooks/               # React hooks (ECS, shaders, sync)
│   ├── lib/                 # Libraries
│   │   ├── extensions/      # Extension system
│   │   └── shaders/         # WebGL shader system
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component
│   └── theme.css            # Dark theme tokens
├── packages/
│   ├── blocksuite/          # Editor engine (forked from BlockSuite)
│   │   ├── blocks/          # Block implementations
│   │   ├── presets/         # Editor presets and themes
│   │   ├── framework/       # Core framework (store, block-std, etc.)
│   │   └── affine/          # Editor components (surface, model, etc.)
│   └── server/              # RivetKit multiplayer backend
├── index.html               # HTML entry point
├── vite.config.ts           # Vite build config with SWC decorator support
└── package.json             # Single unified package
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the dev server (local mode)
pnpm dev

# Start the multiplayer server
pnpm dev:server

# Build for production
pnpm build

# Deploy
pnpm deploy          # Client (Cloudflare Pages)
pnpm deploy:server   # Server (Cloudflare Workers)
```

## ECS Extension System

Extensions are composable behavior modules that bundle components and systems:

```typescript
import { defineExtension } from './lib/extensions/Extension'

const HealthExtension = defineExtension({
  name: 'health',
  description: 'Adds health tracking to elements',
  components: {
    health: {
      defaults: () => ({ current: 100, max: 100, regenRate: 5 }),
    },
  },
  systems: [{
    name: 'health-regen',
    query: { required: ['health'] },
    onUpdate: (entity, components, dt) => {
      const health = components.get('health:health')!
      if (health.data.current < health.data.max) {
        health.data.current = Math.min(
          health.data.current + dt * health.data.regenRate,
          health.data.max
        )
      }
    },
  }],
})

// Install into the world
HealthExtension.install(world)
```

### Live Extension Loading

Extensions can be loaded from source code at runtime — no build step needed:

```typescript
import { ExtensionRegistry } from './lib/extensions/ExtensionRegistry'

const registry = new ExtensionRegistry(world)

// Load extension from a string of JavaScript
registry.loadFromSource(`
  module.exports = {
    name: 'counter',
    components: {
      counter: { defaults: () => ({ value: 0 }) },
    },
    systems: [{
      query: { required: ['counter'] },
      onUpdate: (entity, components, dt) => {
        components.get('counter:counter').data.value += dt
      },
    }],
  }
`)
```

## WebGL Shaders

The shader system provides a WebGL2 overlay for visual effects:

```typescript
import { ShaderProgram } from './lib/shaders/WebGLManager'

class MyEffect extends ShaderProgram {
  init(gl: WebGL2RenderingContext) { /* compile shaders */ }
  render(gl: WebGL2RenderingContext, dt: number, time: number) { /* draw */ }
  dispose(gl: WebGL2RenderingContext) { /* cleanup */ }
}

// Register with the manager
shaderManager.registerProgram('my-effect', new MyEffect())
```

## Multiplayer

Multiplayer uses a hybrid sync model (see [ARCHITECTURE.md](./ARCHITECTURE.md)):

- **Document state** (canvas layout, text, visual properties) syncs via built-in Yjs CRDT. The server persists and relays Yjs updates but does not validate them.
- **Game state** (ECS components like HP, status effects, permissions) syncs through the authoritative RivetKit actor, which validates mutations before broadcasting.
- **User presence** (cursors, selections) is relayed through the server without validation.

## Development

```bash
# Type checking
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## License

MIT