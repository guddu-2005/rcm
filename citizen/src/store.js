import { create } from 'zustand';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const useStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  activeTab: 'home',

  init: () => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        set({ user: u, profile: snap.exists() ? snap.data() : null, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  // Demo login with email (for testing without phone OTP)
  loginEmail: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    set({ user: cred.user, profile: snap.exists() ? snap.data() : null });
  },

  registerEmail: async (name, phone, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = { name, phone, email, createdAt: serverTimestamp(), totalComplaints: 0 };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    set({ user: cred.user, profile });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  setTab: (tab) => set({ activeTab: tab }),

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    set({ profile: { ...get().profile, ...data } });
  },
}));

export default useStore;
