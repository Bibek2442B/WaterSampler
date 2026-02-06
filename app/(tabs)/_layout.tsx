import {Tabs} from "expo-router";

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
      <Tabs.Screen name={"Dashboard"} options={{headerShown: false}} />
      <Tabs.Screen name={"AddNewSampler"} options={{headerShown: false}}/>
      <Tabs.Screen name={"WaterSamplerList"} options={{
        title: "Water Samplers",

      }}/>
    </Tabs>
  );
}