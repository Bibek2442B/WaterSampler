import { Stack } from "expo-router";
import {AuthProvider} from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>

  );
}
