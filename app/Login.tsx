import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
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
import { useAuth } from "./context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

 const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Login successful - AuthContext will handle navigation via onAuthStateChanged
      router.replace("/(tabs)/WaterSamplerList");
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle specific error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (err.message.includes("verify your email")) {
        errorMessage = "Please verify your email before logging in.";
      } else if (err.message.includes("admin approval")) {
        errorMessage = "Your account is pending admin approval.";
      } else if (err.message.includes("invalid-credential") || err.message.includes("user-not-found") || err.message.includes("wrong-password")) {
        errorMessage = "Invalid email or password";
      } else if (err.message.includes("too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     Alert.alert("Email and password required");
  //     return;
  //   }

  //   try {
  //     // @ts-ignore
  //     const cred = await signInWithEmailAndPassword(auth, email, password);

  //     if (!cred.user.emailVerified) {
  //       // @ts-ignore
  //       await auth.signOut();
  //       Alert.alert("Verify your email first");
  //       return;
  //     }

  //     const userRef = doc(db, "users", cred.user.uid);
  //     const snap = await getDoc(userRef);

  //     if (!snap.exists()) {
  //       // @ts-ignore
  //       await auth.signOut();
  //       Alert.alert("User data missing");
  //       return;
  //     }

  //     const userData = snap.data();

  //     if (!userData.emailVerified) {
  //       await updateDoc(userRef, { emailVerified: true });
  //     }

  //     if (!userData.approvedByAdmin) {
  //       // @ts-ignore
  //       await auth.signOut();
  //       Alert.alert("Waiting for admin approval");
  //       return;
  //     }

  //     Alert.alert("Welcome!");
  //   } catch (err: any) {
  //     Alert.alert("Login error", err.message);
  //   }
  // };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Login to continue.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.iconButton}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New here? </Text>
              <Link href="/Register" asChild>
                <Pressable hitSlop={10}>
                  <Text style={styles.registerLink}>Register</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E7E9ED",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#111827",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingLeft: 12,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    fontSize: 16,
    color: "#111827",
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  registerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2196F3",
    textDecorationLine: "underline",
    textDecorationColor: "#2196F3",
  },
});
