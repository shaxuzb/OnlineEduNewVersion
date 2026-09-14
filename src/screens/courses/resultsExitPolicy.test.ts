import fs from "fs";
import path from "path";

const readScreen = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

const resultScreens = [
  "QuizResultsScreen.tsx",
  "MockQuizResultsScreen.tsx",
  "sertificatetests/QuizResultsScreenSertificate.tsx",
];

describe("result screen exit policy", () => {
  it.each(resultScreens)(
    "%s hides the header back button and disables the back gesture",
    (screenPath) => {
      const screen = readScreen(screenPath);

      expect(screen).toContain("headerBackVisible: false");
      expect(screen).toContain("gestureEnabled: false");
    },
  );
});
