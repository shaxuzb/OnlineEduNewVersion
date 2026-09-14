/// <reference types="jest" />

import { $axiosBase, $axiosPrivate } from "./AxiosService";
import { purchaseService } from "./purchaseService";

jest.mock("./AxiosService", () => ({
  $axiosBase: { post: jest.fn() },
  $axiosPrivate: { get: jest.fn(), post: jest.fn() },
}));

const baseApi = $axiosBase as unknown as { post: jest.Mock };
const privateApi = $axiosPrivate as unknown as {
  get: jest.Mock;
  post: jest.Mock;
};

describe("purchase service authenticated endpoints", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates purchase orders with the private client", async () => {
    privateApi.post.mockResolvedValueOnce({ data: { id: 7 } });

    await purchaseService.createOrder({
      scopeIds: 1,
      planId: 2,
      paymentType: "card",
    });

    expect(privateApi.post).toHaveBeenCalledWith("purchase-orders", {
      scopeIds: 1,
      planId: 2,
      paymentType: "card",
    });
  });

  it("resends card SMS with the private client", async () => {
    privateApi.post.mockResolvedValueOnce({ data: undefined });

    await purchaseService.resendCardSms(7);

    expect(privateApi.post).toHaveBeenCalledWith(
      "transactions/subscribe/card/send-sms",
      { orderId: 7 },
    );
    expect(baseApi.post).not.toHaveBeenCalled();
  });

  it("verifies card payment with the private client", async () => {
    privateApi.post.mockResolvedValueOnce({ data: undefined });

    await purchaseService.verifyCardPayment(7, "123456");

    expect(privateApi.post).toHaveBeenCalledWith(
      "transactions/subscribe/card/pay",
      { orderId: 7, code: "123456" },
    );
  });
});
