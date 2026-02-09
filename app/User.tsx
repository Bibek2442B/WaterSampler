import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase.config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function UserAdminPage() {
  const { user, userDoc, loading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(data as any[]);
        setListLoading(false);
      },
      (err) => {
        console.error("Users listener error:", err);
        setListLoading(false);
      }
    );

    return () => unsub();
  }, []);

  if (loading || listLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only allow ADMIN
  if (!user || !userDoc || userDoc.role !== "ADMIN") {
    return <Redirect href="/(tabs)/WaterSamplerList" />;
  }

  const confirmChangeRole = (targetId: string, currentRole: string) => {
    if (targetId === user.uid) {
      Alert.alert("Action not allowed", "You cannot change your own role.");
      return;
    }

    const promote = currentRole !== "OPERATOR";
    const title = promote ? "Promote to Operator" : "Demote to Viewer";
    const message = promote
      ? "Promote this user to Operator?"
      : "Demote this operator to Viewer?";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => changeRole(targetId, promote ? "OPERATOR" : "USER") },
    ]);
  };

  const changeRole = async (targetId: string, newRole: string) => {
    try {
      setUpdatingId(targetId);
      const ref = doc(db, "users", targetId);
      await updateDoc(ref, { role: newRole });
      Alert.alert("Success", `Role updated to ${newRole}`);
    } catch (err) {
      console.error("Update role error:", err);
      Alert.alert("Error", "Failed to update role. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name || "(No name)"}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
      </View>

      <View style={styles.actions}>
        {updatingId === item.id ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: item.role === "OPERATOR" ? "#D32F2F" : "#4CAF50" }]}
            onPress={() => confirmChangeRole(item.id, item.role)}
          >
            <Text style={styles.buttonText}>
              {item.role === "OPERATOR" ? "Demote" : "Promote"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 13, color: "#444" },
  role: { fontSize: 13, color: "#666", marginTop: 4 },
  actions: { marginLeft: 8 },
  button: {
    // backgroundColor: "#0369A1",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#EEE" },
});
