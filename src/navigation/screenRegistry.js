import React from "react";

import { SCREENS } from "../constants/screens";
import {
  celebrationOptions,
  detailOptions,
  modalOptions,
  withScreenBoundary,
} from "./screenOptions";

import HomeScreen from "../screens/home/HomeScreen";
import DerslerScreen from "../screens/dersler/DerslerScreen";
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LeagueScreen from "../screens/league/LeagueScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import SetNewPasswordScreen from "../screens/auth/SetNewPasswordScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import ExamSetupScreen from "../screens/onboarding/ExamSetupScreen";
import GoalSetupScreen from "../screens/onboarding/GoalSetupScreen";
import LevelTestScreen from "../screens/onboarding/LevelTestScreen";
import RouteReadyScreen from "../screens/onboarding/RouteReadyScreen";
import NotificationPermissionScreen from "../screens/onboarding/NotificationPermissionScreen";
import SetupIncompleteScreen from "../screens/onboarding/SetupIncompleteScreen";
import WrongNotebookScreen from "../screens/wrong-notebook/WrongNotebookScreen";
import AddWrongScreen from "../screens/wrong-notebook/AddWrongScreen";
import WrongDetailScreen from "../screens/wrong-notebook/WrongDetailScreen";
import ReviewSessionScreen from "../screens/wrong-notebook/ReviewSessionScreen";
import ReviewDoneScreen from "../screens/wrong-notebook/ReviewDoneScreen";
import SwipeReviewScreen from "../screens/wrong-notebook/SwipeReviewScreen";
import AddStudyScreen from "../screens/study/AddStudyScreen";
import StudyTimerScreen from "../screens/study/StudyTimerScreen";
import StudySaveScreen from "../screens/study/StudySaveScreen";
import StudyLogScreen from "../screens/study/StudyLogScreen";
import StudySummaryScreen from "../screens/study/StudySummaryScreen";
import SummaryScreen from "../screens/study/SummaryScreen";
import StudyHistoryScreen from "../screens/study/StudyHistoryScreen";
import TrialEntryScreen from "../screens/trial/TrialEntryScreen";
import TrialSummaryScreen from "../screens/trial/TrialSummaryScreen";
import TrialDetailScreen from "../screens/trial/TrialDetailScreen";
import TrialCompareScreen from "../screens/trial/TrialCompareScreen";
import TrialInsightsScreen from "../screens/trial/TrialInsightsScreen";
import TrialRecordsScreen from "../screens/trial/TrialRecordsScreen";
import WeeklyTrialReviewScreen from "../screens/trial/WeeklyTrialReviewScreen";
import PlanDetailScreen from "../screens/plan/PlanDetailScreen";
import AddTaskScreen from "../screens/plan/AddTaskScreen";
import TopicCardsScreen from "../screens/topics/TopicCardsScreen";
import CardDetailScreen from "../screens/topics/CardDetailScreen";
import TopicStudyScreen from "../screens/dersler/TopicStudyScreen";
import SubjectDetailScreen from "../screens/analysis/SubjectDetailScreen";
import SubjectListScreen from "../screens/analysis/SubjectListScreen";
import WeakAreasScreen from "../screens/analysis/WeakAreasScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import GoalsScreen from "../screens/settings/GoalsScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import WeeklyReviewScreen from "../screens/home/WeeklyReviewScreen";

const AppearanceScreen = React.lazy(() => import("../screens/settings/AppearanceScreen"));
const EditProfileScreen = React.lazy(() => import("../screens/settings/EditProfileScreen"));
const ChangePasswordScreen = React.lazy(() => import("../screens/settings/ChangePasswordScreen"));
const EditEmailScreen = React.lazy(() => import("../screens/settings/EditEmailScreen"));
const NotificationsSettingsScreen = React.lazy(() => import("../screens/settings/NotificationsSettingsScreen"));
const PrivacyScreen = React.lazy(() => import("../screens/settings/PrivacyScreen"));
const TermsScreen = React.lazy(() => import("../screens/settings/TermsScreen"));
const AboutScreen = React.lazy(() => import("../screens/settings/AboutScreen"));
const FriendsScreen = React.lazy(() => import("../screens/social/FriendsScreen"));
const ChallengeScreen = React.lazy(() => import("../screens/social/ChallengeScreen"));
const ShareCardScreen = React.lazy(() => import("../screens/social/ShareCardScreen"));
const ReferralScreen = React.lazy(() => import("../screens/social/ReferralScreen"));
const RouteCompanionScreen = React.lazy(() => import("../screens/social/RouteCompanionScreen"));
const RankSimulatorScreen = React.lazy(() => import("../screens/simulator/RankSimulatorScreen"));
const NetForecastScreen = React.lazy(() => import("../screens/forecast/NetForecastScreen"));
const ComparativeScreen = React.lazy(() => import("../screens/analytics/ComparativeScreen"));
const RoadmapScreen = React.lazy(() => import("../screens/roadmap/RoadmapScreen"));
const QuickPracticeScreen = React.lazy(() => import("../screens/practice/QuickPracticeScreen"));
const ExamSimulatorScreen = React.lazy(() => import("../screens/simulator/ExamSimulatorScreen"));
const PaywallScreen = React.lazy(() => import("../screens/premium/PaywallScreen"));

