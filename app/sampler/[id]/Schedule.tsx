import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import { useState } from "react";

export default function ScheduleSampler() {
  const { id, name, status } = useLocalSearchParams<{
    id: string;
    name: string;
    status: string;
  }>();
  const router = useRouter();
  const [schedule, setSchedule] = useState("");


  const saveSchedule = async () => {
    if (!id) return;

    await updateDoc(doc(db, "waterSamplers", id), {
      status: "Scheduled",
      schedule,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <TextInput
        placeholder="Enter schedule (date/time)"
        value={schedule}
        onChangeText={setSchedule}
        style={styles.input}
      />

      <Button title="Save Schedule" onPress={saveSchedule} />
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

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },

  infoBox: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 16,
  },

  button: {
    backgroundColor: "lightgreen",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    backgroundColor: "#ccc",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: "#ffb3b3",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },

  cancelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  loading: {
    marginTop: 20,
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },

  success: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
});