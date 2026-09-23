/// <reference types="jest" />

import { readFileSync } from "fs";
import { join } from "path";

const viewerSource = readFileSync(
  join(__dirname, "ProtectedPdfViewer.tsx"),
  "utf8",
);

describe("protected pdf request", () => {
  it("sends an uppercase HTTP verb", () => {
    // react-native-pdf forwards `method` verbatim to the native HTTP client.
    // nginx answers a lowercase verb with 400 Bad Request, so every document
    // failed to download before the request ever reached the API.
    expect(viewerSource).toContain('method: "GET"');
    expect(viewerSource).not.toContain('method: "get"');
  });
});
