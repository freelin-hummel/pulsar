# Pulsar Architecture

This document describes the architecture of Pulsar, a system-agnostic collaborative canvas with an Entity Component System (ECS) extension framework.

---

## 1. Consistency Model: Hybrid (Yjs + Authoritative Server)

Pulsar uses a **hybrid consistency model** that splits state into two domains, each with the appropriate sync strategy.

### Document State — Yjs (CRDT)

Canvas layout, text, spatial arrangement, and visual properties are synced via **BlockSuite's built-in Yjs CRDT**. This covers:

- Block positions, dimensions, and transforms on the canvas
- Text content within notes and annotations
- Surface element ordering and grouping
- Extension UI definitions and component source code stored in Library blocks

**Why CRDT for document state:**

- BlockSuite already implements Yjs internally — using it avoids reimplementing undo/redo, offline editing, and conflict resolution.
- Canvas operations (move, resize, reorder) are well-served by CRDT semantics — Yjs handles concurrent edits and ordering internally with deterministic conflict resolution.
- Offline-first editing is critical for unreliable network conditions during live sessions.

The RivetKit actor serves as a **persistence and relay layer** for document state: it stores the Yjs update log durably and relays updates between connected clients, but does not validate or reject document mutations.

### Game Logic State — Authoritative Server

ECS component mutations that represent **game-semantic operations** are routed through the RivetKit actor, which validates and applies them before broadcasting. This covers:

- Health, damage, and status effect changes
- Dice roll results and random outcomes
- Rule script evaluation results
- Permission-sensitive operations (visibility toggles, lock/unlock)

**Why server authority for game logic:**

- CRDTs cannot enforce invariants (e.g., "HP cannot exceed max HP" or "only the GM can reveal hidden elements").
- Dice rolls and random outcomes must be generated server-side to prevent client tampering.
- Permission checks require a trusted execution environment.

### How the Split Works

