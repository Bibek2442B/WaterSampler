import {Tabs} from "expo-router";

export default function TabsLayout(){

  return (
    <Tabs>
      <Tabs.Screen name={"Dashboard"} options={{headerShown: false}} />
      <Tabs.Screen name={"AddNewSampler"} options={{headerShown: false}}/>
    </Tabs>
  );
}