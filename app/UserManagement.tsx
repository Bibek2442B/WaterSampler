import React, { useMemo, useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import {
  fetchUsers,
  updateUserRole,
  UserInterface,
  UsersPage,
  UserRole,
} from "@/src/queries/users";

export default function UserAdminPage() {
  const { user, userDoc, loading } = useAuth();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<"ALL" | "OPERATOR" | "VIEWER">("ALL");

  const { data, isLoading, error } = useQuery<
    UsersPage,
    Error
  >({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: UserRole;
    }) => updateUserRole(userId, newRole),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      Alert.alert("Success", "Role updated successfully");
    },

    onError: () => {
      Alert.alert("Error", "Failed to update role.");
    },
  });

  const users: UserInterface[] = data?.users?.filter((u)=>(u.role!=="ADMIN")) ?? [];

  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q && roleFilter === "ALL") return users;

    return users.filter((u) => {
      if (!u.approvedByAdmin) return false;

      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchText, roleFilter]);

  if (loading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Failed to load users</Text>
      </View>
    );
  }

  if (!user || !userDoc || userDoc.role !== "ADMIN") {
    return <Redirect href="/(tabs)/WaterSamplerList" />;
  }



  const confirmChangeRole = (
    targetId: string,
    currentRole: UserRole
  ) => {
    if (targetId === user.uid) {
      Alert.alert(
        "Action not allowed",
        "You cannot change your own role."
      );
      return;
    }

    const promote = currentRole !== "OPERATOR";

    Alert.alert(
      promote ? "Promote to Operator" : "Demote to Viewer",
      promote
        ? "Promote this user to Operator?"
        : "Demote this operator to Viewer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () =>
            mutation.mutate({
              userId: targetId,
              newRole: promote ? "OPERATOR" : "VIEWER",
            }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or email..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.filterRow}>
        {["ALL", "OPERATOR", "USER"].map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterButton,
              roleFilter === role && styles.filterButtonActive,
            ]}
            onPress={() =>
              setRoleFilter(role as "ALL" | "OPERATOR" | "VIEWER")
            }
          >
            <Text
              style={[
                styles.filterButtonText,
                roleFilter === role &&
                  styles.filterButtonTextActive,
              ]}
            >
              {role === "USER"
                ? "Viewer"
                : role === "OPERATOR"
                ? "Operator"
                : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const isSelf = item.id === user.uid;
          const isAdminUser = item.role === "ADMIN";
          const hideButton = isSelf || isAdminUser;

          return (
            <View style={styles.row}>
              <TouchableOpacity  style={{ flex: 1 }} onPress={()=>{router.push('/SamplerAssignment')}}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {item.name || "(No name)"}
                  </Text>
                  <Text>{item.email}</Text>
                  <Text>Role: {item.role}</Text>
                </View>
              </TouchableOpacity>


              {mutation.isPending &&
              mutation.variables?.userId === item.id ? (
                <ActivityIndicator />
              ) : hideButton ? null : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        item.role === "OPERATOR"
                          ? "#D32F2F"
                          : "#4CAF50",
                    },
                  ]}
                  onPress={() =>
                    confirmChangeRole(item.id, item.role)
                  }
                >
                  <Text style={styles.buttonText}>
                    {item.role === "OPERATOR"
                      ? "Demote"
                      : "Promote"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
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
