import { EVENTS } from "../../constants/analytics";
import { getRouteAnalyticsMeta } from "../routes";

function categorizeDuration(ms) {
  if (ms < 1500) return "instant";
  if (ms < 4000) return "quick";
  if (ms < 15000) return "brief";
  if (ms < 45000) return "medium";
  if (ms < 180000) return "long";
  return "deep";
}

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
    const durationMs = Math.max(0, Date.now() - enteredAt);
    const durationSec = Math.round(durationMs / 1000);
    const isNavigation = reason === "navigation";
    const nextScreen = isNavigation ? (route?.name || null) : null;
    const isBounce = durationMs < 2500;
    const props = {
      screen: currentRouteName,
      routeKey: currentRouteKey,
      durationMs,
      durationSec,
      isBounce,
      stayCategory: categorizeDuration(durationMs),
      reason,
      nextScreen,
      nextFlow: nextScreen ? getRouteAnalyticsMeta(nextScreen).flow : null,
      ...currentRouteMeta,
    };
    trackFn(EVENTS.SCREEN_EXIT, props);
    trackFn(EVENTS.SCREEN_DURATION, props);
    active = false;
  }

  return {
    ready(route) {
      if (route?.name) {
        view(route);
      }
    },
    change(route) {
      if (!route?.name) return;
      if (route.name === currentRouteName && (route.key || null) === currentRouteKey) return;
      if (active) {
        exit(route, "navigation");
      }
      view(route);
    },
    pause(route, reason = "background") {
      exit(null, reason);
    },
    resume(route) {
      if (!route?.name || active) return;
      view(route, "resume");
    },
  };
}
