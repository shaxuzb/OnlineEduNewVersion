export interface NetworkSnapshot {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

export const isNetworkUsable = ({
  isConnected,
  isInternetReachable,
}: NetworkSnapshot): boolean =>
  isConnected !== false && isInternetReachable !== false;
