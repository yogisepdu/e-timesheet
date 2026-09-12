import { useEffect, useState } from "react";

import {
  getNetworkStatus,
  subscribeToNetworkStatus,
  type NetworkStatus,
} from "@/services/offline/network";

const INITIAL_STATUS: NetworkStatus = {
  isConnected: false,
  isInternetReachable: null,
  type: null,
};

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(INITIAL_STATUS);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadInitialStatus() {
      try {
        const currentStatus = await getNetworkStatus();

        if (mounted) {
          setStatus(currentStatus);
        }
      } catch (error) {
        console.warn("Gagal membaca status jaringan:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialStatus();

    const unsubscribe = subscribeToNetworkStatus((networkStatus) => {
      if (mounted) {
        setStatus(networkStatus);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const isOnline =
    status.isConnected === true && status.isInternetReachable === true;

  return {
    ...status,
    isOnline,
    isOffline: !isOnline,
    isLoading,
  };
}
