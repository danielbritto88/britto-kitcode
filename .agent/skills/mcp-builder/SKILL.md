---
name: mcp-builder
description: MCP (Model Context Protocol) server building — tool design, resource patterns, TypeScript implementation, Anthropic SDK integration.
allowed-tools: Read, Write, Edit, Glob, Grep
updated: 2026-04-25
---

# MCP Builder

> Build MCP servers that AI agents can reliably use. Tools must have clear names, typed inputs, and structured outputs.

---

## Core Concepts

| Concept | Purpose | When to Use |
|---------|---------|-------------|
| **Tools** | Functions AI can call (actions) | API calls, DB writes, computations |
| **Resources** | Data AI can read (context) | Files, configs, docs |
| **Prompts** | Pre-defined prompt templates | Reusable instruction patterns |

---

## Minimal MCP Server (TypeScript)

```typescript
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

// Register a tool
server.tool(
  "get_weather",
  "Get current weather for a city",
  { city: z.string().describe("City name, e.g. 'São Paulo'") },
  async ({ city }) => {
    const data = await fetchWeather(city); // your implementation
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Install:**
```bash
bun add @modelcontextprotocol/sdk zod
```

---

## Transport Selection

| Transport | Use When | How |
|-----------|----------|-----|
| **Stdio** | Local CLI tool, Claude Desktop | `StdioServerTransport` |
| **SSE** | Web app, remote access | `SSEServerTransport` |
| **WebSocket** | Real-time bidirectional | `WebSocketServerTransport` |

**Default for new servers:** Stdio (simplest, works with Claude Desktop and Claude Code).

---

## Tool Design Rules

| Rule | ✅ Do | ❌ Don't |
|------|-------|---------|
| Name | `search_documents`, `create_user` | `do_thing`, `tool1` |
| Scope | One action per tool | Multiple unrelated operations |
| Input | Zod schema with `.describe()` on every field | Untyped `any` inputs |
| Output | `{ content: [{ type: "text", text: string }] }` | Raw objects |
| Errors | Return `{ isError: true, content: [...] }` | Throw unhandled exceptions |

---

## Input Schema — Zod Patterns

```typescript
// Simple tool
server.tool("get_user", "Fetch user by ID", {
  userId: z.string().uuid().describe("User UUID"),
  includeOrders: z.boolean().optional().default(false).describe("Include order history"),
}, handler);

// Complex tool
server.tool("search", "Search documents", {
  query: z.string().min(1).describe("Search query"),
  filters: z.object({
    dateRange: z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(10),
}, handler);
```

---

## Error Handling Pattern

```typescript
server.tool("risky_operation", "...", { id: z.string() }, async ({ id }) => {
  try {
    const result = await doSomething(id);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  } catch (err) {
    // Structured error — AI can read and respond to this
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      }]
    };
  }
});
```

---

## Resource Pattern

```typescript
server.resource(
  "config",
  "app://config",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(await loadConfig()),
    }]
  })
);

// Parameterized resource
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [{ uri: uri.href, text: await getUserProfile(userId) }]
  })
);
```

---

## Claude Desktop Config

```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

**For Bun:**
```json
{ "command": "bun", "args": ["run", "/path/to/src/index.ts"] }
```

---

## Security Checklist

- [ ] All inputs validated via Zod (never trust raw input)
- [ ] API keys/secrets in `env`, never hardcoded
- [ ] Resource access limited to declared scope
- [ ] Errors sanitized — no internal stack traces exposed to AI
- [ ] Tool names/descriptions don't reveal sensitive system info

---

## Best Practices Checklist

- [ ] Tool names are action verbs + object: `search_emails`, `create_ticket`
- [ ] Every Zod field has `.describe()` — this is what the AI reads
- [ ] Output always `{ content: [{ type: "text", text: "..." }] }`
- [ ] Error path returns `{ isError: true, content: [...] }` not thrown exception
- [ ] Server tested with `@modelcontextprotocol/inspector` before connecting to Claude

---

> **Remember:** The AI relies entirely on tool names and descriptions to decide when and how to call your tools. Descriptions are the API contract — write them for an AI consumer, not a human developer.
