/// <reference types="jest" />

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { API_URL: "https://edu-api.example.com" } },
}));

jest.mock("../services/AxiosService", () => ({
  getStoredAccessToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  cacheDirectory: "file:///cache/",
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

import React from "react";
import { Text } from "react-native";
import * as FileSystem from "expo-file-system";
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
const mockedDownload = FileSystem.downloadAsync as jest.Mock;
const mockedDelete = FileSystem.deleteAsync as jest.Mock;

const PDF_URL = "https://edu-api.example.com/api/mock-tests/7/pdf";

let state: ProtectedPdfSourceState;

const Probe = ({ path }: { path: string }) => {
  state = useProtectedPdfSource(path);
  return <Text>{state.status}</Text>;
};

const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

const renderProbe = async (path = "mock-tests/7/pdf") => {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<Probe path={path} />);
  });
  await flush();
  return renderer;
};

const respondWith = (status: number) =>
  mockedDownload.mockImplementationOnce((_uri: string, fileUri: string) =>
    Promise.resolve({ status, uri: fileUri }),
  );

describe("useProtectedPdfSource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDownload.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("downloads the document with the stored token", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("stored-token");
    respondWith(200);

    await renderProbe();

    expect(mockedDownload).toHaveBeenCalledTimes(1);
    expect(mockedDownload.mock.calls[0][0]).toBe(PDF_URL);
    expect(mockedDownload.mock.calls[0][2]).toEqual({
      headers: { Authorization: "Bearer stored-token" },
    });
    expect(state.source?.uri).toBe(mockedDownload.mock.calls[0][1]);
    expect(state.source?.uri).toMatch(/^file:\/\/\/cache\/protected-pdf-/);
    expect(state.status).toBe("loading");

    act(() => state.handleLoadComplete());
    expect(state.status).toBe("ready");
  });

  it("refreshes the token once and retries after a 401", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("expired-token");
    mockedRefreshAccessToken.mockResolvedValue("fresh-token");
    respondWith(401);
    respondWith(200);

    await renderProbe();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedDownload).toHaveBeenCalledTimes(2);
    expect(mockedDownload.mock.calls[1][2]).toEqual({
      headers: { Authorization: "Bearer fresh-token" },
    });
    // The rejected response body must not be left behind as a document.
    expect(mockedDelete).toHaveBeenCalledWith(mockedDownload.mock.calls[0][1], {
      idempotent: true,
    });
    expect(state.source?.uri).toBe(mockedDownload.mock.calls[1][1]);
    expect(state.status).toBe("loading");
  });

  it("stops after one refresh when the new token is rejected too", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("expired-token");
    mockedRefreshAccessToken.mockResolvedValue("fresh-token");
    respondWith(401);
    respondWith(401);

    await renderProbe();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mockedDownload).toHaveBeenCalledTimes(2);
    expect(state.status).toBe("error");
    expect(state.errorMessage).toBe("HTTP 401");
    expect(state.source).toBeNull();
  });

  it("reports the real status of a failed download without refreshing", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("stored-token");
    respondWith(404);

    await renderProbe();

    expect(mockedRefreshAccessToken).not.toHaveBeenCalled();
    expect(state.status).toBe("error");
    expect(state.errorMessage).toBe("HTTP 404");
  });

  it("surfaces a network failure and recovers on retry", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("stored-token");
    mockedDownload.mockRejectedValueOnce(new Error("Network request failed"));

    await renderProbe();

    expect(state.status).toBe("error");
    expect(state.errorMessage).toBe("Network request failed");
    expect(mockedRefreshAccessToken).not.toHaveBeenCalled();

    respondWith(200);
    await act(async () => {
      state.retry();
    });
    await flush();

    expect(state.source?.uri).toBe(mockedDownload.mock.calls[1][1]);
    expect(state.status).toBe("loading");
  });

  it("surfaces an error when no token is available", async () => {
    mockedGetStoredAccessToken.mockResolvedValue(null);

    await renderProbe();

    expect(mockedDownload).not.toHaveBeenCalled();
    expect(state.status).toBe("error");
    expect(state.source).toBeNull();
  });

  it("removes the downloaded file when the viewer goes away", async () => {
    mockedGetStoredAccessToken.mockResolvedValue("stored-token");
    respondWith(200);

    const renderer = await renderProbe();
    const fileUri = state.source?.uri;

    await act(async () => {
      renderer.unmount();
    });

    expect(mockedDelete).toHaveBeenCalledWith(fileUri, { idempotent: true });
  });
});
