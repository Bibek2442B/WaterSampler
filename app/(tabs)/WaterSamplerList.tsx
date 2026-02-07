import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
// @ts-ignore
import { db } from "@/firebase.config";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";

type SamplerStatus =
  | "free"
  | "scheduled"
  | "taking_sample"
  | "has_sample";

interface WaterSampler {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: SamplerStatus;
}

export default function WaterSamplersList() {
  const [samplers, setSamplers] = useState<WaterSampler[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(db, "waterSamplers"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: WaterSampler[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<WaterSampler, "id">),
        }));

        setSamplers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching samplers:", error);
        setLoading(false);
      }
    );

    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push("/AddNewSampler")} style={styles.button}>
          <Text>+ New Sampler</Text>
        </Pressable>
      ),
    });

    return unsubscribe;
  }, []);

  const getStatusColor = (status: SamplerStatus) => {
    switch (status.toLowerCase()) {
      case "free":
        return "#4CAF50";
      case "scheduled":
        return "#FFC107";
      case "taking_sample":
        return "#2196F3";
      case "has_sample":
        return "#9C27B0";
      default:
        return "#999";
    }
  };

  const filteredSamplers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return samplers;

    const scoreSampler = (s: WaterSampler) => {
      const id = (s.id ?? "").toLowerCase(); // treat as "number"
      const phone = (s.phone ?? "").toLowerCase(); // also "number"-ish
      const name = (s.name ?? "").toLowerCase();
      const address = (s.address ?? "").toLowerCase();

      // Order priority: number -> name -> address
      if (id.includes(q) || phone.includes(q)) return 3;
      if (name.includes(q)) return 2;
      if (address.includes(q)) return 1;
      return 0;
    };

    return samplers
      .map((s) => ({ s, score: scoreSampler(s) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // higher priority first
        return (a.s.name ?? "").localeCompare(b.s.name ?? ""); // stable-ish tie-breaker
      })
      .map((x) => x.s);
  }, [samplers, searchText]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (samplers.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No water samplers found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by number, name, or address..."
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {filteredSamplers.length === 0 ? (
        <SafeAreaView style={styles.center}>
          <Text>No matches for “{searchText.trim()}”</Text>
        </SafeAreaView>
      ) : (
        <FlatList
          data={filteredSamplers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={(_) => {
                router.push(`/sampler/${item.id}`);
              }}
            >
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.label}>Address</Text>
              <Text>{item.address}</Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                />
                <Text style={styles.statusText}>
                  {item.status.replace("_", " ").toUpperCase()}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  clearBtn: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#47d16e",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});