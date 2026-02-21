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
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSamplersPage } from "@/src/queries/samplers";
import { SamplerInterface, SamplersPage } from "@/src/interfaces";
import {QueryDocumentSnapshot} from "firebase/firestore";
import {DocumentData} from "@firebase/firestore";

export default function WaterSamplersList() {
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery<
    SamplersPage,
    Error,
    SamplersPage,
    string[],
    QueryDocumentSnapshot<DocumentData> | null
  >({
    queryKey: ["waterSamplers"],
    queryFn: ({ pageParam }) => fetchSamplersPage(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastDoc,
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push("/AddNewSampler")}
          style={styles.button}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            + New Sampler
          </Text>
        </Pressable>
      ),
    });
  }, []);

  const samplers = useMemo<SamplerInterface[]>(() => {
    // @ts-ignore
    return data?.pages.flatMap((page) => page.samplers) ?? [];
  }, [data]);

  const filteredSamplers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return samplers;

    const scoreSampler = (s: SamplerInterface) => {
      const id = (s.id ?? "").toLowerCase();
      const ip = (s.ip ?? "").toLowerCase();
      const name = (s.name ?? "").toLowerCase();
      const address = (s.address ?? "").toLowerCase();

      if (id.includes(q) || ip.includes(q)) return 3;
      if (name.includes(q)) return 2;
      if (address.includes(q)) return 1;
      return 0;
    };

    return samplers
      .map((s) => ({ s, score: scoreSampler(s) }))
      .filter((x) => x.score > 0)
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : (a.s.name ?? "").localeCompare(b.s.name ?? "")
      )
      .map((x) => x.s);
  }, [samplers, searchText]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Failed to load samplers</Text>
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

      <FlatList
        data={filteredSamplers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator /> : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/sampler/${item.id}`)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.label}>Address</Text>
            <Text>{item.address}</Text>
          </Pressable>
        )}
      />
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
  button: {
    backgroundColor: "#47d16e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0369A1",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});
