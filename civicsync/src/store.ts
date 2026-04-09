import { create } from 'zustand'
import { LS, type Complaint, type Priority, type ComplaintStatus, type Department } from './types'
import { lsGet, lsSet, getComplaints } from './storage'

export interface VoiceCommandData {
  title?: string;
  description?: string;
  category?: string;
  triggerLocation?: boolean;
}

export interface AdminCommandData {
  searchQuery?: string;
  filterStatus?: ComplaintStatus | 'All';
  filterPriority?: Priority | 'All';
  filterDept?: Department | 'All';
  runDedup?: boolean;
}

interface Session {
  role: 'citizen' | 'admin' | 'department' | 'worker'
  userId: string
  name: string
  email: string
  department?: string
}

interface AppStore {
  session: Session | null
  complaints: Complaint[]

  // Auth
  login: (session: Session) => void
  logout: () => void

  // Complaints (reactive)
  loadComplaints: () => void
  refreshComplaints: () => void

  // Voice Bridge
  voiceCommandData: VoiceCommandData | null
  setVoiceCommandData: (data: VoiceCommandData | null) => void
  adminCommandData: AdminCommandData | null
  setAdminCommandData: (data: AdminCommandData | null) => void
}

export const useStore = create<AppStore>((set) => ({
  session: lsGet<Session | null>(LS.SESSION, null),
  complaints: getComplaints(),

  login: (session) => {
    lsSet(LS.SESSION, session)
    set({ session })
  },

  logout: () => {
    localStorage.removeItem(LS.SESSION)
    set({ session: null })
  },

  loadComplaints: () => {
    set({ complaints: getComplaints() })
  },

  refreshComplaints: () => {
    set({ complaints: getComplaints() })
  },

  voiceCommandData: null,
  setVoiceCommandData: (data) => set({ voiceCommandData: data }),
  adminCommandData: null,
  setAdminCommandData: (data) => set({ adminCommandData: data }),
}))
