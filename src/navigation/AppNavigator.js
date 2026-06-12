import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, Platform } from "react-native";

import { SCREENS } from "../constants/screens";
import { C } from "../themes/tokens";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { ScreenErrorBoundary } from "../components/common/ScreenErrorBoundary";

import { TabBar } from "./TabBar";
import { DataSyncProvider } from "../contexts/DataSyncContext";
import { linkingConfig } from "./linking";

import HomeScreen from "../screens/home/HomeScreen";
import WrongNotebookScreen from "../screens/wrong-notebook/WrongNotebookScreen";
import AddWrongScreen from "../screens/wrong-notebook/AddWrongScreen";
import WrongDetailScreen from "../screens/wrong-notebook/WrongDetailScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import DerslerScreen from "../screens/dersler/DerslerScreen";
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import AddStudyScreen from "../screens/study/AddStudyScreen";
import StudyTimerScreen from "../screens/study/StudyTimerScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import TrialEntryScreen from "../screens/trial/TrialEntryScreen";
import TrialDetailScreen from "../screens/trial/TrialDetailScreen";
import TrialCompareScreen from "../screens/trial/TrialCompareScreen";
import PlanDetailScreen from "../screens/plan/PlanDetailScreen";
import TopicCardsScreen from "../screens/topics/TopicCardsScreen";
import CardDetailScreen from "../screens/topics/CardDetailScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import ExamSetupScreen from "../screens/onboarding/ExamSetupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import StudyLogScreen from "../screens/study/StudyLogScreen";
import SubjectDetailScreen from "../screens/analysis/SubjectDetailScreen";
import WeakAreasScreen from "../screens/analysis/WeakAreasScreen";
import TopicStudyScreen from "../screens/dersler/TopicStudyScreen";
import AppearanceScreen from "../screens/settings/AppearanceScreen";
import NotificationsSettingsScreen from "../screens/settings/NotificationsSettingsScreen";
import PrivacyScreen from "../screens/settings/PrivacyScreen";
import AboutScreen from "../screens/settings/AboutScreen";
import LeagueScreen from "../screens/league/LeagueScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import GoalsScreen from "../screens/settings/GoalsScreen";
import FriendsScreen from "../screens/social/FriendsScreen";
import RankSimulatorScreen from "../screens/simulator/RankSimulatorScreen";
import ReviewSessionScreen from "../screens/wrong-notebook/ReviewSessionScreen";
import RoadmapScreen from "../screens/roadmap/RoadmapScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function withEB(Comp) {
  const Wrapped = (props) => (
    <ScreenErrorBoundary>
      <Comp {...props} />
    </ScreenErrorBoundary>
  );
  Wrapped.displayName = `EB(${Comp.displayName || Comp.name || "Screen"})`;
  return Wrapped;
}

function AddStub() { return null; }

const EBHome = withEB(HomeScreen);
const EBDersler = withEB(DerslerScreen);
const EBAnalysis = withEB(AnalysisScreen);
const EBProfile = withEB(ProfileScreen);
const EBWrongNotebook = withEB(WrongNotebookScreen);
const EBAddWrong = withEB(AddWrongScreen);
const EBWrongDetail = withEB(WrongDetailScreen);
const EBPlanDetail = withEB(PlanDetailScreen);
const EBAddStudy = withEB(AddStudyScreen);
const EBStudyTimer = withEB(StudyTimerScreen);
const EBTrialEntry = withEB(TrialEntryScreen);
const EBTrialDetail = withEB(TrialDetailScreen);
const EBTrialCompare = withEB(TrialCompareScreen);
const EBTopicCards = withEB(TopicCardsScreen);
const EBCardDetail = withEB(CardDetailScreen);
const EBSettings = withEB(SettingsScreen);
const EBOnboarding = withEB(OnboardingScreen);
const EBExamSetup = withEB(ExamSetupScreen);
const EBStudyLog = withEB(StudyLogScreen);
const EBSubjectDetail = withEB(SubjectDetailScreen);
const EBWeakAreas = withEB(WeakAreasScreen);
const EBTopicStudy = withEB(TopicStudyScreen);
const EBAppearance = withEB(AppearanceScreen);
const EBNotificationsSettings = withEB(NotificationsSettingsScreen);
const EBPrivacy = withEB(PrivacyScreen);
const EBAbout = withEB(AboutScreen);
const EBLeague = withEB(LeagueScreen);
const EBCalendar = withEB(CalendarScreen);
const EBGoals = withEB(GoalsScreen);
const EBFriends = withEB(FriendsScreen);
const EBRankSimulator = withEB(RankSimulatorScreen);
const EBReviewSession = withEB(ReviewSessionScreen);
const EBRoadmap = withEB(RoadmapScreen);

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: C.bg },
  animation: Platform.OS === "web" ? "none" : "slide_from_right",
  animationDuration: 240,
  // Geri çıkış: ekranın her yerinden sağa kaydır (sadece kenar değil).
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

