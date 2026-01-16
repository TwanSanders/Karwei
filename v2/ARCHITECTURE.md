# Technical Architecture

## Technology Stack

### Core Frameworks
- **Framework**: [SvelteKit 2.0](https://kit.svelte.dev/) (Full-stack SSR/CSR)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: Node.js

### Styling & UI
- **CSS Engine**: [TailwindCSS v4](https://tailwindcss.com/)
- **Processor**: PostCSS
- **Icons**: [Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte)
- **Design System**: Custom utility-first design using Tailwind classes.

### Database & Backend
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Driver**: `postgres` (node-postgres)
- **Migrations**: Managed via Drizzle Kit.

## Architecture Overview

### Project Context
The active development resides in the `v2/` directory, representing a modernized version of the platform.

### Data Model
The application is built around a relational schema (defined in `src/lib/server/db/schema.ts`):
- **User**: Central entity with auth data, profile info, and "Maker" status.
- **Post**: Represents a repair request linked to a User.
- **Comment**: Public discussions on Posts.
- **Offer**: Formal bids from Makers on Posts.
- **ContactRequest**: Gatekeeper system for sharing private contact info between users.

### Application Structure
- **Routing**: File-system based routing in `src/routes/`.
- **Server Logic**: Logic is co-located in `+page.server.ts` files (Server-Side Rendering & Form Actions).
- **Authentication**: Custom implementation using bcrypt for hashing and database sessions (inferred).
- **Security**: 
  - Inputs are validated server-side.
  - Sensitive data (contact info) is only delivered after explicit `ContactRequest` approval.

---
> **NOTE**: This file must be updated whenever a new feature is added.
