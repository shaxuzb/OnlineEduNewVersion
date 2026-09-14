/// <reference types="jest" />

import { invalidateAfterSuccessfulPayment } from "./paymentCache";

describe("payment cache invalidation", () => {
  it("invalidates only payment-related query groups and never clears the cache", async () => {
    const queryClient = {
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn(),
    };

    await invalidateAfterSuccessfulPayment(queryClient as any);

    expect(queryClient.clear).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["purchases"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["orders"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["current-plan"],
    });
  });
});
