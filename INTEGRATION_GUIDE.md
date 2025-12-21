# Found Pakistan - Frontend & Backend Integration Guide

## System Architecture

```
Frontend (Next.js)         Backend (NestJS)         Database (PostgreSQL)
http://localhost:3000  →   http://localhost:3001  →   localhost:5432
```

## Backend Setup (NestJS + Prisma)

### Running the Backend

```bash
cd api
npm install
npm run start:dev
```

The backend runs on **http://localhost:3001** with all API endpoints prefixed with `/api`.

### Environment Variables (api/.env)
```
DATABASE_URL="postgresql://postgres:arooba@localhost:5432/FoundPakistan"
DIRECT_URL="postgresql://postgres:arooba@localhost:5432/FoundPakistan"
PORT=3001
JWT_SECRET="your-secret-key"
REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
REFRESH_EXPIRES_IN="7d"
```

### Database Migrations

Currently, the Prisma schema is updated but migrations haven't been run yet. To create the database tables:

```bash
cd api
npx prisma migrate dev --name init
```

This will:
1. Apply the schema to PostgreSQL
2. Regenerate the Prisma Client

## Frontend Setup (Next.js + React)

### Running the Frontend

```bash
npm install
npm run dev
```

The frontend runs on **http://localhost:3000**

### API Configuration

The frontend uses `src/lib/api.js` to communicate with the backend. Set the API URL via environment variable:

**`.env.local` (create in root)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Or it defaults to `http://localhost:3001/api`

## API Endpoints

All endpoints require the `api/` prefix when called from the frontend.

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login (returns access + refresh tokens)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (invalidates refresh token)
- `POST /auth/request-email-verify` - Request email verification
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update current user
- `GET /users/:id` - Get user by ID (admin only)

### Cases (Missing/Found Reports)
- `GET /cases` - Get all cases (supports filters: type, status, q)
- `GET /cases/:id` - Get case details with media
- `POST /cases` - Create new case (auth required)
- `PATCH /cases/:id` - Update case (owner/admin only)
- `POST /cases/:id/resolve` - Mark case as resolved
- `DELETE /cases/:id` - Soft-delete case (owner/admin only)

### Media
- `POST /media` - Attach photo/document to case (auth required)

### Content (Static Pages)
- `GET /content/:slug` - Get content block (supports locale query param)
- `PUT /content/:slug` - Update/create content (admin only)

### Admin
- `GET /admin/overview` - Dashboard stats (admin only)

## Frontend Integration Examples

### Using the API Client

```javascript
import { casesAPI, authAPI, usersAPI } from '@/lib/api';

// Get all cases
const cases = await casesAPI.getAll({ type: 'MISSING', status: 'OPEN' });

// Create a case
const newCase = await casesAPI.create({
  type: 'MISSING',
  title: 'Missing Person Alert',
  description: 'Details...',
  personName: 'John Doe',
  age: 25,
  gender: 'Male',
});

// Login
const { user, accessToken } = await authAPI.login('email@example.com', 'password');
```

### Using Auth Context

```javascript
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login('email@example.com', 'password')}>Login</button>
      )}
    </>
  );
}
```

## Database Schema

### Models
- **user** - User accounts with email, password, role (USER/ADMIN)
- **caseRecord** - Missing/found person cases
- **caseMedia** - Photos/documents attached to cases
- **session** - Refresh token sessions for logout invalidation
- **verificationToken** - Email verification tokens
- **passwordResetToken** - Password reset tokens
- **contentBlock** - Static content by slug + locale

## Common Tasks

### Create Admin User (via Prisma Studio)
```bash
cd api
npx prisma studio
```

Then manually insert an admin user with role='ADMIN'

### View Database
```bash
npx prisma studio
```

Opens interactive Prisma data browser at http://localhost:5555

### Reset Database
⚠️ This deletes all data:
```bash
npx prisma migrate reset
```

## Troubleshooting

### "DATABASE_URL not set"
Add DATABASE_URL to `api/.env`

### "Port 3001 already in use"
Kill Node process: `taskkill /F /IM node.exe` (Windows) or `killall node` (Mac/Linux)

### "CORS errors"
The backend allows all origins with `enableCors({ origin: '*' })`. If still having issues, check:
- Backend is running on 3001
- Frontend API_URL is correctly set
- API calls include proper headers

### Prisma schema changes
After modifying `api/prisma/schema.prisma`:
```bash
npm run prisma:generate
npx prisma migrate dev --name your_migration_name
```

## Development Checklist

- [x] Backend API running on port 3001
- [x] All controller methods have proper parameter handling
- [x] Prisma schema updated with correct models
- [x] Frontend API client created (`src/lib/api.js`)
- [x] Auth context created for state management
- [ ] Database migrations applied (next step)
- [ ] Frontend pages connected to API
- [ ] Email/notification system configured
- [ ] File upload integration (if needed)
- [ ] Deployment configuration

## Next Steps

1. **Apply Database Migrations**
   ```bash
   cd api && npx prisma migrate dev --name init
   ```

2. **Connect Frontend to Backend**
   - Update homepage to fetch real cases
   - Implement auth flows in /auth pages
   - Build case creation/detail pages

3. **Test API Endpoints**
   - Use Postman or Insomnia
   - Test auth flows
   - Verify case CRUD operations

4. **Configure Email** (Optional)
   - Integrate Nodemailer or SendGrid
   - Setup email verification flow
   - Password reset emails

5. **Add File Upload**
   - Configure S3 or local file storage
   - Update media upload endpoints
   - Add image preview in UI
