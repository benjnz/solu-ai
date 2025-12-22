import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: 'client' | 'associate' | 'admin';
}

// Function to create a user document in Firestore
const createUserDocument = async (user: FirebaseUser, role: 'client' | 'associate' = 'client') => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      role: role,
      onboarded: false,
    });
  }
};

// Sign in with Google
export const loginWithGoogle = async (role: 'client' | 'associate'): Promise<User> => {
  const { user } = await signInWithPopup(auth, provider);
  await createUserDocument(user, role);
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return { uid: user.uid, role: userDoc.data()?.role, ...userDoc.data() } as User;
};

// Sign out
export const logout = (): Promise<void> => signOut(auth);

// Auth state listener
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          role: userDoc.data()?.role,
        });
      } else {
        // Handle case where user exists in Auth but not in Firestore
        await createUserDocument(user);
        const newUserDoc = await getDoc(doc(db, "users", user.uid));
        callback({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL,
            role: newUserDoc.data()?.role,
        });
      }
    } else {
      callback(null);
    }
  });
};
