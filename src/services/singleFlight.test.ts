/// <reference types="jest" />

import { createSingleFlight } from "./singleFlight";

describe("single flight", () => {
  it("shares one in-flight promise for the same key", async () => {
    let resolveRequest: ((value: string) => void) | undefined;
    const request = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const run = createSingleFlight<string>();

    const first = run("payment:7", request);
    const second = run("payment:7", request);

    expect(request).toHaveBeenCalledTimes(1);
    resolveRequest?.("ok");
    await expect(Promise.all([first, second])).resolves.toEqual(["ok", "ok"]);
  });

  it("allows a new request after the previous one settles", async () => {
    const request = jest.fn().mockResolvedValue("ok");
    const run = createSingleFlight<string>();

    await run("payment:7", request);
    await run("payment:7", request);

    expect(request).toHaveBeenCalledTimes(2);
  });
});
