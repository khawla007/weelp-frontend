# OTP-Based Email Verification Registration

**Date:** 2026-03-25
**Status:** Design Approved

## Overview

Add OTP-based email verification to the user registration flow. Users must verify their email via a 6-digit OTP code before their account is created.

## Requirements

### User Flow
1. User enters: full name, username, email, password, confirm password
2. Click "Continue" → Send OTP to email
3. Show 6-digit OTP input screen
4. User enters OTP → Verify
5. On success: Create account (role=customer), auto-login, redirect to `/dashboard/customer`

### Technical Specifications

#### OTP Configuration
- **Format:** 6-digit numeric code
- **Length:** Exactly 6 characters
- **Expiry:** 10 minutes
- **Max attempts:** 3 incorrect tries
- **Resend cooldown:** 30 seconds
- **Rate limit:** 3 OTP requests per email per hour

#### Data Storage
- **Backend:** Laravel Cache (`otp:{email}` key)
- **TTL:** 600 seconds (10 minutes)

```php
// Cache structure
[
    'otp' => '123456',
    'name' => 'John Doe',
    'username' => 'johndoe',
    'password' => 'hashed_value',
    'attempts' => 0,
    'expires_at' => '2024-03-25T12:30:00Z'
]
```

#### Database Changes
- **No schema changes needed** - OTP uses temporary cache only
- **Username** stored in `user_meta` table (`meta_key='username'`)

## API Endpoints

### POST `/api/public/send-otp`
**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "user@example.com",
  "password": "Secret@123",
  "password_confirmation": "Secret@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "expires_in": 600
}
```

**Errors:**
- 422: Validation failed
- 429: Too many OTP requests (rate limit)

### POST `/api/public/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Errors:**
- 400: Invalid OTP format
- 404: OTP not found or expired
- 422: Incorrect OTP (includes `attempts_remaining`)
- 429: Max attempts exceeded

## Frontend Components

### OtpInput.jsx
- 6 individual input boxes (1 digit each)
- Auto-focus next box on entry
- Handle backspace to focus previous box
- Paste support for 6-digit codes
- Props:
  - `onComplete(otp: string)` - callback when 6 digits entered
  - `onResend()` - callback for resend button
  - `error: string` - error message to display
  - `disabled: boolean` - disable inputs
  - `timeUntilResend: number` - seconds until resend available

### RegisterForm.jsx Modifications
- Add `step` state: `'info'` | `'otp'`
- Store form data between steps
- Integrate OTP input component
- Handle API calls and errors

### State Management
```javascript
const [step, setStep] = useState('info')
const [formData, setFormData] = useState(null)
const [userEmail, setUserEmail] = useState('')
const [timeUntilResend, setTimeUntilResend] = useState(30)
```

## Email Template

**Subject:** Verify your Weelp account

**Body:**
```
Your verification code is: 123456

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

— Weelp Team
```

## Security

- Cryptographically secure random OTP generation
- Rate limiting on send-otp endpoint
- Max 3 verification attempts per OTP
- HTTPS only transmission
- Input sanitization on all fields
- Password hashed before caching
- Log verification attempts for fraud detection

## Success Criteria

- User can register with email verification
- 6-digit OTP sent to email
- OTP expires after 10 minutes
- Max 3 incorrect attempts allowed
- Resend OTP available after 30 seconds
- Successful verification creates account and auto-logins
- User redirected to `/dashboard/customer`
- Username stored in user_meta table
