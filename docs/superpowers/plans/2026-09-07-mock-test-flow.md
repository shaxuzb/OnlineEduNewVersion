# Mock Test Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an isolated mock-test card and flow—`MockQuizScreen`, `MockQuizResultsScreen`, and `MockSolutionScreen`—using the mock-test API without changing the existing theme-test navigation flow.

**Architecture:** Normalize mock-test payloads into the existing quiz answer-key shape in a dedicated adapter. Keep mock routes and query keys separate from theme-test routes, and reuse only stable UI primitives where that does not couple navigation or endpoints.

**Tech Stack:** React Native, React Navigation, TanStack React Query, Axios, TypeScript, Jest.

**Spec:** `docs/superpowers/specs/2026-09-07-mock-test-flow-design.md`

## Global Constraints

- `MOCK_TEST` cards navigate directly to `MockQuizScreen`, never to `QuizScreen`.
- Existing theme-test screens and routes must keep their current endpoint behavior.
- Mock test result requests use `TestId` as the mock test ID and the mock-test result endpoints.
- `options` must support both the existing JSON string format and an API array format.
- Preserve `SectionList` virtualization and stable callbacks in `SubjectScreen`.
- Use TDD: each new pure adapter or URL behavior gets a failing test before implementation.

---

### Task 1: Define mock domain types and payload normalization

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/services/mockTestUtils.ts`
- Create: `src/services/mockTestUtils.test.ts`

**Interfaces:**
- Produce `MockTestChapter`, `MockTest`, and `MockQuizAnswerKey` types.
- Produce `isMockTestChapter(value: unknown): boolean`.
- Produce `normalizeMockTest(value: unknown): MockTest` and `normalizeMockAnswerKey(value: unknown): AnswerKey`.

- [ ] **Step 1: Write failing tests**

Add tests for the provided `MOCK_TEST` chapter, a mock response with `options` as an array, and a response with `options` as a JSON string. Assert that the normalized answer key always exposes the string format consumed by the quiz UI.

- [ ] **Step 2: Run the focused test**

Run `npm.cmd run test:ci -- src/services/mockTestUtils.test.ts`.

Expected result: FAIL because the new module and functions do not exist.

- [ ] **Step 3: Implement the minimal types and adapter**

Extend the chapter response types so `ThemesByChapterResponse.results` accepts either a normal `ChapterWithThemes` or a `MockTestChapter`. Keep the adapter defensive: missing `answerKeys` becomes an empty array, and malformed options become `null` rather than crashing render.

- [ ] **Step 4: Run the focused test again**

Run `npm.cmd run test:ci -- src/services/mockTestUtils.test.ts` and require all tests to pass.

- [ ] **Step 5: Run TypeScript**

Run `npx.cmd tsc --noEmit --pretty false`.

### Task 2: Add mock API services, query keys, and result submission hooks

**Files:**
- Modify: `src/services/quizService.ts`
- Modify: `src/hooks/useQuiz.ts`
- Modify: `src/types/index.ts`
- Modify: `src/services/mockTestUtils.test.ts`

**Interfaces:**
- Add `quizKeys.mockTest`, `quizKeys.mockResults`, and `quizKeys.mockResultsHistory`.
- Add `quizService.getMockTest(mockTestId)`, `getMockTestPdf(mockTestId)`, `submitMockTestResults(request)`, `getMockQuizResults(userId, mockTestId)`, and `getMockQuizResultsHistory(userId, mockTestId)`.
- Add `useMockTest`, `useSubmitMockTestResults`, `useMockQuizResults`, and `useMockQuizResultsHistory`.

- [ ] **Step 1: Write failing endpoint tests**

Add tests that exercise the URL builders/service request paths for `/mock-tests/{id}`, `/mock-tests/{id}/pdf`, `/mock-test-results`, and the `mockTestId` query parameters. Use the existing Axios service test style; do not alter theme-test assertions.

- [ ] **Step 2: Run tests and confirm failure**

Run `npm.cmd run test:ci -- src/services/mockTestUtils.test.ts src/services/quizService.test.ts`.

Expected result: FAIL because mock service methods and keys are not implemented.

- [ ] **Step 3: Implement services and hooks**

Use the existing `$axiosPrivate` and `useQuery/useMutation` patterns. Normalize the mock response before returning it to screens. On successful mock submission invalidate only mock result keys and the mock test detail key.

- [ ] **Step 4: Run focused tests and TypeScript**

Run `npm.cmd run test:ci -- src/services/mockTestUtils.test.ts src/services/quizService.test.ts` and `npx.cmd tsc --noEmit --pretty false`.

### Task 3: Render `MOCK_TEST` chapters and register isolated navigation routes

**Files:**
- Modify: `src/screens/courses/SubjectScreen.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/navigation/AppNavigation.tsx`
- Create: `src/components/courses/MockTestCard.tsx`
- Create: `src/components/courses/MockTestCard.test.tsx`

**Interfaces:**
- Add typed route params for `MockQuizScreen`, `MockQuizResults`, `MockQuizSolution`, and `MockQuizResultsHistory`.
- `MockTestCard` consumes a `MockTestChapter`, theme, and `onPress` callback.

- [ ] **Step 1: Write failing card discriminator test**

Test `isMockTestChapter` with a normal chapter and the provided mock chapter. Test that the mock card exposes the mock name, question count, and access state through its render contract.

- [ ] **Step 2: Run focused tests and confirm failure**

Run `npm.cmd run test:ci -- src/components/courses/MockTestCard.test.tsx src/services/mockTestUtils.test.ts`.

- [ ] **Step 3: Implement the card and SubjectScreen branch**

Keep normal chapters in the existing `sections` data. Render mock chapters as standalone list rows with a stable `keyExtractor`, `React.memo`, theme tokens, mock/test iconography, question count, PDF availability, and locked-state crown. On press, open `modalService` when `hasAccess` is false; otherwise navigate directly to `MockQuizScreen` with `mockTestId` and `mockTestName`.

- [ ] **Step 4: Register lazy routes**

Add four stack routes using `getComponent`, matching existing header gradients, `freezeOnBlur`, and back-button behavior. Do not modify existing theme route names.

- [ ] **Step 5: Run TypeScript and focused tests**

Run `npx.cmd tsc --noEmit --pretty false` and the focused Jest tests.

### Task 4: Build the isolated `MockQuizScreen`

**Files:**
- Create: `src/screens/courses/MockQuizScreen.tsx`
- Create: `src/screens/courses/mockQuizScreenUtils.ts`
- Create: `src/screens/courses/mockQuizScreenUtils.test.ts`

**Interfaces:**
- `MockQuizScreen` consumes `mockTestId` and `mockTestName` route params.
- `mockQuizScreenUtils` provides answer grouping and submission payload mapping compatible with `/mock-test-results`.

- [ ] **Step 1: Write failing pure logic tests**

Test grouping by `subTestNo`, conversion of selected answers to `{ questionNumber, subTestNo, partIndex, answer }`, and rejection of empty answer keys.

- [ ] **Step 2: Run the focused test and confirm failure**

Run `npm.cmd run test:ci -- src/screens/courses/mockQuizScreenUtils.test.ts`.

- [ ] **Step 3: Implement the pure logic**

Use normalized `AnswerKey[]`, preserve the current screen’s unanswered-question confirmation, and ensure mock IDs are never treated as theme IDs.

- [ ] **Step 4: Implement the screen**

Clone the established quiz interaction model into a separate screen: loading/error states, screen protection, answer grid, grouped sub-tests, finish confirmation, and submit mutation. Navigate to `MockQuizResults` only after `submitMockTestResults` succeeds.

- [ ] **Step 5: Verify**

Run the focused logic tests and `npx.cmd tsc --noEmit --pretty false`.

### Task 5: Build `MockQuizResultsScreen` and `MockSolutionScreen`

**Files:**
- Create: `src/screens/courses/MockQuizResultsScreen.tsx`
- Create: `src/screens/courses/MockSolutionScreen.tsx`
- Create: `src/screens/courses/mockQuizResultUtils.ts`
- Create: `src/screens/courses/mockQuizResultUtils.test.ts`

**Interfaces:**
- Results consume `mockTestId`, `userId`, and `mockTestName`.
- Solution consumes the same identifiers and reads mock result/detail endpoints.

- [ ] **Step 1: Write failing result grouping tests**

Test grouping wrong answers by `subTestNo` and safe handling of an empty result array.

- [ ] **Step 2: Run focused tests and confirm failure**

Run `npm.cmd run test:ci -- src/screens/courses/mockQuizResultUtils.test.ts`.

- [ ] **Step 3: Implement result screen**

Mirror the current result layout and states, use mock result hooks, navigate history to `MockQuizResultsHistory`, and navigate solution to `MockSolutionScreen`. Preserve access-gated solution behavior with the existing `SOLUTION` feature check.

- [ ] **Step 4: Implement solution screen**

Mirror the current solution layout, but build all URLs from mock endpoints. Use mock result data for answer correctness and mock answer-key media for photos/video. Add answer PDF support with a safe fallback when `hasAnswerPdf` is false.

- [ ] **Step 5: Verify**

Run focused tests and TypeScript.

### Task 6: Add mock result history and complete regression verification

**Files:**
- Create: `src/screens/courses/MockQuizResultsHistoryScreen.tsx`
- Modify: `src/navigation/AppNavigation.tsx`
- Modify: `src/screens/courses/MockQuizResultsScreen.tsx`

- [ ] **Step 1: Implement history screen**

Use `useMockQuizResultsHistory`, display the existing history-card visual language, and navigate back without resetting the user’s course stack.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run test:ci
git diff --check -- src docs/superpowers/specs docs/superpowers/plans
```

Expected result: TypeScript exit code 0, all Jest suites pass, and `git diff --check` reports only normal line-ending warnings if any.

- [ ] **Step 3: Manual smoke checklist**

Verify on a logged-in build: normal chapter remains unchanged; mock card displays; locked mock opens purchase modal; accessible mock opens `MockQuizScreen`; submit reaches mock results; history loads; solution opens mock PDF/media; Android and iOS back navigation behave correctly.
