import { buildMainTabsResetAction } from "./rootNavigationActions";

describe("buildMainTabsResetAction", () => {
  it("resets the root stack to MainTabs", () => {
    const action = buildMainTabsResetAction();

    expect(action.payload).toMatchObject({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  });
});
