# Combined Features Implementation Plan

## Features Overview

1. **Privacy** - No public contact info
2. **Contact Request System** - Request contact → Email to filer → Approve/Reject
3. **Automatic Matching** - Auto-match cases → Admin verifies → Both parties notified
4. **User Dashboard** - View cases, cancel, mark found, manage contact requests

## Database Entities Needed

### 1. ContactRequest Entity
- `id` (UUID)
- `case_id` (FK to Case)
- `requester_id` (FK to User - who requested)
- `requester_email` (email of requester)
- `requester_message` (optional message)
- `status` (pending/approved/rejected)
- `createdAt`
- `respondedAt`

### 2. CaseMatch Entity
- `id` (UUID)
- `missing_case_id` (FK to Case)
- `found_case_id` (FK to Case)
- `match_score` (0-100)
- `status` (pending/confirmed/rejected)
- `confirmed_by` (FK to User - admin who confirmed)
- `confirmed_at` (Date)
- `createdAt`

### 3. Case Entity Updates
- `matched_with_case_id` (FK to Case - when matched)
- `cancelled_at` (Date - when user cancels)

## Backend Endpoints Needed

### Contact Requests
- `POST /api/cases/:id/contact-request` - Request contact info
- `GET /api/cases/contact-requests` - Get my contact requests (for case filers)
- `PATCH /api/cases/contact-requests/:id/approve` - Approve contact request
- `PATCH /api/cases/contact-requests/:id/reject` - Reject contact request

### User Dashboard
- `GET /api/cases/my-cases` - Already exists
- `PATCH /api/cases/:id/cancel` - Cancel/delete own case
- `PATCH /api/cases/:id/mark-found` - Mark own case as found

### Matching (Admin)
- `GET /api/cases/matches/potential` - Get potential matches (admin)
- `POST /api/cases/matches/:matchId/confirm` - Confirm match (admin)
- `POST /api/cases/matches/:matchId/reject` - Reject match (admin)

## Frontend Changes

### Homepage (Public Cases)
- Remove contact info display
- Add "Request Contact Info" button

### User Dashboard (/profile)
- List user's cases
- Actions: Cancel, Mark Found, View Contact Requests
- Show contact requests received

### Admin Panel
- Show potential matches section
- Review and confirm/reject matches

## Email Notifications

1. **Contact Request** - Email to case filer
2. **Contact Approved** - Email to requester with contact info
3. **Contact Rejected** - Email to requester (rejection notice)
4. **Match Confirmed** - Email to both parties with each other's contact info

