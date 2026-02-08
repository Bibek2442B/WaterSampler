// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Index() {
  // return <Redirect href="/Login" />;
  const { user, loading } = useAuth();

  if (loading) return null;
  return user ? (
    <Redirect href="/(tabs)/WaterSamplerList" />
  ) : (
    <Redirect href="/Login" />
  );
}