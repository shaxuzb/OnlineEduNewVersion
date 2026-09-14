/// <reference types="jest" />

import { getRecoverableCardSmsResponse } from "./cardSmsRecovery";

describe("card sms recovery", () => {
  it("returns a fallback response for an already-sent code", () => {
    expect(
      getRecoverableCardSmsResponse({ response: { status: 400, data: {} } }),
    ).toEqual({ phone: "" });
  });

  it("preserves a server-provided phone label when available", () => {
    expect(
      getRecoverableCardSmsResponse({
        response: { status: 400, data: { phone: "server-phone" } },
      }),
    ).toEqual({ phone: "server-phone" });
  });

  it("does not recover unrelated failures", () => {
    expect(
      getRecoverableCardSmsResponse({ response: { status: 500, data: {} } }),
    ).toBeNull();
  });
});
