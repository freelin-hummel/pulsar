# Pulsar

A system-agnostic collaborative canvas with an Entity Component System (ECS) extension framework. Built on [BlockSuite](https://github.com/toeverything/blocksuite), [RivetKit](https://rivet.dev), and WebGL.

> **Reference docs for development:**
> - https://blocksuite.io
> - https://rivet.dev/llms.txt
> - https://developers.cloudflare.com/llms.txt

## Overview

Pulsar extends BlockSuite's edgeless canvas with a composable ECS that enables modular, reusable behaviors on canvas elements. While designed for virtual tabletop (VTT) use cases, the architecture is intentionally domain-agnostic — any collaborative board scenario benefits from the extensible component/system pattern.

### Key Features

- **ECS Extension System** — Define components (data) and systems (logic) that attach to any canvas element. Extensions are composable, live-editable, and require no build tooling.
- **Multiplayer Sync** — Hybrid consistency model: document/canvas state syncs via BlockSuite's built-in Yjs CRDT, while game logic state is validated by an authoritative RivetKit server actor.
- **WebGL Shader Effects** — A shader overlay system for visual effects applied per-element, selection, or globally.
- **AI Agent Friendly** — Simple, well-typed APIs designed for programmatic interaction and automated content generation.

## Architecture

Pulsar uses a **hybrid consistency model** — document/canvas state syncs via BlockSuite's built-in Yjs CRDT, while game logic state is validated by an authoritative RivetKit server actor. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design.

```
┌──────────────────── Client ──────────────────────────┐
│                                                       │
│  BlockSuite Editor (Edgeless)     ECS World           │
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

## Packages

| Package | Description |
|---------|-------------|
| `@pulsar/ecs` | Core Entity Component System — World, Components, Systems |
| `@pulsar/shared` | Shared types, protocols, and built-in components |
| `@pulsar/client` | React/BlockSuite client with ECS, shaders, and sync |
| `@pulsar/server` | RivetKit actor-based multiplayer backend |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the client (local mode)
pnpm dev

# Start the server (multiplayer)
pnpm dev:server

# Start both
pnpm dev:all
```

## ECS Extension System

Extensions are composable behavior modules that bundle components and systems:

```typescript
import { defineExtension } from '@pulsar/client/lib/extensions/Extension'

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
import { ExtensionRegistry } from '@pulsar/client/lib/extensions/ExtensionRegistry'

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
import { ShaderProgram } from '@pulsar/client/lib/shaders/WebGLManager'

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

- **Document state** (canvas layout, text, visual properties) syncs via BlockSuite's built-in Yjs CRDT. The server persists and relays Yjs updates but does not validate them.
- **Game state** (ECS components like HP, status effects, permissions) syncs through the authoritative RivetKit actor, which validates mutations before broadcasting.
- **User presence** (cursors, selections) is relayed through the server without validation.

## Development

```bash
# Type checking
pnpm typecheck

# Build all packages
pnpm build
```

## License

MIT