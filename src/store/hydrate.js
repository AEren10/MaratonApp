import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { loadGoalsFromStorage } from "./slices/goalsSlice";

export function ReduxHydrator() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    loadGoalsFromStorage(dispatch).catch(() => {});
  }, [dispatch]);
  return null;
}
