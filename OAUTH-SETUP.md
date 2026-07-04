# Google OAuth setup for Chronos

## The exact redirect URI (copy-paste this)

Chronos / Better Auth always uses:

```
http://localhost:3000/api/auth/callback/google
```

**Not** `/auth/callback/google` — the `/api` prefix is required.

---

## Google Cloud Console steps

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your **OAuth 2.0 Client ID** (type must be **Web application** — not Android/iOS)
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
4. Under **Authorized redirect URIs**, add **exactly**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click **Save**
6. Wait 1–5 minutes for Google to propagate changes, then try again

### Common mistakes

| Mistake | Fix |
|---|---|
| Missing `/api` in path | Use full path above |
| `https://localhost:3000` | Local dev must be `http://` |
| Trailing slash `/google/` | No trailing slash |
| Wrong OAuth client type | Use **Web application** |
| Only added to JavaScript origins | Must also add to **redirect URIs** |
| App on port 3001 | Update `BETTER_AUTH_URL` and Google URIs to match port |

---

## Verify what Chronos sends

With dev server running:

```bash
curl -s -X POST "http://localhost:3000/api/auth/sign-in/social" \
  -H "Content-Type: application/json" \
  -d '{"provider":"google","callbackURL":"/planner"}' -D - -o /dev/null | grep -i location
```

Look for `redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle` in the response.

---

## OAuth consent screen (if still blocked)

1. [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. If app is in **Testing** mode, add your Gmail under **Test users**
3. Publishing status: Testing is fine for beta — just add test users

---

## Production (Vercel)

When deployed, add to the same OAuth client:

| Field | Value |
|---|---|
| JavaScript origins | `https://your-app.vercel.app` |
| Redirect URI | `https://your-app.vercel.app/api/auth/callback/google` |

Set in Vercel env:
- `BETTER_AUTH_URL=https://your-app.vercel.app`
