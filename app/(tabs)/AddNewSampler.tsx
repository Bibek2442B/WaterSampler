import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// @ts-ignore
import {auth, db} from "@/firebase.config";

type SamplerStatus =
  | "FREE"
  | "SCHEDULED"
  | "TAKING_SAMPLE"
  | "HAS_SAMPLE";

export default function AddWaterSampler() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<SamplerStatus>("FREE");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // Get current location on load
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(
        currentLocation.coords
      );

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: address[0]
          ? `${address[0].street}, ${address[0].city}`
          : "Unknown location",
      });
    })();
  }, []);

  const handleSave = async () => {
    if (!name || !phoneNumber || !location) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "waterSamplers"), {
        name,
        phoneNumber,
        status,
        location,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Water sampler added successfully!");
      setName("");
      setPhoneNumber("");
      setStatus("FREE");
    } catch (error) {
      // @ts-ignore
      console.error(error);
      Alert.alert("Error", "Failed to save sampler.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Water Sampler</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Sampler Name"
        value={name}
        onChangeText={setName}
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Status */}
      <Text style={styles.label}>Status</Text>
      {(["FREE", "SCHEDULED", "TAKING_SAMPLE", "HAS_SAMPLE"] as SamplerStatus[]).map(
        (item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.statusButton,
              status === item && styles.statusActive,
            ]}
            onPress={() => setStatus(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )
      )}

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      {location ? (
        <>
          <Text style={styles.address}>{location.address}</Text>

          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(e) =>
              setLocation({
                ...location,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                address: "Custom location",
              })
            }
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
              onDragEnd={(e) =>
                setLocation({
                  ...location,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                })
              }
            />
          </MapView>
        </>
      ) : (
        <ActivityIndicator />
      )}

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Sampler</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 86,
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  statusButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 4,
  },
  statusActive: {
    backgroundColor: "#c8f7c5",
  },
  address: {
    marginVertical: 6,
    color: "gray",
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});