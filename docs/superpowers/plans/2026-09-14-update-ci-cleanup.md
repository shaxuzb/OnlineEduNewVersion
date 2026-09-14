# Update Security and Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make forced updates non-dismissible, reject untrusted store URLs, avoid caching failed version checks, and remove broad runtime warning suppression without unrelated rewrites.

**Architecture:** Move update decisions into pure policy helpers so dismissal and store URL rules are testable. VersionService propagates remote check failure instead of manufacturing a successful “no update” result. UI treats `forceUpdate` as authoritative and blocks every close path.

**Tech Stack:** React Native, Expo Application/Linking, AsyncStorage, Jest, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-production-hardening-design.md`

## Task 1: Version update policy

**Files:**
- Create: `src/services/versionPolicy.ts`
- Create: `src/services/versionPolicy.test.ts`

**Behavior:**
- `shouldPresentUpdate` returns true for a force update even when the same version was dismissed.
- optional updates respect dismissal.
- `validateStoreUrl` accepts only HTTPS Apple App Store hosts on iOS and Google Play hosts on Android.
- all other protocols/hosts are rejected.

## Task 2: Version check failure semantics

**Files:**
- Modify: `src/services/versionService.ts`
- Modify: `src/hooks/useVersionCheck.ts`

**Behavior:**
- `VersionService.checkForUpdates()` throws when both remote sources fail.
- hook writes `@last_update_check` only after a successful remote check.
- force update always shows regardless of dismissal state.
- hook exposes an explicit safe setter that cannot hide a currently forced update.

## Task 3: Non-dismissible forced update UI

**Files:**
- Modify: `src/components/UpdateNotificationSheet.tsx`

**Behavior:**
- overlay tap closes only optional updates.
- Android back/onRequestClose closes only optional updates.
- close button and “later” remain absent for force updates.
- update URL is validated before `Linking.canOpenURL/openURL`.
- opening the store does not close a force-update sheet.

## Task 4: Warning suppression cleanup

**Files:**
- Inspect/modify: `src/utils/suppressWarnings.ts`
- Remove duplicate/stale suppression file if proven unused.

**Behavior:**
- no suppression of generic `Cannot read property`/`Cannot read properties` runtime errors.
- only exact known third-party warning strings may be suppressed.

## Task 5: Static verification

- inspect branch diff against main.
- verify force-update close paths are conditional.
- verify failed version fetch cannot update last-check timestamp.
- verify broad TypeError suppression is absent.
- re-check GitHub Actions and report actual runner state; do not claim tests pass without executable evidence.
