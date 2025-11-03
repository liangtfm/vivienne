# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application built with **Hono** (a lightweight web framework) running on **Bun** (JavaScript runtime). The project uses TypeScript with strict mode enabled and includes JSX support configured for Hono's JSX runtime.

## Development Commands

- **Install dependencies**: `bun install`
- **Run development server**: `bun run dev` (runs with hot reload on port 3000)
- **Run source file directly**: `bun run --hot src/index.ts`

## Architecture

The application entry point is `src/index.ts`, which exports a Hono app instance as the default export. This is the Bun-specific pattern where the default export is used as the server handler.

## TypeScript Configuration

- Strict mode is enabled
- JSX is configured to use Hono's JSX runtime (`"jsxImportSource": "hono/jsx"`)
- When working with JSX components, import from `hono/jsx` rather than React
