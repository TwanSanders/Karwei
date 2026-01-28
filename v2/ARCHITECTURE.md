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
- **Maps**: [Leaflet](https://leafletjs.com/) with CartoDB Voyager tiles.
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
- **Skill**: Available repair categories and expertise areas.
  - Each skill has an `icon` for visual display.
  - Skills are normalized into their own table.
- **Users-to-Skills**: Junction table for many-to-many relationship.
  - Links users (makers) to their skills via `userId` and `skillId`.
  - Enables efficient skill-based filtering and querying.
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
  - `PostRepository`: Handles post lifecycle mutations and location-based fetching.
  - `ReviewRepository`: Handles review creation and rating aggregation.
  - `NotificationRepository`: Handles creation and retrieval of user notifications.
  - `SkillRepository`: Manages skill catalog (list active skills).
  - `UserSkillRepository`: Manages user-skill relationships (batch fetching, atomic updates).

### Security
- **Authentication**: Session-based auth using cookies.
- **Authorization**: 
  - Server-side checks ensure only `maker` users can create offers.
  - Only Post owners can Accept Offers or Mark Fixed.
  - Private data (phone numbers) protected by `ContactRequest` approval flow.
  - Notifications are strictly scoped to the `userId`.


