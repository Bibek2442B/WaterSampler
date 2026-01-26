import {Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, View, Image} from "react-native";
import {useEffect, useState} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import {sendPasswordResetEmail, signInWithEmailAndPassword, User} from "firebase/auth";
// @ts-ignore
import {auth} from "@/firebase.config";
import {Link} from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setError('');
  },[email,password]);

  const handlePasswordReset = async () => {
    setLoading(true);
    if (!email) {
      setError("Email is required");
      setLoading(false);
      return
    }
    try{
      // @ts-ignore
      await sendPasswordResetEmail(auth, email);
      alert("Check your email to reset your password");
      setEmail("");
    }
    catch(error)  {
      // @ts-ignore
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError("Error sending password reset");
      }
      console.error("Error sending password reset:", error);
    };
    setLoading(false);
  }

  const handleLoginButton = async() => {
    setLoading(true);
    if (!email || !password) {
      setError("Input fields are required");
      setLoading(false);
      return;
    }

    try{
      // @ts-ignore
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      if(!userCredentials.user.emailVerified){
        // @ts-ignore
        await auth.signOut();
        setError('Please verify your email address');
        setLoading(false);
        return;
      }
      setUser(userCredentials.user);
      setEmail('');
      setPassword('');
    }catch (error) {
      //@ts-ignore
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/missing-email':
          setError('Email is required');
          break;
        case 'auth/missing-password':
          setError('Password is required');
          break;
        case 'auth/invalid-credential':
          setError('Invalid credential');
          break;
        default:
          setError('An error occurred during login');
          console.error("Error during login:", error);
      }
    }finally{
      setLoading(false);
    }
  }
  // @ts-ignore
  return(
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1}}>
        <LinearGradient
          colors={["#59667E", "#D4E3FF", "#858E9F"]}
          start={[0.5, 0]}
          end={[0.5, 1]}
          locations={[0.11, 0.53, 0.92]}
          style={styles.container}
        >
        {/* <Image source={require('../assets/images/aguadonorte.png')} style={styles.image} /> */}
        <Text style={[styles.loginText,{color: 'red'}]}>Water Sampler</Text>
          <Text style={styles.loginText}>Login</Text>
          {error && <Text style={{color: 'red'}}>{error}</Text>}

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
          <Text style={styles.text}> Password</Text>
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
          {
            loading? (
              <ActivityIndicator size="large" />
            ) :(
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLoginButton}
                >
                  <Text style={styles.text}>Login</Text>
                </TouchableOpacity>
                <Text style={styles.text}>Not Registered Yet?</Text>
                <Link href={"/Register"}><Text style={[styles.text, styles.link]}>Register</Text></Link>
                <Text style={styles.text}>Forgot Password</Text>
                <TouchableOpacity onPress={handlePasswordReset}><Text style={[styles.text, styles.link]}>Reset Password</Text></TouchableOpacity>
              </>
            )
          }
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
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
  },

});

