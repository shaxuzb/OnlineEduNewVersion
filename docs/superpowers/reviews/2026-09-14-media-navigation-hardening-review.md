# Media & Navigation Hardening Review Checkpoint

Date: 2026-09-14
Branch: `refactor/media-navigation-hardening`
Base: `refactor/production-hardening@c96e3acfd76b603b29357c54d0b66c566137eb4e`

## Verification status

This branch is **not declared test/typecheck clean**.

GitHub Actions previously created the `typecheck` and `test` jobs without assigning a runner, so no steps executed and no logs were produced. The newest run for the current protected-PDF commit is queued at the time of this checkpoint and therefore does not yet provide executable evidence. The current agent container also cannot clone GitHub because DNS resolution for `github.com` fails.

A merge must therefore wait for fresh executable evidence from either a working GitHub Actions runner or a local environment:

```bash
yarn install --frozen-lockfile
yarn typecheck
yarn test:ci
```

## Changes reviewed statically

### Protected media

- Native `<Video>` rendering is gated until both a non-empty protected-media URI and an Authorization header are ready.
- Successful video load resets the one-shot media-auth recovery guard so a later token-expiry event in the same mounted screen can recover again.
- Android and iOS video wrappers use the canonical root route contract.
- `ProtectedPdfViewer` owns protected-PDF token loading and one-shot auth recovery through the shared Axios refresh path.
- Protected PDF source resolution now clears stale sources when the path changes, guards async source application after effect cleanup, and clears a stale document after fatal/auth-recovery failure.
- Existing media-source regression tests cover API-path normalization and 401/403 auth-error recognition.

### Navigation contracts

- Root navigation uses `src/navigation/rootTypes.ts` as the canonical contract for newly hardened screens.
- Dedicated `CoursesStackParamList` and `MainTabParamList` contracts isolate nested navigator routes from the legacy type bundle.
- `MainTabs` and `PurchaseGroup` are represented as nested navigator params through `NavigatorScreenParams`.
- Android and iOS main-tab navigators are parameterized with `MainTabParamList`; root Chat and Purchase navigation no longer require `useNavigation<any>()`.
- `HomeScreen` uses a composite Courses/root navigation contract, removing legacy casts for Subject, Profile, and News navigation.
- `SubjectScreen` uses a composite Courses/root navigation contract, and invalid extra certificate-quiz params were removed.
- `QuizScreen`, `LessonDetailScreen`, `QuizResultsScreen`, `MockQuizResultsScreen`, mock/certificate history screens, certificate results, ThemeAbstract, and video wrappers have been moved to explicit navigation contracts.
- Certificate result navigation now supplies the required solution `percent`, guarantees a `mavzu` fallback, passes history metadata, and resets to the typed nested Courses route.
- Quiz-result typing exposed and fixed missing solution-route data such as `percent` and history metadata.

### Realtime lifecycle

- After `HubConnection.start()` resolves, connection eligibility is checked again.
- If the device went offline or the iOS app became ineligible while `start()` was in flight, the just-started connection is stopped instead of being left active and logged as connected.

### Purchase boundary and navigation

- `PurchaseContext.submitPurchase` rejects submission when no subscription plan is selected.
- Checkout and card-payment screens also guard missing selection before starting payment work.
- Checkout no longer sends the legacy phantom `totalPrice` parameter to `CreditCardScreen`.
- Merchant `paymentUrl` is represented in the purchase response type and is checked before `Linking.openURL`.
- Checkout no longer clears the entire React Query cache immediately after merchant order creation.
- Checkout and OTP navigate back to Courses through the typed parent root navigator instead of resetting a nested purchase stack to a root route.
- OTP success no longer uses `"MainTabs" as never`.
- OTP resend cooldown restarts after each resend; the 60-second timer is labeled as resend availability rather than code lifetime.

## Remaining frontend gaps

1. **Executable verification remains blocked/pending.** No successful `yarn typecheck` or `yarn test:ci` evidence exists for this branch yet.
2. **Legacy protected PDF screens remain.** `MockQuizScreen`, `MockSolutionScreen`, `SolutionScreen`, `QuizScreenSertificate`, and `SolutionScreenSertificate` still own SecureStore / `react-native-pdf` media auth and should be migrated to `ProtectedPdfViewer`. The certificate quiz full blob is available, but the migration should be committed atomically rather than reconstructed from partial chunks.
3. **Legacy root route type duplication remains.** `src/types/index.ts` still contains an older `RootStackParamList`. `CoursesStackNavigator` and hardened screens no longer depend on it, but deletion should wait until remaining imports are verified with reliable code search/typecheck evidence.
4. **Some local navigation callback values remain broad.** Main-tab callback/event/icon helper values still contain local `any` types even though navigator and root navigation contracts are now explicit.
5. **Purchase request typing still permits optional `scopeIds`.** Runtime guards protect the current UI flow, but the DTO should only be tightened after all direct order-creation callsites are verified because repository code search is incomplete.

## Merge gate

Do not merge this branch until:

- `yarn typecheck` succeeds,
- `yarn test:ci` succeeds,
- remaining protected-PDF ownership is migrated or explicitly deferred with an owner,
- final diff is reviewed against `refactor/production-hardening` and then against `main`.
