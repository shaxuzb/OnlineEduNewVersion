# OnlineEdu Production Hardening Design

## Goal

Harden `OnlineEduNewVersion` for production without a rewrite. Keep the current React Native/Expo architecture and user-facing flows, while removing critical security, reliability, typing, offline, update, realtime, and CI weaknesses in staged batches.

## Baseline

- Base branch: `main`
- Base commit: `ef81b20838695b7b12f345797ee4f9a3d20b821c`
- Working branch: `refactor/production-hardening`
- Strategy: staged production hardening + targeted refactor
- `main` must not be edited directly.

## Guiding Principles

1. Fix security boundaries at the backend contract boundary, not by cosmetically hiding data in the UI.
2. Preserve current product behavior unless the current behavior is unsafe or demonstrably buggy.
3. Prefer typed, testable small units over large rewrites.
4. Every risky flow gets regression coverage before or with the fix.
5. Separate frontend-only fixes from backend-required contract changes.
6. Keep each implementation batch reviewable and reversible.

## Scope

### 1. Quiz and Mock-Test Integrity

The active quiz client currently models answer keys with `correctAnswer`, and both theme-test and mock-test flows consume answer-key payloads before submission. This creates an integrity risk if the backend sends correct answers before the attempt is submitted.

Design:
- Split active-attempt question DTOs from result/review DTOs.
- Active-attempt types must not require or expose `correctAnswer`.
- Result/review types may contain `correctAnswer` after submission.
- Submission payloads should contain only test identity and user answers.
- Treat client-supplied `userId` as untrusted. If the backend currently requires it, isolate compatibility in one adapter until the API derives user identity from JWT.
- Apply the same model to theme tests and mock tests.

Backend-required:
- `/theme-test/{id}` and `/mock-tests/{id}` should not return correct answers for active attempts.
- Result ownership and scoring must derive the current user from the authenticated server context.

### 2. Auth and API Layer

Design:
- Introduce clear public/private API usage rules.
- Registration SMS and password-reset initiation use the public client.
- Authenticated operations use the private client.
- Normalize Axios errors through one helper so code uses `error.response?.status` consistently.
- Keep the existing queued refresh-token flow, but cover refresh success, refresh failure, queued requests, and auth invalidation with tests.
- Validate `API_URL` usage and fail predictably when configuration is missing.

### 3. Navigation and Type Safety

Design:
- Type all root and purchase stack navigators with explicit param lists.
- Remove `navigation: any` and `route: any` in touched critical flows first, then continue through the project.
- Correct route contracts such as `CreditCardScreen.paymentType` and `OTPCardVerification.orderId`.
- Give mock-test screens route-specific titles/options instead of one shared `Tarixni ko'rish` title.
- Preserve current navigation names to avoid unnecessary migration risk.

### 4. Payment Flow

Design:
- Add typed request/response DTOs for order creation and card verification.
- Correct `submitPurchase` return type so callers no longer cast from `void`.
- Use consistent authenticated endpoints for card SMS send/resend where the backend contract requires authentication.
- Add client-side card-number and expiry format validation as UX validation only; backend/payment-provider validation remains authoritative.
- Replace broad cache clearing after successful payment with targeted invalidation/refetch for plan/order/payment keys.

### 5. Authenticated Media: Video and PDF

Current native media components read a bearer token once and operate outside Axios interceptors.

Design:
- Centralize authenticated media-source creation.
- Prefer backend-issued short-lived signed media URLs if the backend can support them.
- Until signed URLs exist, make token reload/recovery explicit when media receives auth failures or is re-mounted after refresh.
- Reuse the same strategy for quiz PDFs, mock PDFs, answer PDFs, and video streams.

Backend-preferred:
- Short-lived signed URLs for protected video/PDF resources.

### 6. Realtime Chat and Notifications

Design:
- Keep SignalR for live in-app updates.
- Remove fixed endless reconnect loops; use bounded/exponential retry behavior coordinated with NetInfo and AppState.
- Do not retry while known offline.
- Refresh unread state after successful reconnection.
- Treat local notifications generated from SignalR as foreground/background convenience only, not reliable push delivery.
- Lock-screen notification content should default to private/generic text.

Backend-required for reliable killed-app delivery:
- Register push tokens and send FCM/APNs/Expo Push from the backend.

### 7. Offline Behavior

Design:
- Keep `NavigationContainer` mounted while offline so active quiz/video/navigation state is not destroyed.
- Replace root-level navigation replacement with an offline banner or overlay.
- Use both connection and reachability signals where available.
- Let React Query reconnect/refetch handle recoverable server data.

### 8. Version Update Security

Design:
- `forceUpdate` cannot be dismissed via overlay tap, Android back, close action, or previously stored dismissal.
- A force update always overrides a prior dismissal for that version.
- Validate update URLs against approved App Store / Google Play hosts before opening.
- Keep version-check failures observable in development/tests and avoid treating transient fetch failures as a successful 24-hour check.

### 9. Error Visibility and Code Quality

Design:
- Remove broad suppression of `Cannot read property/properties` errors.
- Suppress only exact known third-party warnings.
- Remove or quarantine stale demo/dead code when it is proven unused.
- Update stale project documentation as touched.
- Avoid unrelated visual redesigns.

### 10. CI and Verification

Design:
- Standardize on Node `20.19.4`, matching `package.json` and EAS.
- Remove or repair the placeholder Codemagic configuration.
- Add GitHub Actions CI for dependency install, TypeScript typecheck, and Jest CI tests.
- Add focused regression tests for auth public/private routing, Axios error normalization, force-update dismissal rules, quiz attempt DTO normalization, and realtime retry-policy pure logic.
- Before PR readiness, require fresh evidence from typecheck/tests and inspect the final diff.

## Implementation Batches

### Batch A — Security and Authentication
- Quiz/mock active DTO separation
- Client `userId` trust isolation
- Public/private Axios corrections
- Axios error normalization
- Auth refresh regression tests

### Batch B — Type Safety and Payments
- Typed root/purchase navigation
- Route param corrections
- Payment DTOs and validation
- Targeted cache invalidation

### Batch C — Media, Offline, and Realtime
- Authenticated media-source abstraction
- Offline overlay without navigator unmount
- SignalR retry/network/app-state behavior
- Notification privacy

### Batch D — Update, CI, and Cleanup
- Force-update enforcement and URL allowlist
- Warning suppression cleanup
- CI workflow
- stale config/docs/dead-code cleanup

## Non-Goals

- No full application rewrite.
- No state-management migration away from React Query/context solely for style.
- No redesign of course, quiz, payment, or profile UI unless required by a bug.
- No breaking route-name migration unless required for correctness.
- No claim that a frontend change fixes a backend authorization or data-leak problem when the backend contract is still unsafe.

## Success Criteria

- Critical quiz answer leakage is removed from active-attempt contracts, or clearly blocked as a backend-required item with the frontend ready for the safe contract.
- Registration/reset public flows do not depend on authenticated Axios.
- Critical navigators and payment routes are strongly typed.
- Offline transitions do not destroy the navigation tree.
- Force updates cannot be bypassed through the app UI.
- Realtime reconnect behavior is network/app-state aware.
- CI automatically runs typecheck and Jest on the hardening branch/PR.
- Final branch is reviewable in staged commits and can be merged through a PR instead of direct `main` edits.
