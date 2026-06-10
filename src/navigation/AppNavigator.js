import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SCREENS } from "../constants/screens";
import { COLORS } from "../themes/tokens";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const defaultScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.dark.background },
  animation: "slide_from_right",
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.dark.surface,
          borderTopColor: COLORS.dark.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.dark.accent,
        tabBarInactiveTintColor: COLORS.dark.textMuted,
      }}
    >
      <Tab.Screen name={SCREENS.HOME} component={PlaceholderScreen} />
      <Tab.Screen name={SCREENS.DAILY_PLAN} component={PlaceholderScreen} />
      <Tab.Screen name={SCREENS.STUDY_LOG} component={PlaceholderScreen} />
      <Tab.Screen name={SCREENS.ANALYSIS} component={PlaceholderScreen} />
      <Tab.Screen name={SCREENS.PROFILE} component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

function PlaceholderScreen() {
  return null;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={defaultScreenOptions}>
        {/* Auth */}
        <Stack.Screen name={SCREENS.LOGIN} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.REGISTER} component={PlaceholderScreen} />

        {/* Onboarding */}
        <Stack.Screen name={SCREENS.ONBOARDING} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.EXAM_SETUP} component={PlaceholderScreen} />

        {/* Main App */}
        <Stack.Screen name="MainTabs" component={HomeTabs} />

        {/* Nested Screens */}
        <Stack.Screen name={SCREENS.PLAN_DETAIL} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.ADD_STUDY} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.STUDY_TIMER} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.TRIAL_ENTRY} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.TRIAL_DETAIL} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.TRIAL_COMPARE} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.WRONG_NOTEBOOK} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.ADD_WRONG} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.TOPIC_CARDS} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.CARD_DETAIL} component={PlaceholderScreen} />
        <Stack.Screen name={SCREENS.SETTINGS} component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
