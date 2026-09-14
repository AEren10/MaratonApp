import React from "react";

import { SCREENS } from "../constants/screens";
import {
  celebrationOptions,
  detailOptions,
  modalOptions,
  overlayOptions,
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
import AddStudyScreen from "../screens/study/AddStudyScreen";
import StudyTimerScreen from "../screens/study/StudyTimerScreen";
import StudySaveScreen from "../screens/study/StudySaveScreen";
import StudySummaryScreen from "../screens/study/StudySummaryScreen";
import SummaryScreen from "../screens/study/SummaryScreen";
import StudyHistoryScreen from "../screens/study/StudyHistoryScreen";
import EditStudyLogScreen from "../screens/study/EditStudyLogScreen";
import TrialEntryScreen from "../screens/trial/TrialEntryScreen";
import TrialSummaryScreen from "../screens/trial/TrialSummaryScreen";
import TrialDetailScreen from "../screens/trial/TrialDetailScreen";
import TrialCompareScreen from "../screens/trial/TrialCompareScreen";
import TrialInsightsScreen from "../screens/trial/TrialInsightsScreen";
import TrialRecordsScreen from "../screens/trial/TrialRecordsScreen";
import TopicDebtScreen from "../screens/plan/TopicDebtScreen";
import PlanVsActualScreen from "../screens/plan/PlanVsActualScreen";
import GapClosureScreen from "../screens/plan/GapClosureScreen";
import CurriculumMapScreen from "../screens/roadmap/CurriculumMapScreen";
import WeekProgramScreen from "../screens/program/WeekProgramScreen";
import ClassScheduleScreen from "../screens/program/ClassScheduleScreen";
import MonthPlanScreen from "../screens/program/MonthPlanScreen";
import SearchScreen from "../screens/search/SearchScreen";
import DocumentScreen from "../screens/settings/DocumentScreen";
import HowItWorksScreen from "../screens/settings/HowItWorksScreen";
import ExamDateScreen from "../screens/settings/ExamDateScreen";
import SubscriptionScreen from "../screens/premium/SubscriptionScreen";
import CancelSubscriptionScreen from "../screens/premium/CancelSubscriptionScreen";
import LevelScreen from "../screens/profile/LevelScreen";
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
const MilestoneScreen = React.lazy(() => import("../screens/profile/MilestoneScreen"));
const ReferralScreen = React.lazy(() => import("../screens/social/ReferralScreen"));
const RouteCompanionScreen = React.lazy(() => import("../screens/social/RouteCompanionScreen"));
const RankSimulatorScreen = React.lazy(() => import("../screens/simulator/RankSimulatorScreen"));
const NetForecastScreen = React.lazy(() => import("../screens/forecast/NetForecastScreen"));
const ComparativeScreen = React.lazy(() => import("../screens/analytics/ComparativeScreen"));
const RoadmapScreen = React.lazy(() => import("../screens/roadmap/RoadmapScreen"));
const RouteFullScreen = React.lazy(() => import("../screens/roadmap/RouteFullScreen"));
const RouteStopDetailScreen = React.lazy(() => import("../screens/roadmap/RouteStopDetailScreen"));
const RoutePauseScreen = React.lazy(() => import("../screens/roadmap/RoutePauseScreen"));
const RouteRedrawScreen = React.lazy(() => import("../screens/roadmap/RouteRedrawScreen"));
const ExamSimulatorScreen = React.lazy(() => import("../screens/simulator/ExamSimulatorScreen"));
const ExamDayPlanScreen = React.lazy(() => import("../screens/exam/ExamDayPlanScreen"));
const ExamResultScreen = React.lazy(() => import("../screens/exam/ExamResultScreen"));
const ForecastAccuracyScreen = React.lazy(() => import("../screens/exam/ForecastAccuracyScreen"));
const PaywallScreen = React.lazy(() => import("../screens/premium/PaywallScreen"));
const PremiumScreen = React.lazy(() => import("../screens/premium/PremiumScreen"));
const ProPreviewScreen = React.lazy(() => import("../screens/premium/ProPreviewScreen"));
const AccessEndedScreen = React.lazy(() => import("../screens/premium/AccessEndedScreen"));
const DataExportScreen = React.lazy(() => import("../screens/settings/DataExportScreen"));
const AccountDeleteScreen = React.lazy(() => import("../screens/settings/AccountDeleteScreen"));
const OfflineQueueScreen = React.lazy(() => import("../screens/settings/OfflineQueueScreen"));

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
  screen(SCREENS.EDIT_STUDY_LOG, EditStudyLogScreen),
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
  // Eski StudyLog rotasi (Ayarlar satiri, calisma/gecmis deep linki) birlesik ekrana bagli.
  screen(SCREENS.STUDY_LOG, StudyHistoryScreen),
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
  screen(SCREENS.ROUTE_FULL, RouteFullScreen),
  screen(SCREENS.ROUTE_STOP_DETAIL, RouteStopDetailScreen),
  screen(SCREENS.ROUTE_PAUSE, RoutePauseScreen, modalOptions),
  screen(SCREENS.ROUTE_REDRAW, RouteRedrawScreen, modalOptions),
  screen(SCREENS.STUDY_SUMMARY, StudySummaryScreen, celebrationOptions),
  screen(SCREENS.SUMMARY, SummaryScreen),
  screen(SCREENS.TRIAL_INSIGHTS, TrialInsightsScreen, detailOptions),
  screen(SCREENS.TRIAL_RECORDS, TrialRecordsScreen),
  screen(SCREENS.TOPIC_DEBT, TopicDebtScreen),
  screen(SCREENS.PLAN_VS_ACTUAL, PlanVsActualScreen),
  screen(SCREENS.GAP_CLOSURE, GapClosureScreen),
  screen(SCREENS.CURRICULUM_MAP, CurriculumMapScreen),
  screen(SCREENS.WEEK_PROGRAM, WeekProgramScreen),
  screen(SCREENS.CLASS_SCHEDULE, ClassScheduleScreen),
  screen(SCREENS.MONTH_PLAN, MonthPlanScreen),
  screen(SCREENS.SEARCH, SearchScreen),
  screen(SCREENS.DOCUMENT, DocumentScreen),
  screen(SCREENS.HOW_IT_WORKS, HowItWorksScreen),
  screen(SCREENS.EXAM_DATE, ExamDateScreen, modalOptions),
  screen(SCREENS.WEEKLY_REVIEW, SummaryScreen), // eski rota -> Haftalik Ozet
  screen(SCREENS.WEEKLY_TRIAL_REVIEW, SummaryScreen), // eski rota -> Haftalik Ozet
  // Kart Tekrari ve Hizli Pratik "Tekrar" tasarimina katlandi; eski rota
  // adlari derin baglanti/eski girisler icin ayni ekrana baglaniyor.
  screen(SCREENS.SWIPE_REVIEW, ReviewSessionScreen),
  screen(SCREENS.CHALLENGE, ChallengeScreen),
  screen(SCREENS.QUICK_PRACTICE, ReviewSessionScreen),
  screen(SCREENS.SHARE_CARD, ShareCardScreen),
  screen(SCREENS.MILESTONE, MilestoneScreen),
  screen(SCREENS.LEVEL, LevelScreen),
  screen(SCREENS.REFERRAL, ReferralScreen),
  screen(SCREENS.ROUTE_COMPANION, RouteCompanionScreen),
  screen(SCREENS.EXAM_SIMULATOR, ExamSimulatorScreen),
  screen(SCREENS.EXAM_DAY_PLAN, ExamDayPlanScreen),
  screen(SCREENS.EXAM_RESULT, ExamResultScreen),
  screen(SCREENS.FORECAST_ACCURACY, ForecastAccuracyScreen),
  screen(SCREENS.ADD_TASK, AddTaskScreen, modalOptions),
  // Baglam paywall'i isin ustunde alt sayfa; "Paywall Anı" kendi zeminini boyar.
  screen(SCREENS.PAYWALL, PaywallScreen, overlayOptions),
  screen(SCREENS.SUBSCRIPTION, SubscriptionScreen),
  screen(SCREENS.SUBSCRIPTION_CANCEL, CancelSubscriptionScreen, modalOptions),
  screen(SCREENS.PREMIUM, PremiumScreen, modalOptions),
  screen(SCREENS.PRO_PREVIEW, ProPreviewScreen, overlayOptions),
  screen(SCREENS.ACCESS_ENDED, AccessEndedScreen, modalOptions),
  screen(SCREENS.DATA_EXPORT, DataExportScreen),
  screen(SCREENS.ACCOUNT_DELETE, AccountDeleteScreen, modalOptions),
  screen(SCREENS.OFFLINE_QUEUE, OfflineQueueScreen),
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