const screen = (name, Comp, options) => ({ name, component: withScreenBoundary(Comp), options });

export const TAB_SCREENS = [
  screen(SCREENS.HOME, HomeScreen),
  screen(SCREENS.DAILY_PLAN, DerslerScreen),
  screen(SCREENS.ANALYSIS, AnalysisScreen),
  screen(SCREENS.PROFILE, ProfileScreen),
];

export const AUTH_STACK_SCREENS = [
  screen(SCREENS.LOGIN, LoginScreen),
  screen(SCREENS.REGISTER, RegisterScreen),
  screen(SCREENS.FORGOT_PASSWORD, ForgotPasswordScreen),
  screen(SCREENS.SET_NEW_PASSWORD, SetNewPasswordScreen),
  // Kayit ekranindaki "Kullanim Sartlari" / "Gizlilik Politikasi" linkleri.
  // Bu iki ekran PROFIL sekmesinde de kayitli ama orasi MainTabs'in icinde;
  // kullanici henuz giris yapmadigi icin MainTabs mount DEGIL ve oradan
  // navigate sessizce basarisiz olurdu.
  screen(SCREENS.TERMS, TermsScreen),
  screen(SCREENS.PRIVACY, PrivacyScreen),
];

// Şifre sıfırlama yığını: link bir oturum kurduğu için normal seçim
// AuthStack'i anında değiştirip formu unmount ediyordu (bkz. AppNavigator).
export const RECOVERY_STACK_SCREENS = [
  screen(SCREENS.SET_NEW_PASSWORD, SetNewPasswordScreen),
];

export const SLIDES_STACK_SCREENS = [
  screen(SCREENS.ONBOARDING, OnboardingScreen),
];

// Tasarim AKIS 12, dort adim: Karsilama -> Hedef Sec -> Seviye Testi -> Rota Hazir.
// Kurulum Yarim ve Bildirim Izni bu yiginda yan ekranlar.
export const SETUP_STACK_SCREENS = [
  screen(SCREENS.SETUP_INCOMPLETE, SetupIncompleteScreen),
  screen(SCREENS.EXAM_SETUP, ExamSetupScreen),
  screen(SCREENS.GOAL_SETUP, GoalSetupScreen),
  screen(SCREENS.LEVEL_TEST, LevelTestScreen),
  screen(SCREENS.ROUTE_READY, RouteReadyScreen),
  screen(SCREENS.NOTIFICATION_PERMISSION, NotificationPermissionScreen),
];

