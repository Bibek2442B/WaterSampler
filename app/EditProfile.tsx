import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, updatePassword } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/src/queries/profiles";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const { userDoc } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userDoc?.name) setName(userDoc.name);
  }, [userDoc]);

  const nameMutation = useMutation({
    mutationFn: (newName: string) =>
      updateUserProfile(user!.uid, { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDoc"] });
      Alert.alert("Success", "Name updated successfully!");
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "Failed to update name. Try again.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (password: string) => updatePassword(user!, password),
    onSuccess: () => {
      Alert.alert("Success", "Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      let message = "Failed to update password.";
      if (error.code === "auth/requires-recent-login") {
        message =
          "Please logout and login again before changing password.";
      }
      Alert.alert("Error", message);
    },
  });

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No user logged in</Text>
      </View>
    );
  }

  const handleSaveName = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    nameMutation.mutate(name.trim());
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert(
        "Validation",
        "Password must be at least 6 characters long."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match.");
      return;
    }
    passwordMutation.mutate(newPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        style={styles.input}
      />
      <Pressable
        style={[styles.saveButton, nameMutation.isPending && { opacity: 0.7 }]}
        onPress={handleSaveName}
        disabled={nameMutation.isPending}
      >
        {nameMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Name</Text>
        )}
      </Pressable>

      {/* Password */}
      <Text style={[styles.label, { marginTop: 24 }]}>New Password</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          placeholder="Enter new password"
          style={styles.inputFlex}
        />
        <Pressable
          onPress={() => setShowPassword((v) => !v)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#0369A1"
          />
        </Pressable>
      </View>

      <Text style={styles.label}>Confirm New Password</Text>
      <View style={styles.inputWithIcon}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Re-enter new password"
          style={styles.inputFlex}
        />
        <Pressable
          onPress={() => setShowConfirmPassword((v) => !v)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={20}
            color="#0369A1"
          />
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.saveButton,
          passwordMutation.isPending && { opacity: 0.7 },
        ]}
        onPress={handleChangePassword}
        disabled={passwordMutation.isPending}
      >
        {passwordMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Change Password</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
     padding: 24,
     backgroundColor: "#fff" 
  },
  center: { 
    flex: 1,
    justifyContent: "center", 
    alignItems: "center" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "600", 
    marginBottom: 24 
  },
  label: { 
    fontSize: 14, 
    color: "#555", 
    marginBottom: 8 
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    padding: 12,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  eyeButton: {
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  saveText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});