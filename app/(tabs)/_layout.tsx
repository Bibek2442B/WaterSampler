import {Ionicons} from "@expo/vector-icons";
import { Redirect, Tabs} from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/Login" />;

  return (
    <Tabs screenOptions={{
      headerStyle: {
        backgroundColor: '#66a5e3',
      },
      headerLeftContainerStyle: {
        paddingLeft: 20,
      },
      headerRightContainerStyle:{
        paddingRight: 20,
      },
    }}>

      <Tabs.Screen
        name={"WaterSamplerList"}
        options={{
          title: "Water Samplers",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "water" : "water-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}


