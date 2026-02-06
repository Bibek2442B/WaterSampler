import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";

export default function TabsLayout(){

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
      }
    }}>
      <Tabs.Screen name={"WaterSamplerList"} options={{
        title: "Water Samplers",
      }}/>
      <Tabs.Screen
          name={"Profile"}
          options={{
            title: "Profile",
            headerTitleAlign: "center",
          }}
      />
    </Tabs>
  );
}