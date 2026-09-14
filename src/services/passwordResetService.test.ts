/// <reference types="jest" />

import { $axiosBase, $axiosPrivate } from "./AxiosService";
import { passwordResetService } from "./passwordResetService";

jest.mock("./AxiosService", () => ({
  $axiosBase: { post: jest.fn() },
  $axiosPrivate: { post: jest.fn() },
}));

const baseApi = $axiosBase as unknown as { post: jest.Mock };
const privateApi = $axiosPrivate as unknown as { post: jest.Mock };

describe("password reset public bootstrap endpoints", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requests a reset code with the public client", async () => {
    await passwordResetService.request("test-phone");

    expect(baseApi.post).toHaveBeenCalledWith(
      "account/password-reset/request",
      { phone: "test-phone" },
    );
    expect(privateApi.post).not.toHaveBeenCalled();
  });

  it("keeps the compatibility resend method public", async () => {
    await passwordResetService.requestPublic("test-phone");

    expect(baseApi.post).toHaveBeenCalledWith(
      "account/password-reset/request",
      { phone: "test-phone" },
    );
  });
});
