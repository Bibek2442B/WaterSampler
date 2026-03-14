import {useAuth} from "@/context/AuthContext";
import {ActivityIndicator, View} from "react-native";

export default function Index(){
  const {user, userDoc, loading} = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if(!(user && userDoc)){

  }

}