import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { styles } from "./Login";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      router.replace("/(auth)/Login");
      setTimeout(() => {
        Alert.alert(
          "Registration Successful",
          "A verification email has been sent to your email address. Please verify your email before logging in."
        );
      }, 100);
    } catch (err: any) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.message.includes("email-already-in-use")) {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (err.message.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address";
      } else if (err.message.includes("weak-password")) {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={48} color="#0369A1" />
            </View>
            <Text style={styles.appTitle}>Water Sampler</Text>
            <Text style={styles.appSubtitle}>Monitoring & Management System</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons name="person" size={14} color="#0369A1" />
                <Text style={styles.label}>Full Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                placeholder="Enter your full name"
                placeholderTextColor="#D1D5DB"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons name="mail" size={14} color="#0369A1" />
                <Text style={styles.label}>Email Address</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                placeholder="Enter your email"
                placeholderTextColor="#D1D5DB"
                editable={!isLoading}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons name="lock-closed" size={14} color="#0369A1" />
                <Text style={styles.label}>Password</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  placeholder="Enter your password"
                  placeholderTextColor="#D1D5DB"
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.iconButton}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={isLoading ? "#D1D5DB" : "#0369A1"} 
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Ionicons name="lock-closed" size={14} color="#0369A1" />
                <Text style={styles.label}>Confirm Password</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  placeholder="Confirm your password"
                  placeholderTextColor="#D1D5DB"
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  style={styles.iconButton}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={isLoading ? "#D1D5DB" : "#0369A1"} 
                  />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <Link href="/Login" asChild>
                <Pressable hitSlop={10} disabled={isLoading}>
                  <Text style={styles.registerLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.footerInfo}>
              <Ionicons name="information-circle" size={14} color="#6B7280" />
              <Text style={styles.footerText}>Verify your email before logging in</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
