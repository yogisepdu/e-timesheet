import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoState["type"] | null;
};

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const state = await NetInfo.fetch();

  return normalizeNetworkState(state);
}

export function subscribeToNetworkStatus(
  callback: (status: NetworkStatus) => void,
) {
  return NetInfo.addEventListener((state) => {
    callback(normalizeNetworkState(state));
  });
}

function normalizeNetworkState(state: NetInfoState): NetworkStatus {
  return {
    isConnected: state.isConnected === true,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
  };
}

export function isNetworkOnline(status: NetworkStatus): boolean {
  return status.isConnected === true && status.isInternetReachable === true;
}
