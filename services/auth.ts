import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Import the initialized instances

const provider = new GoogleAuthProvider();
const ADMIN_EMAIL = 'benedictjonez@gmail.com';

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: 'client' | 'associate' | 'admin';
  onboarded?: boolean;
  companyDetails?: {
    name: string;
    industry: string;
    size: string;
    contactName: string;
    contactEmail: string;
    goals: string;
    compliance?: string;
    esg_focus?: string;
  };
}

// Function to create a user document in Firestore
const createUserDocument = async (user: FirebaseUser, role: 'client' | 'associate' = 'client', displayName?: string) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    // Determine random avatar if no photoURL
    let avatarUrl = user.photoURL || null;
    if (!avatarUrl) {
      const randomIndex = Math.floor(Math.random() * 2) + 1;
      avatarUrl = `/avatars/ai_avatar_${randomIndex}.png`;
    }

    await setDoc(userRef, {
      name: displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous',
      email: user.email,
      avatar: avatarUrl,
      role: user.email === ADMIN_EMAIL ? 'admin' : role,
      onboarded: false,
    });
  }
};

// Sign in with Google
export const login = async (role: 'client' | 'associate'): Promise<User> => {
  const { user } = await signInWithPopup(auth, provider);
  await createUserDocument(user, role);
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();
  return { 
    uid: user.uid, 
    name: data?.name || user.displayName,
    email: data?.email || user.email,
    avatar: data?.avatar || user.photoURL,
    role: user.email === ADMIN_EMAIL ? 'admin' : (data?.role || role)
  } as User;
};

// Sign in with Email
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();
  return { 
    uid: user.uid, 
    name: data?.name || user.displayName,
    email: data?.email || user.email,
    avatar: data?.avatar || user.photoURL,
    role: (email === ADMIN_EMAIL) ? 'admin' : data?.role
  } as User;
};

// Sign up with Email
export const registerWithEmail = async (email: string, password: string, role: 'client' | 'associate' = 'client', name?: string): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(user, role, name);
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();
  return { 
    uid: user.uid, 
    name: data?.name || name || user.displayName,
    email: data?.email || user.email,
    avatar: data?.avatar || user.photoURL,
    role: (email === ADMIN_EMAIL) ? 'admin' : (data?.role || role)
  } as User;
};

// Sign out
export const logout = (): Promise<void> => signOut(auth);

// Auth state listener
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      if (userDoc.exists()) {
        callback({
          uid: user.uid,
          name: userData?.name || user.displayName,
          email: userData?.email || user.email,
          avatar: userData?.avatar || user.photoURL,
          role: user.email === ADMIN_EMAIL ? 'admin' : userData?.role,
          onboarded: userData?.onboarded || false,
          companyDetails: userData?.companyDetails
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
            role: user.email === ADMIN_EMAIL ? 'admin' : newUserDoc.data()?.role,
        });
      }
    } else {
      callback(null);
    }
  });
};
