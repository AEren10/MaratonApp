import { EVENTS } from "../../constants/analytics";
import { getRouteAnalyticsMeta } from "../routes";

export function createNavigationTracker(trackFn) {
  let currentRouteName = null;
  let currentRouteKey = null;
  let currentRouteMeta = null;
  let enteredAt = Date.now();
  let active = false;

  function view(route, source = "navigation") {
    if (!route?.name) return;
    currentRouteName = route.name;
    currentRouteKey = route.key || null;
    currentRouteMeta = getRouteAnalyticsMeta(currentRouteName);
    enteredAt = Date.now();
    active = true;
    trackFn(EVENTS.SCREEN_VIEW, {
      screen: currentRouteName,
      routeKey: currentRouteKey,
      source,
      ...currentRouteMeta,
    });
  }

  function exit(route, reason) {
    if (!currentRouteName || !active) return;
    const durationMs = Date.now() - enteredAt;
    const props = {
      screen: currentRouteName,
      routeKey: currentRouteKey,
      durationMs,
      durationSec: Math.round(durationMs / 1000),
      reason,
      nextScreen: route?.name || null,
      nextFlow: route?.name ? getRouteAnalyticsMeta(route.name).flow : null,
      ...currentRouteMeta,
    };
    trackFn(EVENTS.SCREEN_EXIT, props);
    trackFn(EVENTS.SCREEN_DURATION, props);
    active = false;
  }

  return {
    ready(route) {
      view(route);
    },
    change(route) {
      if (!route?.name) return;
      if (route.name === currentRouteName && (route.key || null) === currentRouteKey) return;
      exit(route, "navigation");
      view(route);
    },
    pause(route, reason = "background") {
      exit(route, reason);
    },
    resume(route) {
      if (!route?.name || active) return;
      view(route, "resume");
    },
  };
}
