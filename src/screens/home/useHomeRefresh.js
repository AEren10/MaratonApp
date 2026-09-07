import { useCallback, useState } from "react";

import * as H from "../../lib/haptics";

export function useHomeRefresh(refresh) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    H.tap();
    setRefreshing(true);
    try {
      await refresh();
    } catch {
      // Pull-to-refresh should recover silently; sync layer owns detailed errors.
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { onRefresh, refreshing };
}
