import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert, StyleSheet,
} from "react-native";
import {useAuth} from "@/context/AuthContext";
import {router} from "expo-router";
import {useQuery} from "@tanstack/react-query";
import {fetchUsers} from "@/src/queries/UserQuery";
import {useEffect, useState} from "react";
import {UserInterface} from "@/src/interfaces";

export default function UserManagement() {
  const {data, isLoading, error} = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  })
  const {user, userDoc, loading} = useAuth();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<UserInterface[] | undefined>(data);
  useEffect(()=>{

  },[data,searchText])
  if (loading || isLoading) {
    return <ActivityIndicator size="large" />;
  }
  if (!user || !userDoc || userDoc.role !== "ADMIN") {
    router.replace("/(tabs)/Profile");
  }


  return (
    <View style={styles.container}>
      <FlatList
        data = {data}
        keyExtractor={(item) => item.id}
        renderItem={({item})=>(
          <Text>
            {item.name}
          </Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchBar: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0369A1",
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#0369A1",
  },
  filterButtonText: {
    color: "#0369A1",
    fontWeight: "600",
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 13, color: "#444" },
  role: { fontSize: 13, color: "#666", marginTop: 4 },
  actions: { marginLeft: 8 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#EEE" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});