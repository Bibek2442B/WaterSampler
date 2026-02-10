import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RNDateTimePicker, {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase.config";

// Interfaces
import {
  ScheduleInterface,
  UserInterface
} from "@/src/interfaces";
import {useAuth} from "@/context/AuthContext";

export default function ScheduleSampler() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  // const [showPicker, setShowPicker] = useState(false);
  const [bursts, setBursts] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [loading, setLoading] = useState(false);

  const {userDoc} = useAuth();

  const opentDatePickerAndroid = () => {
    if(Platform.OS === 'android'){
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        minimumDate: new Date(),
        onChange: (_, selectedDate)=> {
          if(selectedDate) setDate(selectedDate);
        },
      })
    }
  }

  const opentTimePickerAndroid = () => {
    if(Platform.OS === 'android'){
      DateTimePickerAndroid.open({
        value: time,
        mode: "time",
        onChange: (_, selectedTime)=> {
          if(selectedTime) setTime(selectedTime);
        },
      })
    }
  }

  const combineDateTime = () => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
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

    setLoading(true);

    try {
      const combinedDateTime = combineDateTime();
      const schedule: ScheduleInterface = {
        scheduledBy: userDoc as UserInterface,
        startTime: Timestamp.fromDate(combinedDateTime),
        bursts: Number(bursts),
        intervalMinutes: Number(intervalMinutes),
      };

      const samplerRef = doc(db, "waterSamplers", id);

      await updateDoc(samplerRef, {
        schedule: schedule,
        status: "scheduled",
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Sampler</Text>

      <View style={styles.field}>
        <Text>Date</Text>
        <TouchableOpacity style={styles.input} onPress={opentDatePickerAndroid}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text>Time</Text>
        <TouchableOpacity style={styles.input} onPress={opentTimePickerAndroid}>
          <Text>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>
      </View>

      {/*{showPicker && (*/}
      {/*  <DateTimePicker*/}
      {/*    value={date}*/}
      {/*    mode="datetime"*/}
      {/*    display="default"*/}
      {/*    minimumDate={new Date()}*/}
      {/*    onChange={(_, selectedDate) => {*/}
      {/*      setShowPicker(false);*/}
      {/*      if (selectedDate) setDate(selectedDate);*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}

      {/* Bursts */}
      <TextInput
        placeholder="Number of bursts"
        keyboardType="numeric"
        style={styles.input}
        value={bursts}
        onChangeText={setBursts}
      />

      {/* Interval */}
      <TextInput
        placeholder="Interval minutes"
        keyboardType="numeric"
        style={styles.input}
        value={intervalMinutes}
        onChangeText={setIntervalMinutes}
      />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
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
});