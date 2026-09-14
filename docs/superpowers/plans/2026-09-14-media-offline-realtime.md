# Media, Offline, and Realtime Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve navigation state during connectivity loss, make realtime retry behavior network-aware, protect notification contents, and make native protected media recover from refreshed access tokens.

**Architecture:** Keep React Navigation mounted at all times and render connectivity UI above it. Move SignalR retry decisions into small pure policies and coordinate retries with NetInfo/AppState. Native Video/PDF sources use a shared media-auth service that can read the latest SecureStore token and force the existing refresh manager when a protected media request fails.

**Tech Stack:** React Native 0.79.6, Expo 53, React Navigation, NetInfo, SignalR, Expo Notifications, SecureStore, react-native-video, react-native-pdf, Jest.

**Spec:** `docs/superpowers/specs/2026-09-14-production-hardening-design.md`

## Global Constraints

- Work only on `refactor/production-hardening`.
- Do not claim CI/test success while GitHub Actions jobs fail before runner steps execute.
- Do not introduce a second auth/session store.
- Keep backend-preferred signed media URLs documented as future contract work; frontend token recovery is an interim compatibility path.
- Realtime local notifications remain best-effort only; reliable killed-app push remains backend work.

---

### Task 1: Connectivity policy and non-destructive offline UI

**Files:**
- Create: `src/services/networkState.ts`
- Create: `src/services/networkState.test.ts`
- Modify: `src/components/NoConnection.tsx`
- Modify: `src/navigation/AppNavigation.tsx`

**Interfaces:**
- `isNetworkUsable({isConnected,isInternetReachable}): boolean`
- `NoConnection` becomes a presentational overlay with `onRetry` instead of owning parent state.
- `NavigationContainer` stays mounted while offline.

**Behavior:**
- Explicit `isConnected === false` => offline.
- Explicit `isInternetReachable === false` => offline.
- `null`/unknown reachability does not mark the app offline by itself.
- Offline UI overlays navigation rather than replacing it.

### Task 2: Network-aware SignalR retry policy

**Files:**
- Modify: `src/services/chatRealtimeService.ts`
- Modify: `src/services/chatRealtimeService.test.ts`
- Modify: `src/providers/ChatRealtimeProvider.tsx`

**Interfaces:**
- `getChatReconnectDelay(attempt): number` with bounded backoff `[1000, 2000, 5000, 10000, 30000]`.
- `shouldAttemptChatConnection({online, platform, appState}): boolean`.

**Behavior:**
- Never schedule/start initial retries while known offline.
- Reset initial retry attempt after a successful connection or reconnection.
- On network recovery, reconnect and refetch unread state.
- Keep existing SignalR automatic reconnect for established connections.
- Preserve existing iOS background suspension behavior.

### Task 3: Notification privacy

**Files:**
- Modify: `src/services/chatNotificationUtils.ts`
- Modify: `src/services/chatNotificationUtils.test.ts`
- Modify: `src/services/chatNotificationService.ts`

**Behavior:**
- Chat local notification body is generic and does not expose message text on the notification surface.
- Android chat/payment channels use `PRIVATE` lock-screen visibility rather than `PUBLIC`.
- Thread metadata remains available in notification data for routing.

### Task 4: Shared native-media auth recovery

**Files:**
- Modify: `src/services/AxiosService.ts`
- Create: `src/services/mediaAuthService.ts`
- Create: `src/services/mediaAuthService.test.ts`
- Modify: `src/screens/courses/videoplayer/VideoPlayerCore.tsx`
- Modify: protected PDF screens where safely patchable (`QuizScreen.tsx`, `MockQuizScreen.tsx`).

**Interfaces:**
- `getStoredAccessToken(): Promise<string | null>` exported from Axios/session boundary.
- `refreshAccessToken(): Promise<string>` exported from the existing refresh manager.
- `buildProtectedMediaSource(path, token)` builds `{ uri, headers }` from validated API base URL.
- Native media loads the latest stored token on mount/resume/focus.
- On auth-like media failure, force refresh once, replace source token, and remount/reload media; do not infinite-loop.

**Behavior:**
- Axios refresh and native media share one refresh manager.
- Media never stores refresh tokens in UI state.
- A single media source may force refresh at most once per source/load cycle.

### Task 5: Static verification and handoff

- Inspect `main...refactor/production-hardening` diff.
- Verify old destructive offline return is absent.
- Verify fixed `5000` initial retry loop is absent.
- Verify Android lock-screen visibility is no longer `PUBLIC` in chat/payment channels.
- Verify protected native media uses shared auth helper rather than directly parsing SecureStore independently where patched.
- Re-check GitHub Actions and report actual runner/check status without claiming success if no executable evidence exists.
