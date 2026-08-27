# School Management Mobile App (Ready-Made Starter)

This repository now includes a **production-style starter** for a school management system with:

- a backend API (`/server`) for students, fees, billing, posting/approval workflows, bus tracking, groups, and promotions.
- an Expo React Native app (`/src-mobile`) for Admin / Teacher / Guardian / Student access.

## Included Features

### 1) Student management
- Add students with class and guardian details.
- Auto-create guardian login account (default temporary password).

### 2) Payments, dues, bills, and email confirmations
- Track monthly fees, admission, miscellaneous charges.
- Collect payments and generate bill records with bill number.
- Send email confirmation (using Nodemailer JSON transport placeholder; easy to replace with SMTP provider).
- Guardian/student can view:
  - total due
  - paid amount
  - missed payments

### 3) Role-based logins
- Roles: `admin`, `teacher`, `guardian`, `student`.
- Token-based auth with role checks on each endpoint.

### 4) Bus tracking + ETA
- Admin can update live bus location.
- Guardians/students/admin can fetch bus location and estimated arrival time.

### 5) Teacher posts/notices with admin moderation
- Teacher creates post (text/image URL + audience selection).
- Admin receives email notification for approval.
- Admin approval makes content visible to selected audience.
- Teacher receives email when approved.
- Audience can comment on approved posts.

### 6) Audience targeting
Posts can target:
- whole school
- selected classes
- selected students

### 7) Groups and promotions
- Admin creates WhatsApp-like groups and adds students.
- Admin creates promotions (referrals/coupons/vouchers with optional image URL).

### 8) Device permissions (mobile app)
- Image library permission for posting class photos.
- Contacts permission flow with explicit user action.

## Important privacy/compliance note

Your requirement asked for admin access to all contacts from installed users' phonebooks.

To keep this legally safer and privacy-aware, the starter enforces **explicit consent** before contacts can be uploaded (`/contacts/consent-upload`).

> Recommended: add legal consent text, purpose limitation, retention policy, encryption at rest, and country-specific compliance (GDPR/DPDP/COPPA-like requirements where applicable).

## Quick Start

## Backend

```bash
cd server
npm install
npm start
```

Backend runs on: `http://localhost:4000`

Default accounts:

- `admin@school.local` / `admin123`
- `teacher@school.local` / `teacher123`
- `guardian@school.local` / `guardian123`
- `student@school.local` / `student123`

## Mobile app (Expo)

```bash
cd src-mobile
npm install
npm start
```

Then run on emulator/device via Expo.

## API Highlights

- `POST /auth/login`
- `GET|POST /students`
- `GET /payments/status/:studentId`
- `POST /payments/collect`
- `GET /bills/:studentId`
- `POST /posts`
- `POST /posts/:postId/approve`
- `POST /posts/:postId/comments`
- `GET /buses`
- `PATCH /buses/:busId/location`
- `GET|POST /groups`
- `GET|POST /promotions`
- `POST /contacts/consent-upload`

## Suggested next production steps

1. Replace in-memory data with PostgreSQL + ORM.
2. Add strong authentication (JWT refresh tokens, password reset, hashing).
3. Integrate real email/SMS/push providers.
4. Add attendance, exam results, homework, and timetable modules.
5. Add maps SDK live tracking visualization.
6. Add full audit logging, RBAC policies, and admin analytics dashboards.
