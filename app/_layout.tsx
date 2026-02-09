import { Stack } from "expo-router";
import {AuthProvider} from "@/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{ headerStyle: { backgroundColor: "#50A0F1" } }}
        initialRouteName="(auth)"
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="AddNewSampler"
          options={{ title: "Add New Sampler" }}
        />
        <Stack.Screen name="sampler/[id]/index" />
        <Stack.Screen
          name="sampler/[id]/Schedule"
          options={{ headerTitle: "Schedule Sampler" }}
        />
      </Stack>
    </AuthProvider>
  );
}
