import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
// @ts-ignore
import { auth, db } from "@/firebase.config";

type AuthContextType = {
  user: User | null;
  userDoc: any | null;
  loading: boolean;
  isRegistering: boolean;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const unsub = auth.onAuthStateChanged(async (firebaseUser: User | null) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setUserDoc(data);
          
          // Sync emailVerified from Firebase Auth to Firestore if needed
          if (firebaseUser.emailVerified && !data.emailVerified) {
            await updateDoc(ref, { emailVerified: true });
            // Refresh the userDoc
            const updatedSnap = await getDoc(ref);
            setUserDoc(updatedSnap.data());
          }
        } else {
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

 const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      // @ts-ignore
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Reload to get the latest emailVerified status from Firebase Auth
      await cred.user.reload();
      
      // Get fresh user data
      // @ts-ignore
      const freshUser = auth.currentUser;
      
      if (!freshUser) {
        throw new Error("Authentication failed");
      }

      // Check if email is verified in Firebase Auth
      if (!freshUser.emailVerified) {
        // @ts-ignore
        await signOut(auth);
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Please verify your email before logging in");
      }

      // Get user document from Firestore
      const ref = doc(db, "users", freshUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // @ts-ignore
        await signOut(auth);
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("User data not found");
      }

      const userData = snap.data();

      // Sync emailVerified status to Firestore if needed
      if (!userData.emailVerified) {
        await updateDoc(ref, { emailVerified: true });
      }

      // Check admin approval (skip check for ADMIN role)
      if (userData.role !== "ADMIN" && !userData.approvedByAdmin) {
        // @ts-ignore
        await signOut(auth);
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Waiting for admin approval");
      }

      // Success - user will be set by onAuthStateChanged
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

 const register = async (name: string, email: string, password: string) => {
    setIsRegistering(true);
    try {
      // @ts-ignore
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(cred.user);

      // Create user document in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role: "USER",
        emailVerified: false,
        approvedByAdmin: false,
        createdAt: serverTimestamp(),
      });

      // Sign out and ensure state updates before returning
      // @ts-ignore
      await signOut(auth);
      
      // Set a longer delay to ensure Firebase auth listener completes
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async () => {
    // @ts-ignore
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, userDoc, loading, isRegistering, isLoggingIn, login, register, logout }}
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
