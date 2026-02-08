import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore
import { useAuth } from "./context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      await register(name, email, password);
      Alert.alert("Verify Email", "Please verify your email before logging in.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Register to start using WaterSampler.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

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
                  returnKeyType="next"
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

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((v) => !v)}
                  style={styles.iconButton}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already registered? </Text>
              <Link href="/Login" asChild>
                <Pressable hitSlop={10}>
                  <Text style={styles.loginLink}>Login</Text>
                </Pressable>
              </Link>
            </View>

            <Text style={styles.helperText}>
              By registering, you may need to verify your email before logging in.
            </Text>
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
    backgroundColor: "#4CAF50",
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

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  loginText: {
    fontSize: 13,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4CAF50",
    textDecorationLine: "underline",
    textDecorationColor: "#4CAF50",
  },

  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    textAlign: "center",
  },
});
