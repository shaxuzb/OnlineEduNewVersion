/// <reference types="jest" />

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { API_URL: "https://edu-api.example.com" } },
}));

jest.mock("../services/AxiosService", () => ({
  getStoredAccessToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

import React from "react";
import { Text } from "react-native";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import {
  getStoredAccessToken,
  refreshAccessToken,
} from "../services/AxiosService";
import useProtectedPdfSource, {
  ProtectedPdfSourceState,
} from "./useProtectedPdfSource";

const mockedGetStoredAccessToken = getStoredAccessToken as jest.Mock;
const mockedRefreshAccessToken = refreshAccessToken as jest.Mock;

let state: ProtectedPdfSourceState;

const Probe = ({ path }: { path: string }) => {
  state = useProtectedPdfSource(path);
  return <Text>{state.status}</Text>;
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const renderProbe = async (path = "mock-tests/7/pdf") => {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<Probe path={path} />);
  });
  await flush();
  return renderer;
};

describe("useProtectedPdfSource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("builds an authenticated source from the stored token", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("stored-token");

    await renderProbe();

    expect(state.source).toEqual({
      uri: "https://edu-api.example.com/api/mock-tests/7/pdf",
      headers: { Authorization: "Bearer stored-token" },
    });
    expect(state.status).toBe("loading");

    act(() => state.handleLoadComplete());
    expect(state.status).toBe("ready");
  });

  it("refreshes the token once and remounts the viewer after a 401", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("expired-token");
    mockedRefreshAccessToken.mockResolvedValue("fresh-token");

    await renderProbe();
    const firstKey = state.reloadKey;

    await act(async () => {
      state.handleError({ message: "Error: 401 Unauthorized" });
      await Promise.resolve();
    });
    await flush();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(state.source?.headers.Authorization).toBe("Bearer fresh-token");
    expect(state.reloadKey).toBeGreaterThan(firstKey);
    expect(state.status).toBe("loading");
  });

  it("stops retrying when the refreshed token is rejected too", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("expired-token");
    mockedRefreshAccessToken.mockResolvedValue("fresh-token");

    await renderProbe();

    await act(async () => {
      state.handleError({ status: 401 });
      await Promise.resolve();
    });
    await flush();

    await act(async () => {
      state.handleError({ status: 401 });
    });

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(state.status).toBe("error");
  });

  it("surfaces an error when no token is available", async () => {
    mockedGetStoredAccessToken.mockResolvedValue(null);

    await renderProbe();

    expect(state.status).toBe("error");
    expect(state.source).toBeNull();
  });

  it("forces a fresh token on manual retry", async () => {
    mockedGetStoredAccessToken.mockResolvedValue(null);
    mockedRefreshAccessToken.mockResolvedValue("retry-token");

    await renderProbe();

    await act(async () => {
      state.retry();
    });
    await flush();

    expect(state.source?.headers.Authorization).toBe("Bearer retry-token");
    expect(state.status).toBe("loading");
  });
});
