/// <reference types="jest" />

import { shouldTreatResetRequestAsAlreadySent } from "./resetPasswordRequestPolicy";

describe("password reset request policy", () => {
  it("treats only HTTP 400 as the already-sent case", () => {
    expect(
      shouldTreatResetRequestAsAlreadySent({ response: { status: 400 } }),
    ).toBe(true);
    expect(
      shouldTreatResetRequestAsAlreadySent({ response: { status: 500 } }),
    ).toBe(false);
  });
});
