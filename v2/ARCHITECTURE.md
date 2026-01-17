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
- **Storage**: Cloudflare R2 (S3-compatible object storage) for user-uploaded images.
  - Utility: `src/lib/server/s3.ts` handles uploads.

## Architecture Overview

### Project Context
The active development resides in the `v2/` directory, representing a modernized version of the platform.

### Data Model
The application is built around a relational schema (defined in `src/lib/server/db/schema.ts`). 
Key relationships:
- **User**: Central entity. Can be both a Requester and a Maker.
- **Post**: The core work unit. 
  - `userId`: The Requester (Owner).
  - `makerId`: The assigned Repairer (nullable until assigned).
  - `status`: `open` | `in_progress` | `fixed` | `closed`.
- **Offer**: 
  - Connects `makerId` -> `postId`.
  - Represents a bid. One Post can have multiple Offers.
- **Review**:
  - Connects `reviewerId` (Customer) -> `targetUserId` (Maker).
  - One-directional: Reviews are currently only for Makers.
  - Linked to a specific `postId`.

### Business Logic & State Flow

#### Post Lifecycle
1.  **Creation**: User creates Post -> Status `Open`.
2.  **Bidding**: Makers create `Offer`s. Status remains `Open`.
3.  **Assignment**: Customer accepts an `Offer`.
    - Backend: `PostRepository.assignMaker(postId, makerId)`
    - Status Update: `Open` -> `In Progress`.
    - Maker is recorded in `post.makerId`.
4.  **Completion**: Customer marks "Fixed".
    - Backend: `PostRepository.updateStatus(postId, 'fixed')`
    - Status Update: `In Progress` -> `Fixed`.
5.  **Review & Close**: Customer submits `Review`.
    - Backend: `ReviewRepository.create(...)`
    - Status Update: `Fixed` -> `Closed`.

### Application Structure
- **Routing**: File-system based routing in `src/routes/`.
- **Server Actions**: All mutations (create post, offer, accept, review) are handled in `+page.server.ts` actions.
- **Repositories**: `src/lib/server/repositories/` contains data access logic, abstracting Drizzle calls.
  - `OfferRepository`: Handles fetching and creating offers.
  - `PostRepository`: Handles post lifecycle mutations.
  - `ReviewRepository`: Handles review creation and rating aggregation.

### Security
- **Authentication**: Session-based auth using cookies.
- **Authorization**: 
  - Server-side checks ensure only `maker` users can create offers.
  - Only Post owners can Accept Offers or Mark Fixed.
  - Private data (phone numbers) protected by `ContactRequest` approval flow.

---

## Architectural Logic & Limitations
*Analysis of current system logical boundaries.*

1.  **State Logic**: The transition from `Open` to `In Progress` is implicit upon assigning a maker. However, there is no enforcement that stops other makers from *trying* to offer on an `In Progress` post at the API level (though UI might hide it).
2.  **Immutable Assignment**: Currently, there is no "Unassign" or "Cancel" transaction in the `PostRepository`. Once a maker is assigned, the DB state is rigid.
3.  **One-Way Review Loop**: The architecture supports generic User-to-User reviews, but the business logic in `submitReview` restricts it to Customer -> Maker only.
