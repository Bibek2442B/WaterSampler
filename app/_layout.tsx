// import {Stack, useRouter, useSegments} from "expo-router";
// import {useEffect, useState} from "react";
// import {User} from "firebase/auth";
// // @ts-ignore
// import {auth} from "@/firebase.config";
// import {ActivityIndicator, View} from "react-native";
// import Login from "@/app/Login";


// export default function RootLayout() {
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState<User | null>(null);

//   const router = useRouter();
//   const segments= useSegments();

//   const onAuthStateChange=(thisUser: User | null) => {

//     setUser(thisUser);
//     // console.log(user);
//     setInitializing(false);
//   }

//   useEffect(() => {
//     // @ts-ignore
//     const subscriber = auth.onAuthStateChanged(onAuthStateChange);
//     return subscriber;
//   },[]);

//   useEffect(() => {
//     if(initializing) return;
//     const inTabsDir = segments[0]==='(tabs)';
//     if(user && !inTabsDir){
//       router.replace('/(tabs)/WaterSamplerList');
//     }
//     else if(!user && inTabsDir){
//       router.replace('/');
//     }

//   }, [user, initializing]);

//   if(initializing) {
//     return(
//       <View>
//         <ActivityIndicator size="large"/>
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{
//       headerStyle: {backgroundColor: '#50A0F1'},
//     }}>
//       {/* <Stack.Screen name={"test"} options={{headerShown: false}}/> */}
//       <Stack.Screen name={"Login"} options={{headerShown: false}}/>
//       <Stack.Screen name={"Register"} options={{headerShown: false}}/>
//       <Stack.Screen name={"(tabs)"} options={{headerShown: false}}/>
//       <Stack.Screen name={"AddNewSampler"} options={{
//         title: 'Add New Sampler',
//       }}/>
//       <Stack.Screen name={"sampler/[id]/index"}/>
//       <Stack.Screen name={"sampler/[id]/Schedule"} options={{headerTitle: 'Schedule Sampler'}}/>
//     </Stack>
//   );
// }
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

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
