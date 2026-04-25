# Password Security & Forgot Password Feature

## 🔒 Password Storage Security

### Backend (Database Layer)
**Passwords are NEVER stored in plaintext!**

- **Hashing Algorithm**: `bcrypt` with automatic salt generation
- **Storage**: Only `password_hash` is stored in the database
- **Example Hash**: `$2b$12$abc123xyz.defghijklmnopqrstuvwxyz123456789` (one-way encryption)
- **Database Table**: `users` table with `password_hash` column

**Key Properties:**
- ✅ One-way encryption - even database admins cannot recover original passwords
- ✅ Unique salt per password - prevents rainbow table attacks
- ✅ Cost factor of 12 - slow hashing resists brute force attempts
- ✅ Cannot be reversed - only compared via `bcrypt.checkpw()`

### Frontend (Browser Storage)
**Passwords are NEVER stored in localStorage!**

- **What's stored**: JWT authentication tokens (not passwords)
- **Storage location**: `localStorage.getItem('token')`
- **Token lifetime**: 7 days, then automatic re-login required
- **Transmission**: Token sent with each API request via `Authorization: Bearer {token}` header

**Authentication Flow:**
1. User enters email + password
2. Backend verifies password against hash
3. Backend generates JWT token
4. Frontend stores token (never password)
5. Token used for all subsequent requests
6. Token expires after 7 days for security

---

## 🔑 Forgot Password Feature

### How It Works

#### User Flow:
1. Click "Forgot password?" on login page → ForgotPasswordPage
2. Enter email address
3. System generates secure reset token (valid 24 hours)
4. In production: Email sent with reset link
5. In development: Reset token shown in console + clickable link
6. Click reset link → ResetPasswordPage with token
7. Enter new password
8. Password updated in database, token deleted
9. Redirected to login to use new password

### Backend Endpoints

#### `POST /api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Development):**
```json
{
  "message": "Password reset link generated",
  "reset_token": "550e8400-e29b-41d4-a716-446655440000",
  "reset_url": "http://localhost:5173/reset-password?token=550e8400..."
}
```

**Response (Production - Email Sent):**
```json
{
  "message": "If this email exists, a reset link will be sent"
}
```

**Database Changes:**
- Creates entry in `password_reset_tokens` table
- Token: UUID (secure random)
- Expires: Current time + 24 hours
- Old tokens for same user: Deleted for security

#### `POST /api/auth/reset-password`
**Request:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "new_password": "MyNewPassword123"
}
```

**Validation:**
- ✅ Token must be valid and not expired
- ✅ New password must be 6+ characters
- ✅ Password is bcrypt hashed before storage
- ✅ Used token is immediately deleted

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Database Schema

#### `password_reset_tokens` Table
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
```

### Frontend Pages

#### ForgotPasswordPage (`/forgot-password`)
- Email input field
- "Send Reset Link" button
- Confirmation message after submission
- Link back to login
- Responsive design matching app theme

#### ResetPasswordPage (`/reset-password?token=xxx`)
- Extracts token from URL query parameter
- New password input (with show/hide toggle)
- Confirm password input (with show/hide toggle)
- "Reset Password" button
- Real-time validation
- Error handling for expired/invalid tokens
- Auto-redirects to login on success

### Security Features

🔒 **Token Security:**
- Uses UUID v4 (cryptographically secure random)
- One token per password reset attempt
- 24-hour expiration time
- Tokens are unique (database constraint)
- Deleted immediately after use

🔒 **Password Requirements:**
- Minimum 6 characters
- Bcrypt hashing with cost factor 12
- Salt automatically generated per password
- Can't be reversed or looked up

🔒 **Email Security (Production):**
- Email verification prevents account takeover
- Reset tokens in email (not password)
- User must click link (one-time use)
- No rate limiting in current version (TODO)

🔒 **Privacy:**
- Forgot password endpoint doesn't reveal if email exists
- Returns same message for valid/invalid emails
- Prevents account enumeration attacks

---

## 📋 Production Implementation Checklist

For production deployment, implement:

- [ ] Email service integration (SendGrid, AWS SES, etc.)
- [ ] Modify `forgot_password()` endpoint to send email instead of returning token
- [ ] Update `ResetPasswordPage` to remove `reset_token` from API response
- [ ] Add rate limiting (max 3 reset requests per hour per IP)
- [ ] Add password strength requirements (uppercase, numbers, symbols)
- [ ] Implement password reset email templates
- [ ] Add audit logging for password changes
- [ ] Add re-authentication check before password reset
- [ ] Consider 2FA for additional security

---

## 🧪 Testing

### Development Testing
```bash
# 1. Navigate to http://localhost:5173/forgot-password
# 2. Enter any email
# 3. Copy reset_token from browser console or response
# 4. Click reset link or navigate to: 
#    http://localhost:5173/reset-password?token=YOUR_TOKEN
# 5. Enter new password and confirm
# 6. Login with new password
```

### API Testing (cURL)
```bash
# Request reset token
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Reset password
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN", "new_password": "NewPassword123"}'
```

---

## ⚠️ Important Notes

1. **Development vs Production:**
   - Dev: Token returned in API response for easy testing
   - Prod: Token sent via email only (remove from response)

2. **Token Expiration:**
   - Tokens expire after 24 hours
   - Old tokens automatically deleted when new reset requested

3. **Password Hashing:**
   - Done server-side, never in browser
   - Bcrypt ensures security even if database is compromised

4. **Session Management:**
   - Users remain logged in during password reset
   - Can reset password of different account without logging out

5. **No Rate Limiting (Current):**
   - Consider adding rate limiting in production
   - Prevent brute force attacks on reset endpoint
