/// <reference types="jest" />

import { shouldContinueRegistrationAfterSmsError } from "./registrationSmsPolicy";

describe("registration sms recovery policy", () => {
  it("continues only when the sms was already sent", () => {
    expect(
      shouldContinueRegistrationAfterSmsError({ response: { status: 400 } }),
    ).toBe(true);
    expect(
      shouldContinueRegistrationAfterSmsError({ response: { status: 500 } }),
    ).toBe(false);
  });
});
