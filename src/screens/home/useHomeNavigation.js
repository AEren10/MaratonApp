import { useCallback, useRef } from "react";

import { trackButtonTap } from "../../lib/analytics";

export function useHomeNavigation(navigation) {
  const navRef = useRef(navigation);
  const goCache = useRef({});

  if (navRef.current !== navigation) {
    navRef.current = navigation;
    goCache.current = {};
  }

  return useCallback((route, params) => {
    const cacheKey = params ? `${route}:${JSON.stringify(params)}` : route;
    if (!goCache.current[cacheKey]) {
      goCache.current[cacheKey] = () => {
        trackButtonTap(`home_nav_${route}`, { targetScreen: route });
        navRef.current.navigate(route, params);
      };
    }
    return goCache.current[cacheKey];
  }, []);
}