export const APP_STACK_SCREENS = [
  screen(SCREENS.WRONG_NOTEBOOK, WrongNotebookScreen),
  screen(SCREENS.ADD_WRONG, AddWrongScreen),
  screen(SCREENS.WRONG_DETAIL, WrongDetailScreen, detailOptions),
  screen(SCREENS.PLAN_DETAIL, PlanDetailScreen),
  screen(SCREENS.ADD_STUDY, AddStudyScreen),
  screen(SCREENS.STUDY_TIMER, StudyTimerScreen),
  screen(SCREENS.STUDY_SAVE, StudySaveScreen),
  screen(SCREENS.STUDY_HISTORY, StudyHistoryScreen),
  screen(SCREENS.TRIAL_ENTRY, TrialEntryScreen),
  screen(SCREENS.TRIAL_SUMMARY, TrialSummaryScreen, celebrationOptions),
  screen(SCREENS.TRIAL_DETAIL, TrialDetailScreen, detailOptions),
  screen(SCREENS.TRIAL_COMPARE, TrialCompareScreen, detailOptions),
  screen(SCREENS.TOPIC_CARDS, TopicCardsScreen),
  screen(SCREENS.CARD_DETAIL, CardDetailScreen, detailOptions),
  screen(SCREENS.SETTINGS, SettingsScreen),
  screen(SCREENS.ONBOARDING, OnboardingScreen),
  screen(SCREENS.EXAM_SETUP, ExamSetupScreen),
  screen(SCREENS.GOAL_SETUP, GoalSetupScreen),
  screen(SCREENS.STUDY_LOG, StudyLogScreen),
  screen(SCREENS.SUBJECT_DETAIL, SubjectDetailScreen, detailOptions),
  screen(SCREENS.SUBJECT_LIST, SubjectListScreen),
  screen(SCREENS.WEAK_AREAS, WeakAreasScreen),
  screen(SCREENS.TOPIC_STUDY, TopicStudyScreen, detailOptions),
  screen(SCREENS.APPEARANCE, AppearanceScreen),
  screen(SCREENS.EDIT_PROFILE, EditProfileScreen, modalOptions),
  screen(SCREENS.CHANGE_PASSWORD, ChangePasswordScreen, modalOptions),
  screen(SCREENS.EDIT_EMAIL, EditEmailScreen, modalOptions),
  screen(SCREENS.NOTIFICATIONS_SETTINGS, NotificationsSettingsScreen),
  screen(SCREENS.PRIVACY, PrivacyScreen),
  screen(SCREENS.TERMS, TermsScreen),
  screen(SCREENS.ABOUT, AboutScreen),
  screen(SCREENS.LEAGUE, LeagueScreen),
  screen(SCREENS.CALENDAR, CalendarScreen),
  screen(SCREENS.GOALS, GoalsScreen),
  screen(SCREENS.FRIENDS, FriendsScreen),
  screen(SCREENS.RANK_SIMULATOR, RankSimulatorScreen),
  screen(SCREENS.NET_FORECAST, NetForecastScreen),
  screen(SCREENS.COMPARATIVE, ComparativeScreen),
  screen(SCREENS.REVIEW_SESSION, ReviewSessionScreen),
  screen(SCREENS.REVIEW_DONE, ReviewDoneScreen, celebrationOptions),
  screen(SCREENS.ROADMAP, RoadmapScreen),
  screen(SCREENS.STUDY_SUMMARY, StudySummaryScreen, celebrationOptions),
  screen(SCREENS.SUMMARY, SummaryScreen),
  screen(SCREENS.TRIAL_INSIGHTS, TrialInsightsScreen, detailOptions),
  screen(SCREENS.TRIAL_RECORDS, TrialRecordsScreen),
  screen(SCREENS.WEEKLY_REVIEW, WeeklyReviewScreen, celebrationOptions),
  screen(SCREENS.WEEKLY_TRIAL_REVIEW, WeeklyTrialReviewScreen, celebrationOptions),
  screen(SCREENS.SWIPE_REVIEW, SwipeReviewScreen),
  screen(SCREENS.CHALLENGE, ChallengeScreen),
  screen(SCREENS.QUICK_PRACTICE, QuickPracticeScreen),
  screen(SCREENS.SHARE_CARD, ShareCardScreen),
  screen(SCREENS.REFERRAL, ReferralScreen),
  screen(SCREENS.ROUTE_COMPANION, RouteCompanionScreen),
  screen(SCREENS.EXAM_SIMULATOR, ExamSimulatorScreen),
  screen(SCREENS.ADD_TASK, AddTaskScreen, modalOptions),
  screen(SCREENS.PAYWALL, PaywallScreen, modalOptions),
];

// Sekme stack'leri ada gore ekran tanimi ariyor (bkz. tabAssignment.js).
const BY_NAME = new Map(APP_STACK_SCREENS.map((route) => [route.name, route]));

export function screensByName(names) {
  return names.map((name) => {
    const route = BY_NAME.get(name);
    if (!route) {
      throw new Error(
        `screensByName: "${name}" APP_STACK_SCREENS'te yok. ` +
        "tabAssignment.js ile screenRegistry.js arasinda kayma var.",
      );
    }
    return route;
  });
}
