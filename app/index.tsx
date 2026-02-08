// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";

export default function Index() {
  // return <Redirect href="/Login" />;
  const { user, loading } = useAuth();

if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }  return user ? (
    <Redirect href="/(tabs)/WaterSamplerList" />
  ) : (
    <Redirect href="/Login" />
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FA",
  },
}); 