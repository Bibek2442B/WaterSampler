import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
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
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "OPERATOR" | "USER">("ALL");

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

  // Filter users based on search and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or email..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Role Filter Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            roleFilter === "ALL" && styles.filterButtonActive,
          ]}
          onPress={() => setRoleFilter("ALL")}
        >
          <Text
            style={[
              styles.filterButtonText,
              roleFilter === "ALL" && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            roleFilter === "OPERATOR" && styles.filterButtonActive,
          ]}
          onPress={() => setRoleFilter("OPERATOR")}
        >
          <Text
            style={[
              styles.filterButtonText,
              roleFilter === "OPERATOR" && styles.filterButtonTextActive,
            ]}
          >
            Operator
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            roleFilter === "USER" && styles.filterButtonActive,
          ]}
          onPress={() => setRoleFilter("USER")}
        >
          <Text
            style={[
              styles.filterButtonText,
              roleFilter === "USER" && styles.filterButtonTextActive,
            ]}
          >
            Viewer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found</Text>
        }
      />
    </View>
  );
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