```
┌─────────────── Client ───────────────────────────────────────────┐
│                                                                   │
│  BlockSuite Editor (Edgeless Mode)                               │
│  ┌──────────────────────┐    ┌────────────────────────────────┐  │
│  │ Y.Doc (CRDT State)   │    │ ECS World                      │  │
│  │ • Block positions     │    │ • Game components (HP, status) │  │
│  │ • Text content        │    │ • Extension systems            │  │
│  │ • Surface layout      │    │ • Scripted behaviors           │  │
│  │ • Visual properties   │    │                                │  │
│  └─────────┬────────────┘    └──────────┬─────────────────────┘  │
│            │                             │                        │
│     Yjs sync provider              Authoritative messages        │
│            │                             │                        │
└────────────┼─────────────────────────────┼────────────────────────┘
             │                             │
             ▼                             ▼
┌─────────────── Server (RivetKit Actor) ──────────────────────────┐
│                                                                   │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐ │
│  │ Yjs Persistence     │    │ Game State (Authoritative)       │ │
│  │ • Store update log  │    │ • Validate mutations             │ │
│  │ • Relay to peers    │    │ • Apply rules                    │ │
│  │ • Durable storage   │    │ • Broadcast results              │ │
│  └─────────────────────┘    └──────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ User Presence                                                │ │
│  │ • Cursors, selections, connection status                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Routing Rules

A mutation is routed based on its **domain**:

| Mutation Type | Route | Authority | Examples |
|---|---|---|---|
| Block spatial changes | Yjs | CRDT (no server validation) | Move, resize, reorder elements |
| Text edits | Yjs | CRDT | Edit note content, rename labels |
| Visual style changes | Yjs | CRDT | Color, opacity, stroke |
| ECS game components | Server | RivetKit actor validates | HP change, status effect, dice roll |
| Permission changes | Server | RivetKit actor validates | Visibility toggle, interaction lock |
| Rule script updates | Yjs (source) → Server (promotion) | Source stored in Yjs blocks; server validates and activates | GM modifying game rules |
| User presence | Server | Relay (no validation) | Cursor position, selection |

### Conflict Resolution

- **Document state conflicts** are resolved automatically by Yjs CRDT semantics according to the underlying shared type (e.g., maps use last-writer-wins per key, text uses sequence CRDT ordering), producing deterministic convergence across clients.
- **Game state conflicts** don't occur because the server processes mutations sequentially — it is the single writer.
- **Cross-domain conflicts** (e.g., a client moves a block via Yjs while the server locks it via game logic) are not prevented by the server at the Yjs layer, because document mutations are not server-validated. Instead, enforcement is cooperative and layered. Clients check ECS permission components before allowing canvas interactions — while an entity is locked, they ignore incoming Yjs updates to protected spatial fields in favor of the authoritative ECS state. If an out-of-policy Yjs mutation still appears (e.g., from a stale or malicious client), it may exist transiently in the CRDT but is not treated as authoritative. Reconciliation occurs either by cooperative clients overwriting the invalid value or by the server-side actor writing corrective Yjs updates back into the document.

---

## 2. System Architecture

Pulsar is built on a **Data-Driven Component Model**. The application acts as a host that interprets and renders definitions stored in the collaborative document, rather than hardcoding game elements into the application bundle.

### Packages

| Package | Role |
|---|---|
| `@pulsar/ecs` | Core Entity Component System — World, Components, Systems, queries |
| `@pulsar/shared` | Shared types, sync protocol definitions, built-in components |
| `@pulsar/client` | React + BlockSuite client with ECS bridge, shaders, and sync |
| `@pulsar/server` | RivetKit actor-based multiplayer backend on Cloudflare Workers |

### Block Structure

Every entity on the canvas is a BlockSuite block with three conceptual layers:

- **State Layer**: Raw data stored as ECS components (e.g., current HP, coordinates, image URLs). Synced via the appropriate channel (Yjs for spatial data, server for game data).
- **View Layer**: BlockSuite's built-in rendering for standard blocks. Custom UI definitions (HTML/CSS or framework-agnostic templates) for extension-defined elements.
- **Logic Layer**: ECS systems that define behaviors (e.g., "reduce HP when a 'damage' event is received"). Executed client-side but validated server-side for game-semantic operations.

### The Dynamic Registry

The Extension Registry manages the lifecycle of custom components:

- **Storage**: Component code (JavaScript) and schemas are stored as strings. In collaborative mode, these are stored within dedicated blocks in the BlockSuite document, synced via Yjs.
- **Injection**: The registry transforms source strings into executable modules at runtime. Extension code executes exclusively within sandboxed iframes (see §3), never in the main application thread. The host communicates with extensions via structured `postMessage` calls.
- **Reactivity**: When a user edits a component's code, Yjs syncs the change, and the registry triggers a hot-reload of that specific component for all connected clients.
- **Namespacing**: Components are auto-prefixed with their extension name (e.g., `health:hp`) to prevent collisions.

---

## 3. Runtime Scripting & Execution

User-provided logic runs in a sandboxed environment to prevent interference with the host application.

### Execution Strategy

The sandboxing approach is chosen per use case:

| Use Case | Sandbox | Rationale |
|---|---|---|
| Game logic (dice, rules, calculations) | **iframe sandbox** with `postMessage` API | Provides JS + DOM isolation with a simple message-passing interface. Covers both logic and UI needs. |
| Custom UI components | **Shadow DOM** (style isolation) within **sandboxed iframe** (security isolation) | Shadow DOM prevents style bleeding; iframe prevents script access to host. |
| Server-side rule validation | **RivetKit actor** (trusted environment) | Rule scripts that enforce game invariants run server-side where they cannot be tampered with. |

### Why iframe-first, not QuickJS

The architecture starts with iframe sandboxing rather than a Wasm-based JS engine (QuickJS-Emscripten) because:

1. **Single sandbox for logic + UI**: Iframes provide both JS isolation and DOM rendering, avoiding the need for separate logic and UI sandboxes.
2. **Lower integration cost**: No Wasm data marshaling overhead. Extensions communicate via structured `postMessage` calls.
3. **Browser-native**: No additional dependencies. Works identically across all browsers.
4. **Upgrade path**: QuickJS can be added later for server-side rule validation or compute-intensive offline calculations without changing the client-side architecture.

### Extension Communication Protocol

Extensions in sandboxed iframes communicate with the host via a structured message API:

```
Host ←→ Extension iframe

Host → Extension:
  { type: 'state-update', components: {...} }    // Push component data
  { type: 'event', name: 'damage', payload: {} } // Deliver game events

Extension → Host:
  { type: 'mutate', component: 'hp', data: {} }  // Request state change
  { type: 'render', html: '...' }                 // Update UI output
  { type: 'roll', dice: '2d6+3' }                 // Request server-side roll
