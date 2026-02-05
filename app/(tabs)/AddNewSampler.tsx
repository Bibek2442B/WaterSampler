import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// @ts-ignore
import { db } from "@/firebase.config";

export default function AddWaterSampler() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateSampler = async () => {
    if (!name || !address || !phone) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "waterSamplers"), {
        name,
        address,
        phone,
        status: "Free",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Water sampler created successfully");

      // Reset form
      setName("");
      setAddress("");
      setPhone("");
    } catch (error) {
      console.error("Error creating sampler:", error);
      Alert.alert("Error", "Failed to create water sampler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Water Sampler</Text>

      <Text style={styles.label}>Sampler Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter sampler name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Enter sampler address"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateSampler}>
          <Text style={styles.buttonText}>Create Sampler</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  statusButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  statusText: {
    color: "#333",
  },
  statusTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});