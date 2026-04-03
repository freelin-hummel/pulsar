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
- **Multiplayer Sync** — Real-time collaboration powered by RivetKit actors. Each room is a stateful actor that syncs canvas shapes and ECS state across all connected clients.
- **WebGL Shader Effects** — A shader overlay system for visual effects applied per-element, selection, or globally.
- **AI Agent Friendly** — Simple, well-typed APIs designed for programmatic interaction and automated content generation.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    @pulsar/client                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │BlockSuite│  │  ECS     │  │  WebGL Shaders     │ │
│  │  Canvas   │◄─┤  World   │  │  (WebGLManager)    │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│       │              │                                │
│       │        ┌─────┴─────┐                          │
│       │        │ Extensions │ ◄── Live-editable       │
│       │        └───────────┘     composable behaviors │
│       │                                               │
│  ┌────┴──────────────────────────────────────────┐   │
│  │          Sync (WebSocket)                      │   │
│  └────────────────────┬──────────────────────────┘   │
└───────────────────────┼──────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────┐
│               @pulsar/server                          │
│  ┌────────────────────┴──────────────────────────┐   │
│  │           RivetKit Room Actor                  │   │
│  │  • Canonical block state                        │   │
│  │  • ECS component state                         │   │
│  │  • User presence                               │   │
│  │  • Durable persistence                         │   │
│  └───────────────────────────────────────────────┘   │
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

Multiplayer is powered by RivetKit actors. Each room is a durable stateful actor that:

- Maintains the canonical document state
- Syncs shape changes and ECS component state
- Tracks user presence (cursors, selections)
- Persists durably across disconnects

## Development

```bash
# Type checking
pnpm typecheck

# Build all packages
pnpm build
```

## License

MIT