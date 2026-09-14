# Media & Navigation Hardening Review Checkpoint

Date: 2026-09-14
Branch: `refactor/media-navigation-hardening`
Base: `refactor/production-hardening@c96e3acfd76b603b29357c54d0b66c566137eb4e`

## Verification status

This branch is **not declared test/typecheck clean**.

GitHub Actions repeatedly creates the `typecheck` and `test` jobs but no runner is assigned (`runner_id: 0`, empty runner name), no steps execute, and job logs are unavailable. Re-running the failed job reproduces the same scheduler-level failure. The current agent container also cannot clone GitHub because DNS resolution for `github.com` fails.

A merge must therefore wait for fresh executable evidence from either a working GitHub Actions runner or a local environment:

```bash
yarn install --frozen-lockfile
yarn typecheck
yarn test:ci
```

## Changes reviewed statically

### Protected video playback

- Native `<Video>` rendering is gated until both a non-empty protected-media URI and an Authorization header are ready.
- Successful video load resets the one-shot media-auth recovery guard so a later token-expiry event in the same mounted screen can recover again.
- Android and iOS video wrappers use the canonical `RootStackParamList` route contract.

### Navigation typing

- `QuizScreen` now uses `NativeStackScreenProps<RootStackParamList, "QuizScreen">`.
- `LessonDetailScreen` now uses `NativeStackScreenProps<RootStackParamList, "LessonDetail">`.
- `LessonDetailScreen` no longer navigates to `ThemeAbstract` with a possibly undefined `themeId`; missing loaded data is handled before navigation.
- Video, abstract, and quiz navigation from lesson details now flow through the canonical root route contract instead of `navigation: any` / `route: any`.

### Realtime lifecycle

- After `HubConnection.start()` resolves, connection eligibility is checked again.
- If the device went offline or the iOS app became ineligible while `start()` was in flight, the just-started connection is stopped instead of being left active and logged as connected.

### Purchase boundary

- `PurchaseContext.submitPurchase` now rejects submission when no subscription plan is selected.
- This prevents `planId: NaN` / `scopeIds: undefined` purchase payloads from reaching the backend after context loss, deep-link entry, or stale navigation state.
- The selected plan is still cleared only after a successful order creation.

## Remaining frontend gaps

1. **Executable verification remains blocked.** No successful `yarn typecheck` or `yarn test:ci` evidence exists for this branch yet.
2. **Legacy protected PDF screens remain.** Certificate/mock/solution screens that directly own SecureStore + `react-native-pdf` auth should still be migrated to `ProtectedPdfViewer` in a patch-capable workspace.
3. **Checkout screen still has legacy cache/navigation code.** The Payme path still clears the whole Query cache and the screen still uses `navigation: any`; it should be migrated to targeted invalidation and typed/root-safe navigation together.
4. **OTP success root reset is still untyped.** `OTPCardVerification` still crosses from the purchase navigator to `MainTabs` with a legacy cast-based reset and should be moved to an explicit root-navigation action.
5. **Legacy root route type duplication remains.** `src/types/index.ts` still contains an older `RootStackParamList`; canonical usage should continue moving to `src/navigation/rootTypes.ts` before deleting the duplicate.
6. **Purchase request typing still permits optional `scopeIds`.** The runtime Context guard now protects the current UI flow, but the DTO should only be tightened after all direct order-creation callsites are verified because GitHub code search is currently incomplete.

## Merge gate

Do not merge this branch until:

- `yarn typecheck` succeeds,
- `yarn test:ci` succeeds,
- Checkout/OTP root-navigation behavior is either fixed or explicitly accepted,
- legacy protected PDF screens are migrated or explicitly deferred with owners,
- final diff is reviewed against `refactor/production-hardening` and then against `main`.
