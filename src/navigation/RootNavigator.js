import {
  NavigationContainer,
  createNavigationContainerRef,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { View } from "react-native";

import { COLORS } from "../constants";
import FloatingChatButton from "../components/FloatingChatButton";
import ChatbotNavigator from "./ChatbotNavigator";
import BottomTabs from "./BottomTabs";
import CareFlowNavigator from "./FlowNavigators/CareFlowNavigator";
import ProFlowNavigator from "./FlowNavigators/ProFlowNavigator";
import UroFlowNavigator from "./FlowNavigators/UroFlowNavigator";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

const linking = {
  prefixes: ["zmen://", "https://zmen.health"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: "home",
          History: {
            screens: {
              HistoryList: "history",
              HistoryDetail: "history/detail",
            },
          },
          Profile: {
            screens: {
              ProfileMain: "profile",
              EditProfile: "profile/edit",
              Privacy: "profile/privacy",
              Terms: "profile/terms",
            },
          },
        },
      },
      UroFlow: {
        screens: {
          FormSelection: "uro/intake",
          ScanUrine: "uro/scan",
          UroResults: "uro/results",
        },
      },
      ProFlow: {
        screens: {
          PhStripScan: "pro/ph-scan",
          SemenScan: "pro/semen-scan",
          ViscosityInput: "pro/viscosity",
          ProResults: "pro/results",
        },
      },
      CareFlow: {
        screens: {
          CareOverview: "care",
          EducationalContent: "care/education",
          DoctorsList: "care/doctors",
          Tips: "care/tips",
          TestingKitInfo: "care/kit-info",
        },
      },
      ChatbotModal: "chatbot",
    },
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    primary: COLORS.primary,
    text: COLORS.text,
    card: COLORS.white,
    border: COLORS.muted,
  },
};

export default function RootNavigator() {
  const [currentRoute, setCurrentRoute] = useState("Home");

  const openChatbot = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate("ChatbotModal");
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      linking={linking}
      onReady={() => {
        const routeName = navigationRef.getCurrentRoute()?.name;
        if (routeName) {
          setCurrentRoute(routeName);
        }
      }}
      onStateChange={() => {
        const routeName = navigationRef.getCurrentRoute()?.name;
        if (routeName) {
          setCurrentRoute(routeName);
        }
      }}
    >
      <View className="flex-1 bg-zmen-background">
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerTintColor: COLORS.primary,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UroFlow"
            component={UroFlowNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProFlow"
            component={ProFlowNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CareFlow"
            component={CareFlowNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatbotModal"
            component={ChatbotNavigator}
            options={{ presentation: "modal", headerShown: false }}
          />
        </Stack.Navigator>

        {currentRoute !== "ChatbotModal" ? (
          <FloatingChatButton onPress={openChatbot} />
        ) : null}
      </View>
    </NavigationContainer>
  );
}
