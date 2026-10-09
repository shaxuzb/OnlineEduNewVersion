/// <reference types="jest" />

import fs from "fs";
import path from "path";

const SRC_ROOT = path.join(__dirname, "..");

const collectSourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) {
      return [];
    }
    return [fullPath];
  });

const stripComments = (source: string) =>
  source.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\/.*$/gm, "");

describe("system bars policy", () => {
  // On Android 11+ React Native answers "show the status bar" with
  // `setDecorFitsSystemWindows(true)`. In this edge-to-edge app that pushes the
  // content below a black status bar and breaks every header until restart.
  // A <StatusBar> does that when it first mounts and whenever it stops hiding
  // the bar, so Android code must use SystemBars from react-native-edge-to-edge.
  it("does not render React Native's StatusBar outside iOS-only files", () => {
    const offenders = collectSourceFiles(SRC_ROOT)
      .filter((file) => !/\.ios\.tsx?$/.test(file))
      .filter((file) =>
        /<StatusBar[\s/>]/.test(stripComments(fs.readFileSync(file, "utf8"))),
      )
      .map((file) => path.relative(SRC_ROOT, file));

    expect(offenders).toEqual([]);
  });
});
