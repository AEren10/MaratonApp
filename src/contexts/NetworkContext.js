import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as Network from "expo-network";
import { flushQueue } from "../lib/offlineQueue";

const NetworkContext = createContext({ isConnected: true });

export function NetworkProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const prevConnected = useRef(true);

  useEffect(() => {
    // Initial check
    Network.getNetworkStateAsync()
      .then((state) => {
        const connected = state.isConnected && state.isInternetReachable !== false;
        setIsConnected(connected);
        prevConnected.current = connected;
      })
      .catch((e) => { if (__DEV__) console.warn("[NetworkContext] getNetworkState", e); });

    // Listen for changes
    const sub = Network.addNetworkStateListener((state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);

      // Was offline, now online => flush queue
      if (!prevConnected.current && connected) {
        flushQueue().catch((e) => { if (__DEV__) console.warn("[NetworkContext] flushQueue", e); });
      }
      prevConnected.current = connected;
    });

    return () => sub.remove();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
