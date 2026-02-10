import { Stack, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { user, loading, isRegistering, isLoggingIn } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Don't redirect if we're in the process of registering or logging in
  if (user && !isRegistering && !isLoggingIn) {
    return <Redirect href="/(tabs)/WaterSamplerList" />;
  }

  return(
    <Stack initialRouteName="Login" >
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="Register" options={{ headerShown: false }} />
    </Stack>
   ) ;
}