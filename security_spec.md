# Security Spec

## Data Invariants
- Users can read their own profile.
- Users cannot modify their own `status` or role.
- Only admins (`danny@easypeasybusiness.com` or users with `status == 'admin'`) can list all users and update other users' statuses.
- The `admin` role is bootstrapped through the user's verified email.

## The Dirty Dozen Payloads
1. Create user with missing keys.
2. Create user with extra ghost fields.
3. Update user `status` to paid as a normal user.
4. Set ID to someone else.
5. Create user profile for an unauthenticated user.
6. Create user profile for an authenticated user with unverified email (skip if app doesn't enforce this for Google login, but we should). Actually we'll skip `email_verified` for now if it's annoying, but the skill says "strictly mandate email_verified == true" for Google login.
7. Spoof email in profile.
8. Set `createdAt` to arbitrary client timestamp.
9. Delete another user.
10. Blanket read users (list) as normal user.
11. Update another user's status as a non-admin.
12. Poison value string length (e.g. email > 300 chars).
