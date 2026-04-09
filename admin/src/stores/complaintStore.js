import { create } from 'zustand';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  limit,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { rankComplaints } from '../intelligence/priorityEngine';
const useComplaintStore = create((set, get) => ({
  complaints: [],
  rankedComplaints: [],
  stats: { total: 0, pending: 0, resolved: 0, critical: 0, inProgress: 0 },
  loading: true,
  departmentFilter: null,
  subscribeAll: () => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const complaints = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const ranked = rankComplaints(complaints);
      const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === 'pending' || c.status === 'submitted').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        critical: complaints.filter((c) => c.severity === 'critical' || c.priorityScore >= 75).length,
        inProgress: complaints.filter((c) => c.status === 'inProgress' || c.status === 'assigned').length,
      };
      set({ complaints, rankedComplaints: ranked, stats, loading: false });
    });
    return unsubscribe;
  },
  subscribeByDept: (departmentId) => {
    const q = query(
      collection(db, 'complaints'),
      where('departmentId', '==', departmentId)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const complaints = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      complaints.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      const ranked = rankComplaints(complaints);
      const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === 'pending' || c.status === 'submitted').length,
        resolved: complaints.filter((c) => c.status === 'resolved').length,
        critical: complaints.filter((c) => c.severity === 'critical').length,
        inProgress: complaints.filter((c) => c.status === 'inProgress').length,
      };
      set({ complaints, rankedComplaints: ranked, stats, loading: false });
    }, () => set({ loading: false }));
    return unsubscribe;
  },
  updateStatus: async (complaintId, status, note, adminName) => {
    const ref = doc(db, 'complaints', complaintId);
    const timeline = {
      status,
      note: note || '',
      updatedBy: adminName,
      timestamp: new Date().toISOString(),
    };
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
      [`timeline.${Date.now()}`]: timeline,
    });
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().userId) {
      await addDoc(collection(db, 'notifications'), {
        userId: snap.data().userId,
        complaintId,
        type: 'statusUpdate',
        message: `Your complaint (${snap.data().ticketId}) is now ${status}.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  },
  assignComplaint: async (complaintId, assignee, deadline, notes) => {
    const ref = doc(db, 'complaints', complaintId);
    await updateDoc(ref, {
      assignedTo: assignee,
      deadline: deadline || null,
      assignmentNotes: notes || '',
      status: 'assigned',
      updatedAt: serverTimestamp(),
    });
  },
  escalateComplaint: async (complaintId, reason) => {
    const ref = doc(db, 'complaints', complaintId);
    await updateDoc(ref, {
      status: 'escalated',
      escalationReason: reason,
      escalatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
  addAdminComplaint: async (data) => {
    const ticketId = 'ADM-' + Date.now().toString(36).toUpperCase();
    await addDoc(collection(db, 'complaints'), {
      ...data,
      ticketId,
      source: 'admin',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
}));
export default useComplaintStore;
