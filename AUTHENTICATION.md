# Authentication System Documentation

## Overview
This project now has a complete authentication system with the following features:

## Features

### 1. **User Registration**
- Email and password-based registration
- Password confirmation validation
- Automatic redirect to email verification
- Error handling with toast notifications

### 2. **Email Verification**
- 6-digit OTP verification system
- Resend verification code (with 60-second countdown)
- Email parameter passed via URL
- Automatic redirect to login after successful verification

### 3. **User Login**
- Email and password authentication
- Form validation with Zod schema
- JWT token storage (access & refresh tokens)
- Automatic redirect to dashboard on success
- Redux state management for auth data

### 4. **Protected Routes**
- Dashboard routes require authentication
- Automatic redirect to login if not authenticated
- Loading states during authentication checks
- Client-side route protection

### 5. **Token Management**
- Access token and refresh token stored in Redux persist
- Automatic token refresh on 401 responses
- Token included in API requests via axios interceptor
- Secure token storage in localStorage

### 6. **Logout**
- Clear auth state from Redux
- Remove persisted data from localStorage
- API call to invalidate server-side session
- Redirect to login page

### 7. **Auto-Redirect Logic**
- Authenticated users redirected away from login/register
- Unauthenticated users redirected to login from protected routes
- Root path (/) redirects based on auth status

## File Structure

```
/app
  ├── login/page.tsx              # Login page with authentication
  ├── register/page.tsx           # Registration with validation
  ├── verification/page.tsx       # Email verification with OTP
  ├── dashboard/
  │   ├── layout.tsx             # Protected route wrapper for dashboard
  │   └── ...                    # Dashboard pages
  └── page.tsx                   # Root redirector

/components
  └── auth/
      └── ProtectedRoute.tsx     # Client-side route protection component

/hooks
  └── useAuth.ts                 # Custom hooks for authentication

/redux
  ├── api/
  │   ├── authApi.ts            # RTK Query authentication endpoints
  │   └── baseApi.ts            # Base API configuration
  ├── slice/
  │   └── authSlice.ts          # Auth state management
  └── store.ts                  # Redux store with persistence

/helpers
  └── axios/
      └── axiosBaseQuery.ts     # Axios base query with token refresh logic

/middleware.ts                   # Next.js middleware (currently pass-through)
```

## Key Components

### Authentication Hooks (`/hooks/useAuth.ts`)
- `useAuth()` - Returns current user, token, and authentication status
- `useRequireAuth()` - Redirects to login if not authenticated
- `useRedirectIfAuthenticated()` - Redirects authenticated users away from auth pages

### Protected Route Component (`/components/auth/ProtectedRoute.tsx`)
- Wraps protected content
- Shows loading spinner during auth check
- Redirects to login if not authenticated

### Auth API (`/redux/api/authApi.ts`)
Endpoints:
- `userSignUp` - Register new user
- `userLogin` - Login user (auto-updates Redux state)
- `userLogout` - Logout user (auto-clears state)
- `verifyEmail` - Verify email with OTP
- `resendVerificationEmail` - Resend verification code
- `refreshToken` - Refresh access token

### Auth Slice (`/redux/slice/authSlice.ts`)
State:
- `currentUser` - User object with email, name
- `accessToken` - JWT access token
- `refreshToken` - JWT refresh token

Actions:
- `signInSuccess` - Set user and tokens
- `signInFailure` - Clear auth state
- `signOut_user` - Logout and clear localStorage

## Token Refresh Flow

1. API request receives 401 Unauthorized
2. Axios interceptor catches the error
3. Refresh token request sent to `/auth/refresh-token`
4. New tokens received and stored in Redux + localStorage
5. Original request retried with new access token
6. If refresh fails, redirect to login

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
```

## Usage Examples

### Check if user is authenticated
```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { isAuthenticated, currentUser } = useAuth()
  
  if (!isAuthenticated) {
    return <p>Please login</p>
  }
  
  return <p>Welcome {currentUser?.name}</p>
}
```

### Protect a page
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  )
}
```

### Use auth in API calls
Authentication is automatic - the axios interceptor adds the token to all requests to the API base URL.

## Security Features

1. **Token Refresh** - Automatic refresh of expired access tokens
2. **Secure Storage** - Tokens stored in Redux persist (localStorage)
3. **Protected Routes** - Client-side route guards
4. **Error Handling** - Comprehensive error messages and toast notifications
5. **Session Management** - Server-side logout invalidation
6. **Password Validation** - Minimum 6 characters, confirmation required

## Best Practices

1. Never commit API keys or sensitive tokens
2. Use HTTPS in production for all API calls
3. Implement rate limiting on auth endpoints
4. Add CSRF protection for sensitive operations
5. Consider adding 2FA for enhanced security
6. Implement password reset functionality
7. Add account lockout after failed login attempts
8. Log authentication events for security auditing

## Future Enhancements

- [ ] Password reset/forgot password flow
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] Remember me functionality
- [ ] Session timeout warnings
- [ ] Account settings page
- [ ] Email change verification
- [ ] Password strength indicator
- [ ] Biometric authentication support

## Troubleshooting

### Token not persisting
- Check if localStorage is available
- Verify Redux persist configuration
- Check browser console for errors

### Infinite redirect loops
- Clear localStorage and restart
- Check middleware configuration
- Verify auth state initialization

### 401 errors after token refresh
- Check API endpoint configuration
- Verify refresh token is being sent correctly
- Check token expiration times on backend

### Verification not working
- Verify email parameter in URL
- Check OTP code validity period
- Ensure verification endpoint is accessible
