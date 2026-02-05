import {Stack,Tabs} from "expo-router";

export default function TabsLayout(){

  return (
    <Tabs>
      <Tabs.Screen name={"Dashboard"} options={{headerShown: false}} />
      <Tabs.Screen name={"Hello"} options={{headerShown: false}}/>
      <Tabs.Screen name={"User"} options={{headerShown: false}}/>
    </Tabs>
  );
}