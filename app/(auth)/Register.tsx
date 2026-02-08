import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
// @ts-ignore
import { useAuth } from "@/context/AuthContext";

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
    // Validation
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
      
      Alert.alert(
        "Registration Successful",
        "A verification email has been sent to your email address. Please verify your email before logging in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/Login"),
          },
        ]
      );
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


  // const handleRegister = async () => {
  //   if (!name || !email || !password || !confirmPassword) {
  //     Alert.alert("All fields are required");
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     Alert.alert("Passwords do not match");
  //     return;
  //   }

  //   try {
  //     // @ts-ignore
  //     const cred = await createUserWithEmailAndPassword(auth, email, password);

  //     await sendEmailVerification(cred.user);

  //     await setDoc(doc(db, "users", cred.user.uid), {
  //       name,
  //       email,
  //       role: "user",
  //       emailVerified: false,
  //       approvedByAdmin: false,
  //       createdAt: serverTimestamp(),
  //     });

  //     Alert.alert("Verify Email", "Please verify your email before logging in.");
  //   } catch (err: any) {
  //     Alert.alert("Error", err.message);
  //   }
  // };

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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={48} color="#0369A1" />
            </View>
            <Text style={styles.appTitle}>Water Sampler</Text>
            <Text style={styles.appSubtitle}>Monitoring & Management System</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            {/* Name Field */}
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

            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Confirm Password Field */}
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

            {/* Register Button */}
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

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/Login" asChild>
                <Pressable hitSlop={10} disabled={isLoading}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </Pressable>
              </Link>
            </View>

            {/* Footer Info */}
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

const styles = StyleSheet.create({
  // Background & Container
  safe: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0369A1",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0369A1",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  // Typography
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  

  // Fields
  field: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369A1",
    letterSpacing: 0.3,
  },

  // Input Fields
  input: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingLeft: 14,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 10,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Button
  button: {
    backgroundColor: "#0369A1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    justifyContent: "center",
    height: 50,
    shadowColor: "#0369A1",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Login Link
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369A1",
    textDecorationLine: "underline",
    textDecorationColor: "#0369A1",
  },

  // Footer Info
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
});
