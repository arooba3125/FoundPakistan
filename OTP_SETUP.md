# OTP System Setup Guide

## ✅ Implementation Complete

The OTP (One-Time Password) system has been successfully implemented for FoundPakistan. All users (including admins) must verify their email with a 6-digit OTP code before they can login or access their account after signup.

## Features Implemented

- ✅ 6-digit OTP codes
- ✅ 5-minute expiration time
- ✅ OTP sent on every login attempt
- ✅ OTP sent immediately after signup (required before access)
- ✅ Maximum 3 failed OTP attempts
- ✅ Resend OTP functionality
- ✅ Works for both regular users and admins
- ✅ Beautiful OTP modal UI
- ✅ Gmail SMTP integration

## Configuration Required

### 1. Gmail App Password Setup

To send OTP emails via Gmail, you need to create a Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Go to **App passwords** (at the bottom of Security page)
4. Select **Mail** and **Other (Custom name)** → Enter "FoundPakistan"
5. Copy the 16-character app password generated

### 2. Backend Environment Variables

Create or update `backend/.env` file with the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASS=your_db_password

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Gmail SMTP Configuration (for OTP emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM="FoundPakistan" <your-email@gmail.com>

# App Configuration
APP_PORT=3001
```

**Important:** 
- Use the **16-character App Password** from Gmail, NOT your regular Gmail password
- Make sure 2-Step Verification is enabled on your Google Account

### 3. Database Migration

The OTP fields have been added to the User entity. TypeORM will automatically create/update the database schema when you start the backend server (since `synchronize: true` is enabled).

New fields added to `users` table:
- `otpHash` (varchar, nullable)
- `otpExpiresAt` (timestamp, nullable)
- `otpAttempts` (integer, default 0)
- `otpSentAt` (timestamp, nullable)

## How It Works

### Signup Flow:
1. User fills signup form (email, password, name)
2. Account is created (marked as `isVerified: false`)
3. 6-digit OTP is generated and sent to user's email
4. OTP modal appears on screen
5. User enters OTP code
6. Upon successful verification:
   - User is marked as verified (`isVerified: true`)
   - JWT token is generated and user is logged in
   - User is redirected to homepage

### Login Flow:
1. User enters email and password
2. Password is verified
3. 6-digit OTP is generated and sent to user's email
4. OTP modal appears on screen
5. User enters OTP code
6. Upon successful verification:
   - JWT token is generated and user is logged in
   - User is redirected (homepage for users, admin panel for admins)

### Security Features:
- OTP is hashed using bcrypt (same as passwords)
- OTP expires after 5 minutes
- Maximum 3 failed attempts (after that, user must request new OTP)
- OTP is cleared from database after successful verification
- New OTP invalidates previous OTP automatically

## Testing

1. **Start Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Signup:**
   - Go to http://localhost:3000/auth/user/signup
   - Create a new account
   - Check your email for the OTP code
   - Enter the code in the modal
   - Should be logged in and redirected to homepage

4. **Test Login:**
   - Go to http://localhost:3000/auth/user/login
   - Enter credentials
   - Check your email for the OTP code
   - Enter the code in the modal
   - Should be logged in

5. **Test Admin Login:**
   - Go to http://localhost:3000/auth/admin/login
   - Enter admin credentials
   - Check email for OTP
   - Enter code
   - Should be logged in to admin panel

## Troubleshooting

### Email Not Sending?
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled
- Check backend logs for email service errors
- If using test mode (no EMAIL_USER/EMAIL_PASS), check console logs for test OTP codes

### OTP Not Working?
- Check backend logs for errors
- Verify database connection
- Ensure OTP fields exist in users table
- Check that email service is properly initialized

### "Too many failed attempts" Error?
- User has entered wrong OTP 3 times
- User needs to click "Resend Code" to get a new OTP

## API Endpoints

### POST `/api/auth/signup`
Creates account and sends OTP. Returns:
```json
{
  "message": "Account created successfully! Please check your email for the verification code.",
  "email": "user@example.com",
  "requiresOtp": true
}
```

### POST `/api/auth/login`
Verifies password and sends OTP. Returns:
```json
{
  "message": "Please check your email for the verification code to complete login.",
  "email": "user@example.com",
  "requiresOtp": true
}
```

### POST `/api/auth/verify-otp`
Verifies OTP and returns JWT token. Body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Returns:
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "isVerified": true
  }
}
```

### POST `/api/auth/resend-otp`
Resends OTP to email. Body:
```json
{
  "email": "user@example.com"
}
```

Returns:
```json
{
  "message": "A new verification code has been sent to your email.",
  "email": "user@example.com"
}
```

## Notes

- Users cannot login without OTP verification
- OTP is required for EVERY login (not just first time)
- Admins also require OTP verification
- OTP is sent immediately after signup (no temporary access)
- The system uses Gmail SMTP, but can be configured for other email providers

