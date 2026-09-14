# Backend Contract Hardening Requirements

This document records security requirements that cannot be fully solved by the React Native client.

## 1. Active quiz payloads must not contain answer keys

The following endpoints must never return `correctAnswer` before the corresponding attempt has been submitted/completed:

- `GET /theme-test/{id}`
- `GET /mock-tests/{id}`

The mobile app now normalizes active-attempt payloads and drops `correctAnswer` before exposing data to screens. That reduces accidental in-memory exposure, but it does **not** prevent a user from inspecting an insecure network response. The server is the authoritative fix.

Correct answers may be returned only from explicitly post-submit review/result/solution endpoints after access/ownership checks pass.

## 2. Quiz submission identity must come from authentication claims

The following submission endpoints must derive the acting user from the authenticated JWT/session claims instead of trusting a request-body `userId`:

- `POST /theme-test-results`
- `POST /mock-test-results`

The mobile app now derives submission identity from `AuthContext` and adds the legacy `userId` only inside the service compatibility boundary. The server contract should be migrated to:

```json
{
  "testId": 123,
  "answers": []
}
```

After the backend no longer requires `userId`, remove the compatibility mapping from `src/services/quizAttemptUtils.ts`.

## 3. Results/statistics endpoints require authorization

Any endpoint accepting a `userId` query/path parameter must enforce one of these rules server-side:

- requested user equals the authenticated user, or
- authenticated user has an explicit privileged role allowed to inspect that user.

This applies to quiz result/history/statistics endpoints and any similar user-scoped API.

## 4. Public account bootstrap endpoints

Registration SMS and password-reset request/confirm endpoints are unauthenticated bootstrap flows and should remain public endpoints protected by server-side rate limiting, abuse controls, OTP expiry, and attempt limits.

The mobile app now calls these flows through the public Axios instance and does not trigger access-token refresh for them.

## 5. Verification checklist for backend release

- Inspect raw `GET /theme-test/{id}` response: no `correctAnswer` field exists.
- Inspect raw `GET /mock-tests/{id}` response: no `correctAnswer` field exists.
- Submit theme/mock answers without `userId`: request succeeds for the authenticated account.
- Submit a forged `userId`: it is ignored or rejected; it cannot alter the target account.
- Request another user's results/statistics as a normal user: server returns an authorization error.
- Confirm OTP endpoints apply rate limits and expiry server-side.
