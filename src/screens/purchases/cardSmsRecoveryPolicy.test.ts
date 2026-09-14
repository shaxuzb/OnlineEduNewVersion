/// <reference types="jest" />

import { shouldContinueCardOtpAfterSmsError } from "./cardSmsRecoveryPolicy";

describe("card sms recovery policy", () => {
  it("continues to otp only when the code was already sent", () => {
    expect(
      shouldContinueCardOtpAfterSmsError({ response: { status: 400 } }),
    ).toBe(true);
    expect(
      shouldContinueCardOtpAfterSmsError({ response: { status: 500 } }),
    ).toBe(false);
  });
});
