import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {SamplerInterface, SamplersPage} from "@/src/interfaces";
import {doc, getDoc, QueryDocumentSnapshot} from "firebase/firestore";
import {DocumentData} from "@firebase/firestore";
import {fetchSamplersPage} from "@/src/queries/samplers";
import {useMemo, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {addSamplerToUser, removeSamplerFromUser} from "@/src/queries/users";
import {useAuth} from "@/context/AuthContext";
import {router, useLocalSearchParams} from "expo-router";
import {db} from "@/firebase.config";

export default function SamplerAssignment() {
  const {employeeId} = useLocalSearchParams() as {employeeId: string};
  const {user, userDoc, loading} = useAuth();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const waterSamplers = useInfiniteQuery<
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

  const employee = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const docRef = doc(db, "users", employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as DocumentData;
      } else {
        throw new Error("Employee not found");
      }
    },
    enabled: !!employeeId,
  })

  const mutation = useMutation({
    mutationFn:({
      userId,
      samplerId,
    }:{
      userId: string,
      samplerId: string
    }) => addSamplerToUser(userId, samplerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      Alert.alert("Success", "Sampler assigned successfully");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to assign sampler.");
    },
  })

  const removeMutation = useMutation({
    mutationFn:({
      userId,
      samplerId,
    }:{
      userId: string,
      samplerId: string
    }) => removeSamplerFromUser(userId, samplerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      Alert.alert("Success", "Sampler removed successfully");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to remove sampler.");
    },
  })

  const samplers = useMemo<SamplerInterface[]>(() => {
    // @ts-ignore
    return waterSamplers.data?.pages.flatMap((page) => page.samplers) ?? [];
  }, [waterSamplers.data]);

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

  if (waterSamplers.isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  if(userDoc?.role !== "ADMIN"){
    router.push("/(tabs)/WaterSamplerList");
    return;
  }

  if (waterSamplers.error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Failed to load samplers</Text>
      </SafeAreaView>
    );
  }

  const confirmAssign = (userId: string, samplerId: string) => {
    Alert.alert("Confirm Assignment", "Are you sure you want to assign this sampler to this user?",[
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          mutation.mutate({userId, samplerId});
        }
      }
    ])
  }
  const confirmRemove = (userId: string, samplerId: string) => {
    Alert.alert("Confirm Removal", "Are you sure you want to remove this sampler from this user?",[
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          removeMutation.mutate({userId, samplerId});
        }
      }
    ])
  }

  return (
    <>
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
            if (waterSamplers.hasNextPage && !waterSamplers.isFetchingNextPage) {
              waterSamplers.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            waterSamplers.isFetchingNextPage ? <ActivityIndicator /> : null
          }
          renderItem={({ item }) => {
            const userSamplers = employee.data?.samplers as string[] || [] as string[];
            const status =  userSamplers.includes(item.id);
            return (
              <View style={styles.row}>
                <View style={{flex:1}}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.label}>Address</Text>
                  <Text>{item.address}</Text>

                </View>
                {
                  (
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          backgroundColor:
                            status
                              ? "#D32F2F"
                              : "#4CAF50",
                        },
                      ]}
                      onPress={status?
                        ()=>confirmRemove(employeeId, item.id)
                        :
                        ()=>confirmAssign(employeeId, item.id)
                      }
                    >
                      <Text>{status? "Unassign" : "Assign"}</Text>
                    </TouchableOpacity>
                  )
                }

              </View>
            )
          }}
        />
      </View>
    </>
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
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },

});