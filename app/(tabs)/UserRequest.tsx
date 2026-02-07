import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useEffect, useState } from 'react'
import { auth, db } from '@/firebase.config'
import {
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
import { useRouter } from 'expo-router'

export default function UserRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
  const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        checkAdminAndLoad()
      } else {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])


  const checkAdminAndLoad = async () => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      setLoading(false)
      return
    }

    // Check admin role
    const adminSnap = await getDoc(doc(db, 'users', uid))
    if (!adminSnap.exists() || adminSnap.data().role !== 'admin') {
      Alert.alert('Access denied')
      router.replace('/Dashboard')
      setLoading(false)
      return
    }

    loadRequests()
  }

  const loadRequests = async () => {
    setLoading(true)

    // Pending users = registration requests
    const q = query(
      collection(db, 'users'),
      where('approved', '==', false),
      where('blocked', '==', false)
    )

    const snap = await getDocs(q)
    const data = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }))

    setRequests(data)
    setLoading(false)
  }

  const acceptUser = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      approved: true,
    })
    Alert.alert('User approved')
    loadRequests()
  }

  const declineUser = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      blocked: true,
    })
    Alert.alert('User declined')
    loadRequests()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Registration Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : requests.length === 0 ? (
        <Text>No pending requests</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.email}>{item.email}</Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.accept]}
                  onPress={() => acceptUser(item.id)}
                >
                  <Text>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.decline]}
                  onPress={() => declineUser(item.id)}
                >
                  <Text>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  email: { fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  accept: { backgroundColor: 'lightgreen' },
  decline: { backgroundColor: 'salmon' },
})