const modalOptions = {
  animation: Platform.OS === "web" ? "none" : "slide_from_bottom",
  presentation: "modal",
  animationDuration: 280,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name={SCREENS.HOME} component={EBHome} />
      <Tab.Screen name={SCREENS.DAILY_PLAN} component={EBDersler} />
      <Tab.Screen name="Add" component={AddStub} />
      <Tab.Screen name={SCREENS.ANALYSIS} component={EBAnalysis} />
      <Tab.Screen name={SCREENS.PROFILE} component={EBProfile} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREENS.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={SCREENS.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name={SCREENS.ONBOARDING} component={EBOnboarding} />
      <Stack.Screen name={SCREENS.EXAM_SETUP} component={EBExamSetup} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

function AppStackInner() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name={SCREENS.WRONG_NOTEBOOK} component={EBWrongNotebook} />
      <Stack.Screen name={SCREENS.ADD_WRONG} component={EBAddWrong} />
      <Stack.Screen name={SCREENS.WRONG_DETAIL} component={EBWrongDetail} />
      <Stack.Screen name={SCREENS.PLAN_DETAIL} component={EBPlanDetail} />
      <Stack.Screen name={SCREENS.ADD_STUDY} component={EBAddStudy} />
      <Stack.Screen name={SCREENS.STUDY_TIMER} component={EBStudyTimer} />
      <Stack.Screen name={SCREENS.TRIAL_ENTRY} component={EBTrialEntry} />
      <Stack.Screen name={SCREENS.TRIAL_DETAIL} component={EBTrialDetail} />
      <Stack.Screen name={SCREENS.TRIAL_COMPARE} component={EBTrialCompare} />
      <Stack.Screen name={SCREENS.TOPIC_CARDS} component={EBTopicCards} />
      <Stack.Screen name={SCREENS.CARD_DETAIL} component={EBCardDetail} />
      <Stack.Screen name={SCREENS.SETTINGS} component={EBSettings} />
      <Stack.Screen name={SCREENS.ONBOARDING} component={EBOnboarding} />
      <Stack.Screen name={SCREENS.EXAM_SETUP} component={EBExamSetup} />
      <Stack.Screen name={SCREENS.STUDY_LOG} component={EBStudyLog} />
      <Stack.Screen name={SCREENS.SUBJECT_DETAIL} component={EBSubjectDetail} />
      <Stack.Screen name={SCREENS.WEAK_AREAS} component={EBWeakAreas} />
      <Stack.Screen name={SCREENS.TOPIC_STUDY} component={EBTopicStudy} />
      <Stack.Screen name={SCREENS.APPEARANCE} component={EBAppearance} />
      <Stack.Screen name={SCREENS.NOTIFICATIONS_SETTINGS} component={EBNotificationsSettings} />
      <Stack.Screen name={SCREENS.PRIVACY} component={EBPrivacy} />
      <Stack.Screen name={SCREENS.ABOUT} component={EBAbout} />
      <Stack.Screen name={SCREENS.LEAGUE} component={EBLeague} />
      <Stack.Screen name={SCREENS.CALENDAR} component={EBCalendar} />
      <Stack.Screen name={SCREENS.GOALS} component={EBGoals} />
      <Stack.Screen name={SCREENS.FRIENDS} component={EBFriends} />
      <Stack.Screen name={SCREENS.RANK_SIMULATOR} component={EBRankSimulator} />
      <Stack.Screen name={SCREENS.REVIEW_SESSION} component={EBReviewSession} />
      <Stack.Screen name={SCREENS.ROADMAP} component={EBRoadmap} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <DataSyncProvider>
      <AppStackInner />
    </DataSyncProvider>
  );
}

function Loading() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.amber} size="large" />
    </View>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();
  const { onboardingDone, loading: examLoading } = useExam();

  if (loading || examLoading) return <Loading />;

  let content;
  if (!session) {
    content = <AuthStack />;
  } else if (!onboardingDone) {
    content = <OnboardingStack />;
  } else {
    content = <AppStack />;
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      {content}
    </NavigationContainer>
  );
}
