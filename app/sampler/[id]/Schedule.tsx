import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase.config";
import {Picker} from '@react-native-picker/picker';

import {
  ScheduleInterface,
  UserInterface
} from "@/src/interfaces";
import {useAuth} from "@/context/AuthContext";

export default function ScheduleSampler() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [week,setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
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
        display: "spinner",
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
        <TouchableOpacity style={styles.input} onPress={opentTimePickerAndroid}>
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