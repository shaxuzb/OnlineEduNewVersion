# Mock Test Flow Design

## Goal

Add support for `MOCK_TEST` chapters returned by `/themes/by-chapter?SubjectId={id}` without changing the existing theme-test screens or navigation flow.

## Approved architecture

Mock tests use an isolated screen flow:

```text
SubjectScreen
  -> MockQuizScreen
  -> MockQuizResultsScreen
  -> MockSolutionScreen
```

`QuizScreen`, `QuizResultsScreen`, and `SolutionScreen` remain the existing theme-test flow. Shared API normalization, query-key helpers, answer-key mapping, and small presentational primitives may be reused; full screen navigation is not shared.

## API mapping

| Concern | Theme test | Mock test |
| --- | --- | --- |
| Test details | `GET /theme-test/{id}` | `GET /mock-tests/{id}` |
| Test PDF | `GET /theme-test/{id}/pdf` | `GET /mock-tests/{id}/pdf` |
| Submit result | `POST /theme-test-results` | `POST /mock-test-results` |
| Results | `GET /theme-test-results?userId=&themeId=` | `GET /mock-test-results?userId=&mockTestId=` |
| Result history | `GET /theme-test-results/history?userId=&themeId=` | `GET /mock-test-results/history?userId=&mockTestId=` |
| Answer PDF | `GET /theme-test/{id}/answer-pdf` | `GET /mock-tests/{id}/answer-pdf` |
| Answer photo | `/mock-test-answer-photos/{answerKeyId}` | `/mock-test-answer-photos/{answerKeyId}` |

The mock response is normalized to the existing quiz answer-key shape. The adapter accepts `options` as either the existing JSON string or an array, so the screen does not contain API-format branching.

## Subject list behavior

`SubjectScreen` keeps ordinary chapters as section headers with theme rows. A result with `itemType === "MOCK_TEST"` is rendered as a standalone premium-style mock-test card using the existing theme tokens. Its card shows the mock name, question count, access state, and PDF availability. Pressing an inaccessible card opens the existing purchase modal; pressing an accessible card navigates directly to `MockQuizScreen`.

## Navigation contract

Add dedicated routes and typed params:

- `MockQuizScreen`: `mockTestId`, `mockTestName`, optional `subjectId`
- `MockQuizResults`: `mockTestId`, `userId`, `mockTestName`
- `MockQuizSolution`: `mockTestId`, `userId`, `mockTestName`
- `MockQuizResultsHistory`: `mockTestId`, `userId`

The mock screen passes the mock ID to every mock endpoint. It never navigates to `QuizScreen`, `QuizResults`, or `QuizSolution`.

## Screen behavior

`MockQuizScreen` mirrors the interaction model of `QuizScreen`: answer selection, grouped test navigation, confirmation dialog, screen protection, loading/error states, and submit handling. On submit it navigates to `MockQuizResults`.

`MockQuizResultsScreen` mirrors the existing result presentation and uses mock result/history endpoints. Its solution action navigates to `MockQuizSolution`.

`MockSolutionScreen` mirrors the existing solution presentation and uses mock result data plus mock test answer/PDF/photo endpoints. It does not open theme-test URLs.

## State and performance

- Add separate React Query keys for mock details, mock results, and mock history.
- Keep list item callbacks stable and memoize the mock card.
- Preserve `SectionList` virtualization and avoid adding nested scroll views to the subject list.
- Do not refetch mock details on every render; use query caching and screen-focus refetch only where the existing quiz flow already does so.
- Keep theme-test cache entries and query keys untouched.

## Error handling and access

- `hasAccess === false` uses the existing purchase modal.
- Missing test data or failed mock requests use the existing quiz error state pattern.
- Missing PDF/photo files show the existing fallback UI instead of crashing.
- A mock test with no `answerKeys` is treated as unavailable and cannot be submitted.

## Verification

- Unit-test the chapter discriminator and mock answer-key adapter, including string and array options.
- Unit-test mock endpoint URL construction and query keys.
- Run TypeScript and the full Jest suite.
- Manually verify: mock card rendering, direct navigation, answer selection, submit, result, history, solution PDF, and back navigation on iOS and Android.

## Assumptions

- `GET /mock-tests/{id}` returns `answerKeys` with the same semantic fields as theme tests, with possible `options` string/array variation.
- Mock result answer objects are compatible with the existing result UI after normalization.
- Backend access control remains represented by `hasAccess` on the chapter/mock response.
