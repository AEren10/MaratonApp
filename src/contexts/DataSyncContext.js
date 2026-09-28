import { createContext, useContext } from "react";
import { useDataSync } from "../hooks/useDataSync";
import { useStreakReminderSync } from "../hooks/useStreakReminderSync";

const DataSyncContext = createContext({
  syncing: false,
  syncedOnce: false,
  refresh: async () => {},
  error: null,
});

export function DataSyncProvider({ children }) {
  const value = useDataSync();
  useStreakReminderSync();
  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useSync() {
  return useContext(DataSyncContext);
}
