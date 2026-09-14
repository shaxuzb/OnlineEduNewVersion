import fs from "fs";
import path from "path";

const readScreen = (fileName: string) =>
  fs.readFileSync(path.join(__dirname, fileName), "utf8");

describe("mock quiz screen UI parity", () => {
  it("uses the same quiz screen visual building blocks as QuizScreen", () => {
    const mockScreen = readScreen("MockQuizScreen.tsx");

    expect(mockScreen).toContain("const HeaderRight = React.memo");
    expect(mockScreen).toContain("const TestModal = React.memo");
    expect(mockScreen).toContain("const createStyles = (theme: Theme) =>\n  ScaledSheet.create");
  });

  it("uses the same result, history, and solution UI building blocks as their source screens", () => {
    expect(readScreen("MockQuizResultsScreen.tsx")).toContain("const headerRightStyles = StyleSheet.create");
    expect(readScreen("MockQuizResultsHistoryScreen.tsx")).toContain("const BRAND_GRADIENT = [\"#3a5dde\", \"#5e84e6\"] as const");
    expect(readScreen("MockSolutionScreen.tsx")).toContain("useGestureViewerState");
  });
});
