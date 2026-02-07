import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { db } from "@/firebase.config";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

interface UserType {
  uid: string;
  email: string;
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "viewer" | "operator">("all");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: UserType[] = [];
      snapshot.forEach((docSnap) => {
        if(
          docSnap.data().role.toLowerCase() !== "admin" &&
          docSnap.data().approved === true
      ){
          list.push({ uid: docSnap.id, ...docSnap.data() } as UserType);
        }
      });
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Promote/Demote user
  const toggleRole = async (uid: string, role: string) => {
    setActionLoading(true);
    try {
      const updatedRole = role === "viewer" ? "operator" : "viewer";
      await updateDoc(doc(db, "users", uid), { role: updatedRole });
      Alert.alert("Success", `User role updated to ${updatedRole}`);
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
      Alert.alert("Error", "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };
  
  // Delete user
const confirmDeleteUser = (uid: string) => {
  Alert.alert(
    "Delete user",
    "Are you sure you want to delete this user?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteUser(uid),
      },
    ]
  );
};

const handleDeleteUser = async (uid: string) => {
  try {
    setActionLoading(true);

    await deleteDoc(doc(db, "users", uid));

    setUsers((prev) => prev.filter((u) => u.uid !== uid));

    Alert.alert("Deleted", "User has been deleted.");
  } catch (error) {
    console.error("Delete error:", error);
    Alert.alert("Error", "Failed to delete user.");
  } finally {
    setActionLoading(false);
  }
};


  // Filter users by search & role
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>User Management</Text>

        {/* Search */}
        <TextInput
          placeholder="Search by email"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Role filter */}
        <View style={styles.filterRow}>
          {["all", "viewer", "operator"].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                roleFilter === role && styles.filterSelected,
              ]}
              onPress={() => setRoleFilter(role as any)}
            >
              <Text style={{ textTransform: "capitalize" }}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.uid}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.role}>{item.role}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "orange" }]}
                  onPress={() => toggleRole(item.uid, item.role)}
                  disabled={actionLoading}
                >
                  <Text style={styles.btnText}>
                    {item.role === "viewer" ? "Promote" : "Demote"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: "red" }]}
                  onPress={() => confirmDeleteUser(item.uid)}
                  disabled={actionLoading}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterSelected: {
    backgroundColor: "#ddd",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 8,
  },
  email: {
    fontWeight: "bold",
  },
  role: {
    color: "gray",
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});