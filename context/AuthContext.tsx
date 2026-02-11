import {createContext, ReactNode, useContext, useEffect, useState,} from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {doc, getDoc, serverTimestamp, setDoc, updateDoc,} from "firebase/firestore";
import {auth, db} from "@/firebase.config";
import {AuthContextInterface, UserInterface} from "@/src/interfaces";
import {ActivityIndicator, View} from "react-native";

const AuthContext = createContext<AuthContextInterface | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);


  useEffect(() => {
    return auth.onAuthStateChanged(async (firebaseUser: User | null) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as UserInterface;
          setUserDoc(data);

          if (firebaseUser.emailVerified && !data.emailVerified) {
            await updateDoc(ref, {emailVerified: true});
            const updatedSnap = await getDoc(ref);
            setUserDoc(updatedSnap.data() as UserInterface);
          }
        } else {
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
  }, []);

 const login = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await cred.user.reload();
      const freshUser = auth.currentUser;
      
      if (!freshUser) {
        throw new Error("Authentication failed");
      }

      if (!freshUser.emailVerified) {
        await signOut(auth);
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Please verify your email before logging in");
      }

      const ref = doc(db, "users", freshUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await signOut(auth);
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("User data not found");
      }

      const userData = snap.data();

      if (!userData.emailVerified) {
        await updateDoc(ref, { emailVerified: true });
      }

      if (userData.role !== "ADMIN" && !userData.approvedByAdmin) {
        await signOut(auth);
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Waiting for admin approval");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } 
    finally {
      setAuthLoading(false);
    }
  };

 const register = async (name: string, email: string, password: string) => {
   setAuthLoading(true);
   try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(cred.user);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: name.trim() === "" ? "Anonymous" : name,
        email: email,
        role: "VIEWER",
        emailVerified: false,
        approvedByAdmin: false,
        createdAt: serverTimestamp(),
      });

      await signOut(auth);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } 
    finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    await signOut(auth);
    setAuthLoading(false);
  };

  const contextValue = {
    user: user,
    userDoc: userDoc,
    loading: authLoading,
    login: login,
    register: register,
    logout: logout,
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
