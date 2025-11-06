# AGENTS.md

This file provides guidance to agentic coding tools when working with this repository.

## Project Overview

Hono web application on Bun runtime with TypeScript (strict mode). Can deploy to Cloudflare Workers via Wrangler.

## Commands

- **Install**: `bun install`
- **Dev server**: `bun run dev` (hot reload on port 3000)
- **Deploy**: `bun run deploy` (deploys to Cloudflare Workers)
- **Run directly**: `bun run --hot src/index.ts`

## Architecture

- Entry point: `src/index.ts` exports Hono app as default export (Bun pattern)
- Single-file application serving HTML with embedded CSS/JS
- Cloudflare Workers compatible (configured in wrangler.toml)

## Code Style

- **TypeScript**: Strict mode enabled
- **JSX**: Use Hono's JSX runtime (`jsxImportSource: "hono/jsx"`), NOT React
- **Imports**: Import from `hono/jsx` for JSX components
- **Framework**: Hono for routing/server, Bun as runtime
