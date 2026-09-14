export type QueryLoadingState = {
  isPending: boolean;
  isFetching: boolean;
  isFetched: boolean;
  hasData: boolean;
};

export type QueryEmptyState = {
  isFetched: boolean;
  isFetching: boolean;
  hasData: boolean;
};

export const shouldShowBlockingQueryLoader = ({
  isPending,
  isFetching,
  isFetched,
  hasData,
}: QueryLoadingState): boolean =>
  !hasData && (!isFetched || isPending || isFetching);

export const shouldShowQueryEmptyState = ({
  isFetched,
  isFetching,
  hasData,
}: QueryEmptyState): boolean => isFetched && !isFetching && !hasData;
