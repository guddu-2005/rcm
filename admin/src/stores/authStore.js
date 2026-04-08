import { create } from 'zustand';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null,
  loading: true,
  error: null,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'adminUsers', firebaseUser.uid));
          const profile = snap.exists() ? snap.data() : null;
          set({
            user: firebaseUser,
            profile,
            role: profile?.role || 'department',
            loading: false,
            error: null,
          });
        } catch {
          set({ user: firebaseUser, profile: null, role: null, loading: false });
        }
      } else {
        set({ user: null, profile: null, role: null, loading: false });
      }
    });
    return unsubscribe;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null, role: null });
  },
}));

export default useAuthStore;
