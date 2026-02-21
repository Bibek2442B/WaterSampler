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
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function UserRequestPage() {
  const { user, userDoc, loading } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    // Query for users not yet approved
    const q = query(
      collection(db, "users"),
      where("approvedByAdmin", "==", false ),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPendingUsers(data as any[]);
        setListLoading(false);
      },
      (err) => {
        console.error("Pending users listener error:", err);
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

  const acceptRequest = async (userId: string) => {
    try {
      setProcessingId(userId);
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { approvedByAdmin: true });
      Alert.alert("Success", "User request accepted!");
    } catch (err) {
      console.error("Accept error:", err);
      Alert.alert("Error", "Failed to accept request. Try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const declineRequest = async (userId: string) => {
    try {
      setProcessingId(userId);
      const ref = doc(db, "users", userId);
      await deleteDoc(ref);
      Alert.alert("Success", "User request declined!");
    } catch (err) {
      console.error("Decline error:", err);
      Alert.alert("Error", "Failed to decline request. Try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (userId: string, action: "accept" | "decline") => {
    const title = action === "accept" ? "Accept Request" : "Decline Request";
    const message =
      action === "accept"
        ? "Accept this user's registration request?"
        : "Decline this user's registration request?";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: action === "accept" ? "Accept" : "Decline",
        style: action === "decline" ? "destructive" : "default",
        onPress: () =>
          action === "accept"
            ? acceptRequest(userId)
            : declineRequest(userId),
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name || "(No name)"}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.registered}>
          Registered: {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
        </Text>
      </View>

      <View style={styles.actions}>
        {processingId === item.id ? (
          <ActivityIndicator />
        ) : (
          <>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => confirmAction(item.id, "accept")}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => confirmAction(item.id, "decline")}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingUsers}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending requests</Text>
        }
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
