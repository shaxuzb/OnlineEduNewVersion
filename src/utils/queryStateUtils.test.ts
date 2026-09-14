/// <reference types="jest" />

import {
  shouldShowBlockingQueryLoader,
  shouldShowQueryEmptyState,
} from "./queryStateUtils";

describe("query state presentation", () => {
  it("keeps the blocking loader visible until the first result arrives", () => {
    expect(
      shouldShowBlockingQueryLoader({
        isPending: true,
        isFetching: true,
        isFetched: false,
        hasData: false,
      }),
    ).toBe(true);
    expect(
      shouldShowBlockingQueryLoader({
        isPending: false,
        isFetching: true,
        isFetched: false,
        hasData: false,
      }),
    ).toBe(true);
  });

  it("does not replace existing result content with a refetch loader", () => {
    expect(
      shouldShowBlockingQueryLoader({
        isPending: false,
        isFetching: true,
        isFetched: true,
        hasData: true,
      }),
    ).toBe(false);
  });

  it("keeps the first response in loading state before query settlement", () => {
    expect(
      shouldShowBlockingQueryLoader({
        isPending: false,
        isFetching: false,
        isFetched: false,
        hasData: false,
      }),
    ).toBe(true);
  });

  it("shows empty state only after a completed request with no data", () => {
    expect(
      shouldShowQueryEmptyState({
        isFetched: false,
        isFetching: true,
        hasData: false,
      }),
    ).toBe(false);
    expect(
      shouldShowQueryEmptyState({
        isFetched: true,
        isFetching: false,
        hasData: false,
      }),
    ).toBe(true);
  });
});