```

Mutation requests from extensions are validated by the host before being applied — the extension cannot directly write to the ECS world or BlockSuite document.

**Message security:** The host must validate `event.origin` and `event.source` on every incoming `message` event — `event.origin` must match the known extension iframe origin, and `event.source` must be the iframe element's `contentWindow` reference. When posting messages to an extension iframe, the host must use a specific `targetOrigin` (not `'*'`) matching the iframe's origin. This prevents other frames or pages from spoofing `mutate`/`roll` messages to bypass the sandbox boundary.

---

## 4. Coordinate-Aware Annotation System

For annotating media (PDFs, images, embedded webpages), the architecture uses a parent-child coordinate bridge built on BlockSuite's existing spatial model.

- **Global Surface**: BlockSuite's `SurfaceBlock` provides a unified (x, y) coordinate system for the entire canvas.
- **Local Mapping**: Media blocks report their rendered dimensions to the surface. Annotations are stored as child elements of the media block.
- **Annotation Pinning**: Annotation positions are stored as relative offsets (percentages of parent dimensions). When the parent is moved, resized, or zoomed, annotations remain aligned to the correct location on the media content.
- **Transform Chain**: Coordinates flow through an affine transform chain (local → parent → global) to support rotation, scaling, and nesting correctly.

---

## 5. Collaborative Permission Model

Permissions use **Metadata-Based Access Control** with a trust split matching the hybrid consistency model.

### Client-Side: UI Enforcement

- **Attribute Flags**: Each block's ECS state includes permission components:
  - `visibility`: Controls whether the block is rendered for specific user roles.
  - `interaction`: Controls whether transform handles (resize/drag) are enabled for a specific user.
- **Event Interceptors**: The application wraps BlockSuite's pointer events. Before a drag or edit command executes, the system checks the entity's permission components against the current user's role.

### Server-Side: Authority Enforcement

- **Mutation Validation**: The RivetKit actor validates all game-state mutations against permission rules before applying and broadcasting them. A client that bypasses UI restrictions and sends unauthorized mutations directly will have them rejected by the server.
- **Bootstrap Permission**: The room creator role is stored server-side in the actor state and cannot be overridden by any client or rule script. This prevents the chicken-and-egg problem of permissions being stored in the document they protect.
- **Rule Scripts**: Rule script source code is stored in Yjs blocks (like any other text content), so GMs can edit it collaboratively with full undo/redo via the Yjs history. However, editing a rule script block does not immediately activate it — the GM must explicitly **promote** the script by sending an activation request to the server. The RivetKit actor validates the promotion request (only the GM role can promote), evaluates the script in its trusted environment, and broadcasts the activated rules to all clients. This two-phase flow (Yjs for authoring, server for activation) ensures that rule source benefits from CRDT editing while enforcement remains server-authoritative.

### Failsafes

- **GM Override**: The room creator always has a bypass mode that ignores all Rule Scripts, preventing accidental lockout.
- **Rule Script Undo**: Rule script source edits are tracked in the Yjs history, allowing undo/redo of text changes. Undoing a source edit does not automatically deactivate the currently active rule — the GM must re-promote to apply the reverted source.

---

## 6. Technical Stack

| Component | Technology | Purpose |
|---|---|---|
| Document State Sync | Yjs (via BlockSuite) | CRDT-based real-time sync for canvas layout, text, and visual properties |
| Game State Sync | RivetKit actors (WebSocket) | Authoritative server for game logic, permissions, and validated mutations |
| Canvas Engine | BlockSuite (Edgeless Mode) | Infinite canvas rendering, block management, and spatial queries |
| ECS Framework | `@pulsar/ecs` (custom) | Entity-Component-System for composable, data-driven behaviors |
| Extension Sandbox | iframe sandbox + Shadow DOM | Isolated execution of user-defined logic and UI |
| Visual Effects | WebGL2 (custom overlay) | GPU-accelerated shader effects per-element or globally |
| Media Rendering | PDF.js (lazy-loaded) | High-fidelity rendering of document-based media |
| Client UI | React 18 + Vite | Application shell and editor integration |
| Server Runtime | Cloudflare Workers + Durable Objects | Globally distributed, low-latency multiplayer backend |
| Persistence | Cloudflare KV + Durable Object storage | Durable state for rooms, Yjs update logs, and game state |

---

## 7. Design Decisions & Rationale

### Why Hybrid over Pure CRDT or Pure Centralized

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **Pure Yjs (CRDT)** | Offline-first, automatic conflict resolution, undo/redo | Cannot enforce game rules, no server-side validation, any client can write any state | Insufficient for game logic integrity |
| **Pure Centralized** | Full server authority, permission enforcement | No offline support, must reimplement undo/redo, BlockSuite's Yjs is wasted | Over-constrains document editing |
| **Hybrid (chosen)** | Best of both — CRDT for documents, authority for game logic | More complex routing logic, two sync paths to maintain | Correct trade-off for a VTT |

### Why BlockSuite's Yjs for Document State

BlockSuite uses Yjs internally for its document model. Leveraging this for document state sync (rather than a custom protocol) is the correct choice because:

1. **Undo/Redo**: Yjs provides correct undo/redo with awareness of collaborative edits out of the box.
2. **Offline Support**: Yjs merges divergent states automatically when a client reconnects, without explicit snapshot diffing.
3. **Conflict Resolution**: Concurrent spatial edits (two users moving the same block) are resolved deterministically by Yjs.
4. **Reduced Surface Area**: Using BlockSuite's built-in sync for document state avoids maintaining a parallel sync protocol for canvas operations.

### Extension Schema Versioning

Extensions that store component data in the document must handle schema evolution:

- Each component definition includes a `version` number.
- When an extension is loaded, it compares its version against the version stored with existing component data.
- If a mismatch is detected, the extension's `migrate(oldData, oldVersion)` function is called to transform the data.
- If no migration function exists, the component falls back to its defaults for any missing fields.

This ensures that updating an extension during a live session doesn't corrupt existing entity data.
