/// <reference types="jest" />

import { $axiosBase, $axiosPrivate } from "./AxiosService";
import { registrationService } from "./registrationService";

jest.mock("react-native-device-info", () => ({
  getUniqueId: jest.fn().mockResolvedValue("device-id"),
}));

jest.mock("./AxiosService", () => ({
  $axiosBase: { post: jest.fn() },
  $axiosPrivate: { post: jest.fn() },
}));

const baseApi = $axiosBase as unknown as { post: jest.Mock };
const privateApi = $axiosPrivate as unknown as { post: jest.Mock };

describe("registration service public bootstrap endpoints", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends the initial registration SMS with the public client", async () => {
    await registrationService.sendSms("test-phone");

    expect(baseApi.post).toHaveBeenCalledWith("sms/send", {
      phone: "test-phone",
    });
    expect(privateApi.post).not.toHaveBeenCalled();
  });

  it("keeps SMS verification and resend public", async () => {
    await registrationService.verifySms("test-phone", "123456");
    await registrationService.resendSms("test-phone");

    expect(baseApi.post).toHaveBeenCalledWith("/sms/verify", {
      phone: "test-phone",
      code: "123456",
    });
    expect(baseApi.post).toHaveBeenCalledWith("sms/send", {
      phone: "test-phone",
    });
  });
});
