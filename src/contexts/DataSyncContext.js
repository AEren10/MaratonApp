import { createContext, useContext } from "react";
import { useDataSync } from "../hooks/useDataSync";

const DataSyncContext = createContext({ syncing: false, refresh: async () => {} });

export function DataSyncProvider({ children }) {
  const value = useDataSync();
  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useSync() {
  return useContext(DataSyncContext);
}
