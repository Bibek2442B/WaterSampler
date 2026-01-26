import {Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, View} from "react-native";
// import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
// @ts-ignore
import {auth, db} from "@/firebase.config";
import {createUserWithEmailAndPassword, sendEmailVerification, User} from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";
import {Link} from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setRegisterSuccess(false);
    setErrorMsg("");
  },[email, password, repeatPassword]);

  const handleRegisterButton = async() => {
    if(!(password === repeatPassword)){
      setErrorMsg("The passwords do not match");
      return;
    }
    if(password.length < 8){
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    const user={
      email: email,
      role: "user",
    }
    try {
      setLoading(true);
      // @ts-ignore
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      try{
        //@ts-ignore
        auth.signOut();
      }
      catch (e) {
        
      }
      const uid = userCredential.user.uid;
      await sendEmailVerification(userCredential.user);
      await setDoc(doc(db, "users",uid), user);
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      setRegisterSuccess(true);
      setLoading(false);
      alert("Successfully registered! Please verify your email and login.");
    }catch (error) {
      console.error("Error during registration:", error);
      // @ts-ignore
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMsg('This email is already registered!');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Invalid email address!');
          break;
        case 'auth/weak-password':
          setErrorMsg('Password should be at least 6 characters!');
          break;
        case 'auth/missing-password':
          setErrorMsg('Password is required!');
          break;
        case 'auth/missing-email':
          setErrorMsg('Email is required!');
          break;
        case 'auth/account-exists-with-different-credential':
          setErrorMsg('This email is already registered!');
          break;
        default:
          setErrorMsg("Unexpected Error!!!!!! Please Contact Support");
      }
    }finally {
      setLoading(false);
    }
  }

  return(
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={[styles.loginText,{color: 'red'}]}>Water Sampler</Text>
        <Text style={styles.loginText}>Register</Text>
        {errorMsg&& <Text style={{color: 'red'}}>{errorMsg}</Text> }
        {registerSuccess && <Text style={{color: 'green'}}>Registration Successful</Text>}
        <Text style={styles.text}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={"Enter your email address "}
            placeholderTextColor={"gray"}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <Text style={styles.text}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            placeholder={"Enter your password "}
            placeholderTextColor={"gray"}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.inputRightTouchable}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" style={styles.inputIconRight} />
          </TouchableOpacity>
        </View>
        <Text style={styles.text}>Repeat Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            secureTextEntry={!showRepeatPassword}
            placeholder={"Confirm Password"}
            placeholderTextColor={"gray"}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
          />
          <TouchableOpacity onPress={() => setShowRepeatPassword(s => !s)} style={styles.inputRightTouchable}>
            <Ionicons name={showRepeatPassword ? "eye-off" : "eye"} size={20} color="gray" style={styles.inputIconRight} />
          </TouchableOpacity>
        </View>
        {loading?
          <ActivityIndicator size="large"/>
          :
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegisterButton}
            >
              <Text style={styles.text}>Register</Text>
            </TouchableOpacity>
            <Text style={styles.text}>Already Registered?</Text>
            <Link dismissTo href={"/Login"}><Text style={[styles.text, styles.link]}>Login</Text></Link>
          </>
        }
      </SafeAreaView>
    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  container:{
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText:{
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text:{
    fontSize: 20,
  },
  input:{
    flex: 1,
    height: 50,
    paddingLeft: 8,
  },
  inputContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 2,
    borderColor: 'black',
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputRightTouchable: {
    padding: 6,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  button:{
    width: '80%',
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgreen",
    padding: 15,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 60,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  lightText:{
    color: "gray",
  },
  link:{
    color: "blue",
  }
});

