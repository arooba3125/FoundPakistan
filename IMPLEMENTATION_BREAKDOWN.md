# Detailed Implementation Breakdown

## 🎯 Complete Feature System

### Feature 1: Contact Request System (Privacy)
**Goal**: Hide all contact info from public, users must request contact

#### Backend:
1. **ContactRequest Entity** ✅ Created
   - Stores: case_id, requester_email, message, status (pending/approved/rejected)
   
2. **Service Methods Needed**:
   - `createContactRequest()` - Create new request
   - `getContactRequestsForReporter()` - Get requests for case owner
   - `approveContactRequest()` - Approve and send contact info
   - `rejectContactRequest()` - Reject request

3. **Endpoints Needed**:
   - `POST /api/cases/:id/contact-request` - Request contact (public, no auth needed)
   - `GET /api/cases/contact-requests` - Get my requests (auth required)
   - `PATCH /api/cases/contact-requests/:id/approve` - Approve (case owner only)
   - `PATCH /api/cases/contact-requests/:id/reject` - Reject (case owner only)

4. **Email Notifications**:
   - Email to case filer when request is made
   - Email to requester when approved (with contact info)
   - Email to requester when rejected

#### Frontend:
1. **Homepage Changes**:
   - Remove contact info display completely
   - Add "Request Contact Info" button
   - Show modal/form to request contact

2. **User Dashboard**:
   - Show pending contact requests
   - Approve/Reject buttons
   - See request details (email, message, case)

---

### Feature 2: Automatic Matching System
**Goal**: Auto-match missing with found cases, admin reviews and confirms

#### Backend:
1. **CaseMatch Entity** ✅ Created
   - Stores: missing_case_id, found_case_id, match_score, status

2. **Matching Service Methods**:
   - `findPotentialMatches()` - Calculate matches for a case
   - `calculateMatchScore()` - Score algorithm (name, age, gender, date, location)
   - `createPotentialMatch()` - Save match if score >= 70
   - `confirmMatch()` - Admin confirms, link cases, email both parties
   - `rejectMatch()` - Admin rejects match

3. **Matching Algorithm**:
   ```
   REQUIRED:
   - Gender must match exactly
   - Age within ±3 years
   
   SCORING (if required passes):
   - Name similarity (fuzzy): 40 points
   - Date proximity (within 60 days): 30 points
   - Location (same city = 30, different = 5): 30 points
   Total: 0-100 points
   Match if score >= 70
   ```

4. **When Matching Runs**:
   - After case is verified (status = VERIFIED)
   - Check against all VERIFIED cases of opposite type

5. **Endpoints Needed**:
   - `GET /api/cases/matches/potential` - Get potential matches (admin only)
   - `POST /api/cases/matches/:id/confirm` - Confirm match (admin only)
   - `POST /api/cases/matches/:id/reject` - Reject match (admin only)

6. **Email Notifications**:
   - Email both parties when match is confirmed
   - Include each other's contact info

#### Frontend:
1. **Admin Panel**:
   - New "Potential Matches" section
   - Show match pairs with scores
   - Side-by-side case comparison
   - Confirm/Reject buttons

---

### Feature 3: User Dashboard
**Goal**: Users can manage their cases (cancel, mark found, view requests)

#### Backend:
1. **Case Service Methods**:
   - `cancelCase()` - User cancels their own case (sets cancelled_at)
   - `markFoundByUser()` - User marks their case as found (sets status = FOUND)
   - `findByReporter()` - Already exists ✅

2. **Endpoints Needed**:
   - `PATCH /api/cases/:id/cancel` - Cancel own case (case owner only)
   - `PATCH /api/cases/:id/mark-found` - Mark as found (case owner only)
   - `GET /api/cases/my-cases` - Already exists ✅

#### Frontend:
1. **New/Updated Profile/Dashboard Page**:
   - List all user's cases
   - Show case status, dates, details
   - Actions per case:
     - "Cancel Case" button
     - "Mark as Found" button (only if status = VERIFIED)
     - "View Contact Requests" button
   - Contact requests section:
     - List pending requests
     - Approve/Reject actions

---

## 📊 Database Schema Updates

### New Tables:
1. **contact_requests**
   - id, case_id, requester_id, requester_email, requester_message
   - status (pending/approved/rejected), createdAt, respondedAt

2. **case_matches**
   - id, missing_case_id, found_case_id, match_score
   - status (pending/confirmed/rejected), confirmed_by, confirmed_at, createdAt

### Updated Tables:
1. **cases**
   - matched_with_case_id (new) ✅ Added
   - cancelled_at (new) ✅ Added

---

## 🔄 Complete User Flows

### Flow 1: Contact Request
```
Public User → Views Case → Clicks "Request Contact Info"
  → Fills form (email, message) → Submits
  → Email sent to case filer
  → Case filer logs in → Dashboard → Sees request
  → Approves → Email sent to requester with contact info
  → OR Rejects → Email sent to requester (rejected)
```

### Flow 2: Automatic Matching
```
Admin Verifies Case → System auto-runs matching
  → Finds potential matches (score >= 70)
  → Creates CaseMatch records (status = pending)
  → Admin Panel → Sees potential matches
  → Reviews match → Confirms
  → Both cases linked (matched_with_case_id)
  → Both cases status → FOUND
  → Email sent to both parties with contact info
```

### Flow 3: User Marks Found
```
User logs in → Dashboard → Sees their VERIFIED case
  → Clicks "Mark as Found"
  → Case status → FOUND
  → Case no longer shown in public listings
```

### Flow 4: User Cancels Case
```
User logs in → Dashboard → Sees their case
  → Clicks "Cancel Case"
  → Case cancelled_at set
  → Case hidden from public (optional: can show as cancelled)
```

---

## 📝 Implementation Order

### Phase 1: Contact Request System
1. ✅ Create ContactRequest entity
2. Register entity in TypeORM
3. Create contact request service
4. Create endpoints
5. Add email notifications
6. Update frontend: Remove contact info
7. Add "Request Contact Info" button
8. Update user dashboard to show requests

### Phase 2: Automatic Matching
1. ✅ Create CaseMatch entity
2. Register entity in TypeORM
3. Create matching service (algorithm)
4. Auto-run matching on case verification
5. Create admin endpoints
6. Update admin panel UI
7. Add email notifications for confirmed matches

### Phase 3: User Dashboard
1. Update Case entity (done ✅)
2. Add cancel/mark-found endpoints
3. Create/update user dashboard page
4. Add case management UI

---

## 🎨 UI/UX Changes Summary

### Homepage (Public):
- ❌ Remove: Contact info display
- ✅ Add: "Request Contact Info" button/modal

### User Dashboard (/profile):
- ✅ Add: List of user's cases
- ✅ Add: Cancel button per case
- ✅ Add: Mark Found button per case
- ✅ Add: Contact Requests section
- ✅ Add: Approve/Reject buttons for requests

### Admin Panel:
- ✅ Add: "Potential Matches" section
- ✅ Add: Match comparison view
- ✅ Add: Confirm/Reject match buttons

---

## 📧 Email Templates Needed

1. **Contact Request Received** (to case filer)
2. **Contact Request Approved** (to requester - includes contact info)
3. **Contact Request Rejected** (to requester)
4. **Match Confirmed** (to both parties - includes each other's contact info)

---

This is the complete breakdown. Ready to implement step-by-step starting with Contact Request System!

