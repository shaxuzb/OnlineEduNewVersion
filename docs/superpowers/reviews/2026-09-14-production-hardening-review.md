# Production Hardening Static Review Checkpoint

Date: 2026-09-14
Branch: `refactor/production-hardening`
Base: `main@ef81b20838695b7b12f345797ee4f9a3d20b821c`

## Verification status

This branch has **not** been declared test/typecheck clean.

GitHub Actions defines `typecheck` and `test` jobs, but current workflow runs fail before any runner step starts: job metadata contains no executed steps and no logs. Local execution is also unavailable in the current agent environment because the repository cannot be cloned from GitHub there.

A merge should therefore wait for fresh executable evidence from:

```bash
yarn install --frozen-lockfile
yarn typecheck
yarn test:ci
```

or an equivalent successful GitHub Actions run.

## Hardened areas reviewed statically

### Authentication and API boundary

- Registration SMS uses the public API client.
- Password-reset request/confirm uses the public API client.
- Access-token refresh is single-flight/queued through one refresh manager.
- Native protected media uses the same refresh manager instead of owning refresh-token logic.
- Registration/password-reset already-sent SMS responses can continue to OTP verification instead of trapping the user on the previous step.

### Quiz/mock attempt boundary

- Active quiz/mock data is normalized into safe attempt DTOs without `correctAnswer` exposure to screens.
- Submission identity is sourced from authenticated app state; legacy request-body `userId` is isolated at the backend compatibility boundary.
- True answer-key secrecy and identity ownership remain backend requirements; see `docs/security/backend-contract-hardening.md`.

### Payments

- Purchase request/response DTOs are typed.
- Card send/resend/verify endpoints use the authenticated client.
- Already-sent card SMS responses are normalized so an already-created order can continue to OTP verification.
- Concurrent verification of the same order/code is single-flight to reduce duplicate payment verification requests.
- Successful payment uses targeted query invalidation rather than clearing the whole React Query cache.

### Offline and realtime

- `NavigationContainer` remains mounted while offline.
- Offline UI is an overlay, preserving navigation state.
- Connectivity policy considers both transport and internet reachability.
- SignalR initial retry is bounded/backoff-based and pauses while known offline.
- SignalR authentication is owned by `accessTokenFactory`; the hub URL no longer captures a stale token.
- Chat unread state is refreshed after reconnect/network recovery.

### Notification privacy

- Android chat/payment notification channels use private lock-screen visibility.
- Chat notification preview is generic and does not expose message text.
- Payment notification preview is generic and does not expose backend payment details.
- SignalR-triggered local notifications remain best-effort; reliable killed-app delivery requires server push.

### Protected media

- Shared protected-media source construction and auth-error detection exist.
- Video uses the shared access-token refresh path.
- `QuizScreen` and `ThemeAbstractScreen` use the shared protected PDF viewer.
- Protected PDF auth recovery can be used again after a successful reload rather than being permanently exhausted after the first token refresh.

### Update enforcement

- Forced updates cannot be dismissed through the close button, overlay, Android back callback, or “later” action.
- A previously dismissed version cannot suppress a forced update.
- Failed version checks do not advance the 24-hour success timestamp.
- Store URLs are restricted to expected HTTPS App Store / Google Play hosts.

### Cleanup / CI

- Broad generic TypeError console suppression was removed.
- Dead fully-commented duplicate warning file was removed.
- Placeholder Codemagic workflow was removed.
- Empty root `null.txt` artifact was removed.
- GitHub Actions uses Node 20.19.4 and the repository Yarn lockfile.

## Remaining frontend gaps before merge

1. **Executable verification is blocked.** GitHub Actions jobs currently terminate before steps start; no test/typecheck pass evidence exists yet.
2. **Legacy protected PDF screens remain.** Large screens such as `MockQuizScreen`, `MockSolutionScreen`, certificate quiz, and some solution flows still own SecureStore/PDF auth code and should be migrated to the shared protected-media component in a patch-capable/local workspace.
3. **Video initial empty source.** `VideoPlayerCore` can mount the native video component before the authenticated URI is available. Gate native rendering until a valid authenticated source exists.
4. **Navigation typing is not yet universal.** The root navigator is typed, but several legacy screens still accept `navigation: any` / `route: any`.
5. **Legacy root route type duplication should be checked.** `src/types/index.ts` contains an older `RootStackParamList`; once usage is confirmed, consolidate to the canonical `src/navigation/rootTypes.ts` contract.

## Backend-required blockers

- Active quiz/mock endpoints must stop returning correct answers in raw network responses.
- Quiz ownership and user-scoped results/statistics authorization must be derived/enforced from authentication claims.
- Prefer short-lived resource-scoped media access over long-lived general API bearer tokens for native protected media.
- Register device push tokens and deliver important notifications through APNs/FCM (or an intentionally selected push gateway) for killed-app reliability.

## Merge gate

Do not merge to `main` until:

- `yarn typecheck` succeeds,
- `yarn test:ci` succeeds,
- remaining high-risk frontend gaps above are either fixed or explicitly accepted,
- backend-required security work is tracked separately and is not represented as solved by frontend normalization,
- final diff is reviewed against `main`.
