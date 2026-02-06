import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";

export default function ProfileScreen() {
    const router = useRouter();
    const auth = getAuth();
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            Alert.alert("Logout failed", "Please try again.");
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user logged in</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                </Text>
            </View>

            <Text style={styles.name}>
                {user.displayName || "Unnamed User"}
            </Text>

            <Text style={styles.email}>{user.email}</Text>

            {/* Role */}
            <View style={styles.infoCard}>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.value}>Water Sampler Operator</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Email Verified</Text>
                <Text
                    style={[
                        styles.value,
                        { color: user.emailVerified ? "green" : "red" },
                    ]}
                >
                    {user.emailVerified ? "Yes" : "No"}
                </Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Member Since</Text>
                <Text style={styles.value}>
                    {new Date(user.metadata.creationTime!).toDateString()}
                </Text>
            </View>

            <Pressable
                style={styles.primaryButton}
                // onPress={() => router.push("/profile/edit")}
            >
                <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        backgroundColor: "#fff",
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    avatarText: {
        fontSize: 36,
        color: "#fff",
        fontWeight: "bold",
    },

    name: {
        fontSize: 22,
        fontWeight: "600",
    },

    email: {
        fontSize: 14,
        color: "#666",
        marginBottom: 24,
    },

    infoCard: {
        width: "100%",
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#F5F5F5",
        marginBottom: 10,
    },

    label: {
        fontSize: 12,
        color: "#888",
    },

    value: {
        fontSize: 16,
        fontWeight: "500",
    },

    primaryButton: {
        marginTop: 20,
        width: "100%",
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        alignItems: "center",
    },

    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    logoutButton: {
        marginTop: 12,
    },

    logoutText: {
        color: "#D32F2F",
        fontSize: 14,
        fontWeight: "500",
    },
});
