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
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase.config";
import {router} from "expo-router";

export default function AddWaterSampler() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateSampler = async () => {
    if (!name || !address || !ip) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "waterSamplers"), {
        name: name.trim(),
        address: address.trim(),
        ip: ip.trim(),
        status: "FREE",
      });

      Alert.alert("Success", "Water sampler created successfully");

      setName("");
      setAddress("");
      setIp("");
      router.replace("/WaterSamplerList");
    } catch (error) {
      console.error("Error creating sampler:", error);
      Alert.alert("Error", "Failed to create water sampler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.label}>IP Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter IP Address"
        value={ip}
        onChangeText={setIp}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCreateSampler}>
          <Text style={styles.buttonText}>Create Sampler</Text>
        </TouchableOpacity>
      )}
    </View>
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
    marginTop: 6,
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