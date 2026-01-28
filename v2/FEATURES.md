# Features & Capabilities

## Goal of the App
**Karwei** is a Community Repair Platform designed to connect people who have broken items with skilled repairers in their local community. 
The core mission is to:
- **Reduce Waste**: Extend the lifespan of items instead of discarding them.
- **Save Money**: Offer affordable repair alternatives compared to buying new.
- **Build Community**: Foster local connections through helpful interactions.

## Key Features

### 1. User Accounts & Meaningful Profiles
- **Registration & Login**: Secure email/password authentication.
- **User Roles**: Users can be "Makers" (repairers) or Requesters.
- **Profile Management**:
  - Detailed profiles including Name, Bio, Skills (for Makers), and Location.
  - **Skills**: Normalized many-to-many relationship with dedicated skill catalog.
    - Each skill has an associated icon for visual identification.
    - Skills are efficiently queried using **Database-Level Filtering** (EXISTS subqueries) for performance.
  - **Profile Picture**: Users can upload and update their profile picture.
  - Contact details (Phone number) which are privacy-protected.
  - **Makers**: Users can toggle "Maker" status to receive offers.

### 2. Repair Lifecycle (Posts)
- **Create Post**: Users can post items that need repairing.
  - Includes Title, Description, Image (Cloudflare R2 with **strict validation**), Target Price, and Item Type.
  - Initial Status: `Open`.
- **Browse Requests**: A feed of recent repair requests is available on the homepage.
- **Detailed View**: Dedicated page for each repair request.

### 3. Offer & Assignment System
- **Making Offers**: Makers can submit offers on `Open` posts.
  - Offers include a message and a proposed price.
- **Accepting Offers**: The Post Owner (Customer) can accept an offer.
  - **Action**: Assigns the Maker to the post.
  - **State Transition**: `Open` -> `In Progress`.
  - **Logic**: Currently, accepting an offer does not automatically reject others, but visual cues imply the post is taken.

### 4. Work & Completion
- **Execution**: The repair is carried out offline.
- **Completion**: The Maker marks the job as "Fixed".
  - **State Transition**: `In Progress` -> `Fixed`.
- **Dispute (Reopen)**: If not satisfied, the Customer can "Reopen" the job.
  - **State Transition**: `Fixed` -> `In Progress`.

### 5. Review & Closure
- **Reviews**: After a post is `Fixed`, the Customer can leave a review for the Maker.
  - **Ratings**: 1-5 Stars and a text comment.
  - **State Transition**: `Fixed` -> `Closed`.
  - **Logic**: Submitting a review officially closes the transaction context.

### 6. Community Interaction
- **Comments**: Public discussions on posts (Q&A before offering).
- **Privacy-First Contact System**: 
  - Direct contact information (phone numbers) is hidden by default.
  - Users must send a **Contact Request** to reveal private details.
  - The target user must **Accept** the request before information is shared.
### 7. Notifications & Location
- **Notifications**: Users receive in-app notifications for:
  - New Offers (for Posters).
  - Offer Accepted (for Makers).
  - Contact Requests (for both parties).
- **Location-Based Discovery**:
  - Users can filter posts by distance (e.g., 5km, 10km, 50km).
  - Posts are sorted by proximity to the user (using Browser location or Profile location).

### 8. UI/UX Refinements
- **Map Aesthetics**: Modern CartoDB Voyager map tiles for a cleaner look.
- **Visual Feedback**: Pulsing blue dot for user's current location on the map.
- **Smart Interactions**: 
  - Sliders update content without scrolling the page.
  - Notification dropdowns close intelligently when clicking outside.

---

## System Analysis & Gaps (Sceptical Review)

### Logic Gaps
1.  **One-Sided Reviews**: Currently, only Customers can review Makers. Makers cannot review Customers, which leaves them vulnerable to bad clients.
2.  **Partial Cancellation Flow**: Inspecting the code reveals that **Customers** can "Unassign Fixer" (reopening the post), but **Makers** have no way to withdraw from a job once assigned.
3.  **Completion Trust**: Only the Customer can mark an item as "Fixed". If a Customer refuses to mark it (or forgets), the Maker receives no on-platform credit/history for the job.
4.  **Payment Isolation**: Financial transactions are offline. The app tracks "Price" but handles no money.

### Recommended Improvements
- **Two-way Reviews**: Allow Makers to rate Customers.
- **Maker Withdrawal**: Add "Withdraw" button for Makers when a job is `In Progress`.
- **Status Visibility**: Better visual indicators for `In Progress` vs `Open` states in the feed.
- **Notifications**: In-app notifications for Offers, Acceptances, and Contact Requests.
- **Location filtering**: Filter posts by distance from user location (Implemented).
