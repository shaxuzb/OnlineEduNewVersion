import fs from "fs";
import path from "path";

const screenPath = path.join(__dirname, "QuizScreen.tsx");

describe("quiz premium badge", () => {
  it("renders a larger crown outside the clipped gradient card", () => {
    const screen = fs.readFileSync(screenPath, "utf8");

    expect(screen).toContain("styles.pdfToggleWrapper");
    expect(screen).toContain("styles.crownBadge");
    expect(screen).toContain("size={moderateScale(24)}");
  });
});
