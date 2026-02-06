import { View, Text, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

type Sampler = {
  name: string;
  address: string;
  status: string;
  phone: string;
  schedule?: string;
};

export default function SamplerDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [sampler, setSampler] = useState<Sampler | null>(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchSampler = async () => {
      if (!id) return;
      const docRef = doc(db, "waterSamplers", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setSampler(snap.data() as Sampler);
      }

    };

    fetchSampler();

  }, [id]);
  useEffect(()=>{
    navigation.setOptions({
      headerTitle: sampler?.name || "Water Sampler",
    })
  },[sampler])

  if (!sampler) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>

      <Text>Status: {sampler.status}</Text>
      <Text>Phone: {sampler.phone}</Text>
      <Text>Address: {sampler.address}</Text>

      {sampler.status === "Free" && (
        <Button
          title="Schedule Sampler"
          onPress={() =>
            router.push(`/sampler/${id}/schedule`)
          }
        />
      )}

      {sampler.status === "Scheduled" && (
        <Button
          title="Edit Schedule"
          onPress={() =>
            router.push(`/sampler/${id}/schedule`)
          }
        />
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
    elevation: 3, // Android shadow
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 4,
  },

  statusFree: {
    color: "green",
    fontWeight: "bold",
  },

  statusScheduled: {
    color: "orange",
    fontWeight: "bold",
  },

  statusTakingSample: {
    color: "#1e90ff",
    fontWeight: "bold",
  },

  statusHasSample: {
    color: "red",
    fontWeight: "bold",
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