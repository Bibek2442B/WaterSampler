import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView, KeyboardAvoidingView
} from "react-native";
import {useEffect, useState} from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {doc, updateDoc} from "firebase/firestore";
import { db } from "@/firebase.config";
import {Picker} from '@react-native-picker/picker';

import {
  SamplerInterface,
} from "@/src/interfaces";
import {useQuery} from "@tanstack/react-query";
import {SamplerMachine} from "@/src/queries/SamplerMachine";
import {useNavigation} from "@react-navigation/native";

export default function ScheduleSampler() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [week,setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState<Date>(new Date());
  const [bursts, setBursts] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const {data, isLoading, error, refetch} = useQuery<SamplerInterface, Error, SamplerInterface, string[]>({
    queryKey: ["sampler", id] as [string, string],
    queryFn: SamplerMachine,
    enabled: !!id,
    retry: 3,
    retryDelay: 2000,
  })

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.name || "Water Sampler",
    });
  }, [data]);

  const openTimePickerAndroid = () => {
    if(Platform.OS === 'android'){
      DateTimePickerAndroid.open({
        value: time,
        mode: "time",
        display: "spinner",
        onChange: (_, selectedTime)=> {
          if(selectedTime) setTime(selectedTime);
        },
      })
    }
  }

  const handleSchedule = async () => {
    if (!bursts || !intervalMinutes) {
      Alert.alert("Validation Error", "Bursts and interval minutes are required");
      return;
    }

    if (Number(bursts) <= 0 || Number(intervalMinutes) <= 0) {
      Alert.alert("Validation Error", "Values must be greater than zero");
      return;
    }

    if (week<1 || week>4) {
      Alert.alert("Please select week of month");
      return;
    }
    if (day<1 || day>7) {
      Alert.alert("Please select day of week");
      return;
    }
    if(parseInt(bursts)<1 || parseInt(bursts)>20) {
      Alert.alert("Number of samples must be between 1 and 20");
      return;
    }
    if(parseInt(intervalMinutes)<10 || parseInt(intervalMinutes)>140) {
      Alert.alert("Interval must be between 10 and 140 minutes");
      return;
    }

    setLoading(true);

    try {
      console.log(data?.ip);
      await fetch(`http://${data?.ip}:3000/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: time.toISOString(),
          burst: parseInt(bursts),
          interval: parseInt(intervalMinutes),
          volume: parseFloat(volume),
          week: week,
          day: day,
        }),
      })

      await refetch();

      const samplerRef = doc(db, "waterSamplers", id);
      await updateDoc(samplerRef, {
        schedule: data?.schedule,
        status: "SCHEDULED",
      });

      Alert.alert("Success", "Sampler scheduled successfully");
      router.back();
    } catch (error) {
      console.error("Schedule error:", error);
      Alert.alert("Error", "Failed to schedule sampler");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Connecting to Sampler...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconCircle}>
          <Text style={{ fontSize: 40 }}>⚠️</Text>
        </View>

        <Text style={styles.errorTitle}>Connection Failed</Text>

        <Text style={styles.errorMessage}>
          Could not reach the sampler at {data?.ip || 'the specified IP'}.
          Ensure you are on the same WiFi network.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <View style={styles.container}>
            <Text style={styles.title}>Schedule Sampler</Text>
            <View style={styles.field}>
              <Text>Week of Month</Text>
              <Picker
                selectedValue={week}
                onValueChange={(itemValue)=>setWeek(itemValue)}
                mode="dropdown"
              >
                <Picker.Item label="Select Week of Month" value="0" style={{color: "#888"}} />
                <Picker.Item label="1st Week of Month" value="1" />
                <Picker.Item label="2nd Week of Month" value="2" />
                <Picker.Item label="3rd Week of Month" value="3" />
                <Picker.Item label="4th Week of Month" value="4" />
              </Picker>
            </View>
            <View style={styles.field}>
              <Text>Day of Week</Text>
              <Picker
                selectedValue={day}
                onValueChange={(itemValue)=>setDay(itemValue)}
                mode="dropdown"
              >
                <Picker.Item label="Select Day of Week" value="0" style={{color: "#888"}} />
                <Picker.Item label="Sunday" value="1" />
                <Picker.Item label="Monday" value="2" />
                <Picker.Item label="Tuesday" value="3" />
                <Picker.Item label="Wednesday" value="4" />
                <Picker.Item label="Thursday" value="5" />
                <Picker.Item label="Friday" value="6" />
                <Picker.Item label="Saturday" value="7" />
              </Picker>
            </View>

            <View style={styles.field}>
              <Text>Time</Text>
              <TouchableOpacity style={styles.input} onPress={openTimePickerAndroid}>
                <Text>
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text>Number of Samples</Text>
              <TextInput
                placeholder="From 1 - 20"
                keyboardType="numeric"
                style={styles.input}
                value={bursts}
                onChangeText={setBursts}
              />
            </View>

            <View style={styles.field}>
              <Text>Interval in Minutes</Text>
              <TextInput
                placeholder="From 10 - 140 minutes"
                keyboardType="numeric"
                style={styles.input}
                value={intervalMinutes}
                onChangeText={setIntervalMinutes}
              />
            </View>

            <View style={styles.field}>
              <Text>Volume per Sample</Text>
              <TextInput
                placeholder="From 25ml to 250ml"
                keyboardType="numeric"
                style={styles.input}
                value={volume}
                onChangeText={setVolume}
              />
            </View>


            <TouchableOpacity
              style={styles.button}
              onPress={handleSchedule}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Scheduling..." : "Schedule Sampler"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>

  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  container: {
    flexGrow: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  field: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#50A0F1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F0', // Light red
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D32F2F', // Error Red
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#4B4B4B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
});