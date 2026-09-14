/// <reference types="jest" />

import { getMockTestCardMeta } from "./mockTestCardUtils";

describe("mock test card metadata", () => {
  it("exposes only the title and premium-access state required by the compact card", () => {
    expect(
      getMockTestCardMeta({
        id: -1,
        name: "Mock Test (1-2 bob)",
        ordinalNumber: 2,
        subjectId: 1,
        subject: "Algebra",
        subjectCode: "ALGEBRA",
        subjectType: "COMMON",
        stateId: 1,
        state: "Актив",
        themes: [],
        itemType: "MOCK_TEST",
        isMockTest: true,
        mockTestId: 1,
        mockTestName: "Algebra mock",
        mockTestQuestionCount: 10,
        hasMockTestPdf: true,
        hasMockTestAnswerPdf: false,
        hasAccess: true,
        themeUnitPrice: 0,
        themesCount: 0,
        paidThemesCount: 0,
        price: 0,
        percent: 0,
      }),
    ).toEqual({
      title: "Algebra mock",
      hasAccess: true,
    });
  });
});
