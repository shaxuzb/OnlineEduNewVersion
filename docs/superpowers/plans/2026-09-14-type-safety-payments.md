# Type Safety and Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the purchase/card-payment flow strongly typed, validate card input before submission, keep card SMS endpoints consistently authenticated, and replace global query-cache clearing with targeted invalidation.

**Architecture:** Define a dedicated `PurchaseStackParamList` and payment DTOs close to the purchase domain. Screens consume typed navigation props, `PurchaseContext.submitPurchase` returns a typed order response, and payment service methods use the private Axios client. Validation lives in a pure helper with Jest coverage; successful OTP verification invalidates only plan/purchase-related query keys.

**Tech Stack:** React Native 0.79.6, Expo 53, React Navigation native-stack, TypeScript 5.8, Axios 1.11, TanStack Query 5, Formik/Yup, Jest 29.

**Spec:** `docs/superpowers/specs/2026-09-14-production-hardening-design.md`

## Global Constraints

- Work only on `refactor/production-hardening`.
- Preserve route names and current UI layout.
- Client card validation is UX validation only; backend/payment provider remains authoritative.
- Card SMS send/resend/payment verification are authenticated operations and use `$axiosPrivate`.
- Do not clear the entire React Query cache after successful payment.
- CI runner is currently unavailable; keep test-first commits and mark runtime verification as pending until CI executes.

---

### Task 1: Define purchase navigation contracts

**Files:**
- Create: `src/navigation/purchaseTypes.ts`
- Modify: `src/navigation/PurchaseStack.tsx`

**Interfaces:**
- Produces `PurchaseStackParamList` with:
  - `PurchaseScreen: undefined`
  - `PurchasePrice: undefined`
  - `Checkout: undefined`
  - `CreditCardScreen: { paymentType: string | number }`
  - `OTPCardVerification: { orderId: number; phoneNumber: string }`

- [ ] Create `purchaseTypes.ts` with the exact param list above.
- [ ] Change `createNativeStackNavigator()` to `createNativeStackNavigator<PurchaseStackParamList>()`.
- [ ] Commit as `refactor: type purchase navigation stack`.

### Task 2: Type payment request/response DTOs and service methods

**Files:**
- Create: `src/services/purchaseTypes.ts`
- Create: `src/services/purchaseService.test.ts`
- Modify: `src/services/purchaseService.ts`
- Modify: `src/context/PurchaseContext.tsx`

**Interfaces:**
- `CreatePurchaseOrderRequest` contains `scopeIds?: number`, `planId: number`, `paymentType: string`, optional card `{ number: string; expire: string }`.
- `PurchaseOrderResponse` contains at least `id: number` and permits backend metadata via an index signature.
- `CardSmsResponse` contains `phone: string` and permits backend metadata.
- `submitPurchase(...)` returns `Promise<PurchaseOrderResponse>`.

- [ ] Write service tests proving `createOrder` uses `$axiosPrivate`, `resendCardSms` uses `$axiosPrivate`, and `verifyCardPayment` uses `$axiosPrivate`.
- [ ] Verify RED conceptually/through CI when available: current resend uses `$axiosBase`.
- [ ] Add DTOs and type all service signatures.
- [ ] Change resend to `$axiosPrivate`.
- [ ] Correct `PurchaseContextType.submitPurchase` to return `Promise<PurchaseOrderResponse>` and remove caller casts.
- [ ] Commit as `refactor: type purchase service contracts`.

### Task 3: Add pure card validation

**Files:**
- Create: `src/screens/purchases/cardValidation.ts`
- Create: `src/screens/purchases/cardValidation.test.ts`
- Modify: `src/screens/purchases/CreditCardScreen.tsx`

**Interfaces:**
- `normalizeCardNumber(value: string): string`
- `isValidCardNumber(value: string): boolean` using 16-digit length plus Luhn checksum.
- `normalizeExpiry(value: string): string`
- `isValidExpiry(value: string, now = new Date()): boolean` for `MM/YY`, valid month, not expired.

- [ ] Write failing tests for malformed length, failed Luhn, valid test number `4242 4242 4242 4242`, invalid month, expired date, and future date.
- [ ] Implement the pure helper.
- [ ] Update Yup validation to use the helper functions.
- [ ] Type screen props with `NativeStackScreenProps<PurchaseStackParamList, "CreditCardScreen">`.
- [ ] Change `handleSendSms(orderId)` to `number` and use `getApiStatus(error)` for status handling.
- [ ] Use typed `const data = await submitPurchase(...)` followed by `await handleSendSms(data.id)`; remove `as any`.
- [ ] Change security copy from “Karta ma'lumotlaringiz xavfsiz saqlanadi” to “Karta ma'lumotlari xavfsiz ulanish orqali yuboriladi” so the client does not claim storage behavior it does not control.
- [ ] Commit as `fix: validate and type card payment form`.

### Task 4: Type OTP route and target cache invalidation

**Files:**
- Modify: `src/screens/purchases/OTPCardVerification.tsx`
- Create: `src/screens/purchases/paymentCache.ts`
- Create: `src/screens/purchases/paymentCache.test.ts`

**Interfaces:**
- `OTPCardVerification` uses `NativeStackScreenProps<PurchaseStackParamList, "OTPCardVerification">`.
- `invalidateAfterSuccessfulPayment(queryClient)` invalidates/refetches only subscription-plan/purchase-order/payment-related keys and never calls `queryClient.clear()`.

- [ ] Write a failing pure/helper test with a fake query client asserting `clear` is never called and expected invalidation methods are called.
- [ ] Implement `invalidateAfterSuccessfulPayment` using the actual project query keys discovered in touched hooks; if a key has no central factory, invalidate its stable top-level key.
- [ ] Replace `queries.clear()` with the targeted helper.
- [ ] Keep `refetchPlan()` after targeted invalidation.
- [ ] Type `orderId` as number and `phoneNumber` as string from route params.
- [ ] Commit as `fix: target payment cache invalidation`.

### Task 5: Batch verification

**Files:** none unless verification exposes a defect.

- [ ] Inspect `main...refactor/production-hardening` diff for purchase files.
- [ ] Check there is no `$axiosBase` import left in `purchaseService.ts`.
- [ ] Check `submitPurchase` no longer returns `Promise<void>`.
- [ ] Check `CreditCardScreen` and `OTPCardVerification` no longer use `navigation: any` / `route: any`.
- [ ] Check `queries.clear()` is gone from OTP payment success.
- [ ] When CI runners are available, run `yarn typecheck` and `yarn test:ci` and require both to pass before PR-ready status.
