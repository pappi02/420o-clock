# Email Invite Implementation (Netlify Deploy)
Status: ✅ Complete

`sendEmailInvite` implemented in `src/firebase/services.js` using Firebase `sendSignInLinkToEmail`.

## Features:
- Admin-only (checks `admins/{uid}`)
- Creates `pendingUsers/{email}` document
- Sends passwordless signup magic link
- Prevents duplicate invites

## Next:
- Test: `npm run dev` → Admin Dashboard → Add User → Send invite
- SignIn.jsx should handle `?mode=signInWithEmailLink`
- Deploy: `npm run build && netlify deploy --prod --dir=dist`

## Netlify Notes:
- Firebase client works fine
- No server functions needed (client-side sendSignInLinkToEmail)
- Build: `vite build`, publish dir: `dist`

