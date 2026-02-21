import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import {useQuery} from "@tanstack/react-query";
import {SamplerInterface} from "@/src/interfaces";
import {SamplerMachine} from "@/src/queries/SamplerMachine";

type Sampler = {
  name: string;
  address: string;
  status: string;
  ip: string;
  schedule?: string;
};

export default function SamplerDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigation = useNavigation();
  const { userDoc } = useAuth();



  const {data, isLoading, error} = useQuery<SamplerInterface, Error, SamplerInterface, string[]>({
    queryKey: ["sampler", id] as [string, string],
    queryFn: SamplerMachine,
    enabled: !!id,
  })

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.name || "Water Sampler",
    });
    console.log(data);
  }, [data]);

  const handleDelete = () => {
    if (!id || isDeleting) return;
    Alert.alert(
      "Delete sampler?",
      "This will permanently delete this water sampler.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteDoc(doc(db, "waterSamplers", id));
              router.replace("/(tabs)/WaterSamplerList");
            } catch (e) {
              Alert.alert("Delete failed", "Please try again.");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "free":
        return styles.statusFree;
      case "scheduled":
        return styles.statusScheduled;
      case "taking sample":
        return styles.statusTakingSample;
      case "has sample":
        return styles.statusHasSample;
      default:
        return styles.statusUnknown;
    }
  };

  if (isLoading) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  const canManage =
    userDoc?.role === "OPERATOR" || userDoc?.role === "ADMIN";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{data?.address}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>IP Address</Text>
          <Text style={styles.value}>{data?.ip}</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, getStatusStyle(data?.status)]} />
            <Text style={[styles.statusText]}>
              {String(data?.status).replaceAll("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {data?.status === "FREE" && canManage && (
        <Button
          title="Schedule Sampler"
          onPress={() =>
            router.push({
              pathname: `/sampler/[id]/Schedule`,
              params: {
                id: id,
                name: data.name,
                status: data.status,
              },
            })
          }
        />
      )}

      {data?.status === "SCHEDULED" && (
        <Button
          title="Edit Schedule"
          onPress={() => router.push(`/sampler/${id}Schedule`)}
        />
      )}

      {canManage && (
        <View style={{ marginTop: 12 }}>
          <Button
            title={isDeleting ? "Deleting..." : "Delete Sampler"}
            color="#D32F2F"
            disabled={isDeleting}
            onPress={handleDelete}
          />
        </View>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E6E6",
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  label: {
    fontSize: 12,
    color: "#777",
    letterSpacing: 0.3,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
    color: "#111",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    gap: 8,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  statusFree: {
    color: "green",
    backgroundColor: "green",
  },

  statusScheduled: {
    color: "orange",
    backgroundColor: "orange",
  },

  statusTakingSample: {
    color: "#1e90ff",
    backgroundColor: "#1e90ff",
  },

  statusHasSample: {
    color: "red",
    backgroundColor: "red",
  },

  statusUnknown: {
    color: "#666",
    backgroundColor: "#666",
  },

  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonDisabled: {
    backgroundColor: "#ccc",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});