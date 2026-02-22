import React from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchPendingUsers,
  acceptUserRequest,
  declineUserRequest,
  PendingUser,
} from "@/src/queries/userRequests";

export default function UserRequestPage() {
  const { user, userDoc, loading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pending users
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: fetchPendingUsers,
  });

  const acceptMutation = useMutation({
  mutationFn: (userId: string) => acceptUserRequest(userId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
  },
});

const declineMutation = useMutation({
  mutationFn: (userId: string) => declineUserRequest(userId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
  },
});
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
        <Text>Failed to load requests</Text>
      </View>
    );
  }

  if (!user || !userDoc || userDoc.role !== "ADMIN") {
    return <Redirect href="/(tabs)/WaterSamplerList" />;
  }

  const pendingUsers: PendingUser[] = data?.users ?? [];

 const confirmAction = (userId: string, action: "accept" | "decline") => {
  const title =
    action === "accept" ? "Accept Request" : "Decline Request";

  const message =
    action === "accept"
      ? "Accept this user's registration request?"
      : "Decline this user's registration request?";

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: action === "accept" ? "Accept" : "Decline",
      style: action === "decline" ? "destructive" : "default",
      onPress: async () => {
        try {
          if (action === "accept") {
            await acceptMutation.mutateAsync(userId);
            Alert.alert("Success", "User request accepted!");
          } else {
            await declineMutation.mutateAsync(userId);
            Alert.alert("Success", "User request declined!");
          }
        } catch {
          Alert.alert("Error", "Operation failed. Try again.");
        }
      },
    },
  ]);
};

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingUsers}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No pending requests
          </Text>
        }
        renderItem={({ item }) => {
          const isProcessing =
            (acceptMutation.isPending &&
              acceptMutation.variables === item.id) ||
            (declineMutation.isPending &&
              declineMutation.variables === item.id);

          return (
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name || "(No name)"}
                </Text>
                <Text style={styles.email}>
                  {item.email}
                </Text>
                <Text style={styles.registered}>
                  Registered:{" "}
                  {item.createdAt?.toDate?.()?.toLocaleDateString() ||
                    "N/A"}
                </Text>
              </View>

              <View style={styles.actions}>
                {isProcessing ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        confirmAction(item.id, "accept")
                      }
                    >
                      <Text style={styles.buttonText}>
                        Accept
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() =>
                        confirmAction(item.id, "decline")
                      }
                    >
                      <Text style={styles.buttonText}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
  title: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 13, color: "#444" },
  registered: { fontSize: 12, color: "#888", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  declineButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  separator: { height: 1, backgroundColor: "#EEE" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});
