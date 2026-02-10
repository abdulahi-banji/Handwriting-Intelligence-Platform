# Security Best Practices

This document lists security considerations for development and production environments.

## Secrets management

- Never commit `backend/.env` or any file containing secrets to source control. Add `.env` to `.gitignore`.
- For production, use environment variables injected by the host (Docker secrets, Kubernetes secrets, cloud provider secret manager).
- Example local secret generation:

```bash
python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
```

## JWT & Authentication

- `SECRET_KEY` is used to sign JWT tokens. Keep it secret and rotate if compromised.
- Tokens are created with 7-day expiry in the current implementation. Consider shorter expiry + refresh tokens for production.
- Always verify tokens server-side using the configured `SECRET_KEY`.

## Password storage

- Passwords are hashed with `bcrypt` via `bcrypt.hashpw`. Use recommended work factors and allow re-hashing policies to increase cost over time.

## Database security

- Use least privilege: create a Postgres user that only has access to the application database and minimal permissions.
- Use SSL/TLS for production DB connections if the DB is remote.
- Regularly backup DB and test restore procedures.

## Network & API

- CORS is currently permissive for `http://localhost:5173` and `http://localhost:3000`. For production, restrict origins tightly.
- Rate-limit endpoints if exposed publicly to mitigate brute-force and abuse.

## File uploads

- Validate uploaded files (MIME type and size limits). The current implementation accepts file uploads and processes them; add explicit size checks.
- Store images in object storage in production and do not keep large base64 blobs in DB.

## Dependencies

- Keep dependencies up-to-date and monitor for CVEs (use `dependabot`, `safety`, or `pyup`).

## Incident response

- Have a plan for secret rotation and user notification in case of breach. Rotating `SECRET_KEY` will invalidate JWT tokens — build UX to handle forced re-login.

---
End of security guide.
