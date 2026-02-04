import {StyleSheet, Text, TouchableOpacity} from "react-native";
//@ts-ignore
import {auth} from "@/firebase.config";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {Link} from "expo-router";

export default function Dashboard(){
  const handleLogoutButton=async ()=>{
    //@ts-ignore
    await auth.signOut();
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <Text>Dashboard</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogoutButton}
      >
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>
      <Link
        style={styles.button}
        href={"/AddNewSampler"}
      >
        Add New Sampler
      </Link>
    </SafeAreaView>
    </SafeAreaProvider>

  )
}

const styles= StyleSheet.create({
  container:{
    padding:20,
    justifyContent: "center",
    alignItems: "center",
  },
  button:{
    width: '80%',
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgreen",
    padding: 15,
  },
  text:{
    fontSize: 20,
  },
})