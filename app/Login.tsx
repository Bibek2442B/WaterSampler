import {Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator} from "react-native";
import {useEffect, useState} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {sendPasswordResetEmail, signInWithEmailAndPassword, User} from "firebase/auth";
// @ts-ignore
import {auth} from "@/firebase.config";
import {Link} from "expo-router";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <SafeAreaView style={styles.container}>
        <Text style={[styles.loginText,{color: 'red'}]}>Water Sampler</Text>
        <Text style={styles.loginText}>Login</Text>
        {error && <Text style={{color: 'red'}}>{error}</Text>}

        <Text style={styles.text}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={"Enter your email address "}
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.text}> Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          placeholder={"Enter your password "}
          placeholderTextColor={"gray"}
          value={password}
          onChangeText={setPassword}
        />
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
        {error==='Please verify your email address' && <Text style={{color: 'red'}}>Please verify your email address</Text>}
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
    width: '80%',
    height: 50,
    borderWidth: 2,
    borderColor: "black",
    marginBottom: 20,
    borderRadius: 20,
    padding: 10,
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

