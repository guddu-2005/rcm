
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc } = require('firebase/firestore')
const firebaseConfig = {
  apiKey: "AIzaSyAECw9foiA16-QNnnBYIbURDYfyzBTTBGA",
  authDomain: "public-grivance-portal.firebaseapp.com",
  projectId: "public-grivance-portal",
  storageBucket: "public-grivance-portal.firebasestorage.app",
  messagingSenderId: "760260395924",
  appId: "1:760260395924:web:8224deebd52e107f884581",
}
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const CATEGORIES = ['water', 'electricity', 'road', 'health', 'sanitation', 'fire', 'police', 'parks']
const PRIORITIES = ['P1', 'P2', 'P3']
const STATUSES = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'escalated']
const WARDS = ['Bapuji Nagar', 'Saheed Nagar', 'Jaydev Vihar', 'Nayapalli', 'Khandagiri', 'Rasulgarh', 'Patia', 'Unit-4', 'Mancheswar', 'Chandrasekharpur']
const COMPLAINTS = [
  { title: 'Water pipeline burst near school gate', category: 'water', priority: 'P1', score: 87, ward: 'Unit-4' },
  { title: 'Large pothole causing road accidents on MG Road', category: 'road', priority: 'P1', score: 82, ward: 'Saheed Nagar' },
  { title: 'Power outage for 3 days in residential colony', category: 'electricity', priority: 'P2', score: 68, ward: 'Nayapalli' },
  { title: 'Garbage not collected for 2 weeks in ward 15', category: 'sanitation', priority: 'P2', score: 55, ward: 'Jaydev Vihar' },
  { title: 'Gas leak smell detected near apartment building', category: 'fire', priority: 'P1', score: 91, ward: 'Khandagiri' },
  { title: 'Stagnant water breeding mosquitoes in park', category: 'health', priority: 'P2', score: 61, ward: 'Bapuji Nagar' },
  { title: 'Broken street light creating danger at night', category: 'electricity', priority: 'P3', score: 38, ward: 'Rasulgarh' },
  { title: 'Sewage overflow on residential street', category: 'water', priority: 'P1', score: 85, ward: 'Patia' },
  { title: 'Tree fallen blocking main road after storm', category: 'road', priority: 'P1', score: 88, ward: 'Mancheswar' },
  { title: 'Public toilet facility not functional', category: 'sanitation', priority: 'P3', score: 32, ward: 'Chandrasekharpur' },
  { title: 'Water supply contaminated with mud', category: 'water', priority: 'P2', score: 72, ward: 'Nayapalli' },
  { title: 'Electric pole tilted and may fall on road', category: 'electricity', priority: 'P1', score: 89, ward: 'Saheed Nagar' },
  { title: 'Hospital road full of potholes hindering ambulances', category: 'road', priority: 'P1', score: 93, ward: 'Unit-4' },
  { title: 'Dog menace in park endangering children', category: 'police', priority: 'P2', score: 58, ward: 'Jaydev Vihar' },
  { title: 'Garbage dumping near drinking water source', category: 'sanitation', priority: 'P2', score: 67, ward: 'Khandagiri' },
  { title: 'Flood water entering homes in low-lying area', category: 'water', priority: 'P1', score: 90, ward: 'Rasulgarh' },
  { title: 'Missing manhole cover causing accidents', category: 'road', priority: 'P1', score: 86, ward: 'Bapuji Nagar' },
  { title: 'Noise pollution from illegal loudspeakers at night', category: 'police', priority: 'P3', score: 35, ward: 'Patia' },
  { title: 'Park playground equipment broken and dangerous', category: 'parks', priority: 'P3', score: 29, ward: 'Saheed Nagar' },
  { title: 'Dengue cases rising due to uncleared pool', category: 'health', priority: 'P1', score: 88, ward: 'Mancheswar' },
]
const rand = arr => arr[Math.floor(Math.random() * arr.length)]
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
async function seed() {
  console.log('🚀 Seeding UGIRP complaints...\n')
  for (let i = 0; i < COMPLAINTS.length; i++) {
    const template = COMPLAINTS[i]
    const status = i < 5 ? 'submitted' : i < 10 ? 'in_progress' : i < 15 ? 'assigned' : i < 18 ? 'resolved' : 'escalated'
    const daysOld = Math.floor(Math.random() * 14)
    const createdAt = daysAgo(daysOld)
    const doc = {
      ticketId: `${template.category.toUpperCase().slice(0,3)}-${Date.now().toString(36).toUpperCase().slice(-4)}${i}`,
      title: template.title,
      description: `Reported issue: ${template.title}. This requires immediate attention from the concerned department. Multiple residents have been affected. Please resolve urgently.`,
      category: template.category,
      priority: template.priority,
      priorityScore: template.score,
      status,
      sentiment: template.priority === 'P1' ? 'urgent' : template.priority === 'P2' ? 'negative' : 'neutral',
      location: {
        lat: 20.2961 + (Math.random() - 0.5) * 0.1,
        lng: 85.8245 + (Math.random() - 0.5) * 0.1,
        address: `${template.ward}, Bhubaneswar`,
        ward: template.ward,
      },
      mediaUrls: [],
      reportCount: Math.floor(Math.random() * 20) + 1,
      upvotes: Math.floor(Math.random() * 50),
      userId: `seed_user_${i % 5}`,
      userName: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sita Devi', 'Rohit Singh'][i % 5],
      userPhone: `98765${String(43210 + i).padStart(5, '0')}`,
      assignedDept: template.category,
      slaDeadline: new Date(new Date(createdAt).getTime() + (template.priority === 'P1' ? 24 : template.priority === 'P2' ? 72 : 168) * 3600000).toISOString(),
      slaBreached: daysOld > (template.priority === 'P1' ? 1 : template.priority === 'P2' ? 3 : 7) && status !== 'resolved',
      resolvedAt: status === 'resolved' ? daysAgo(Math.floor(Math.random() * daysOld)) : null,
      timeline: [
        {
          id: '1',
          status: 'submitted',
          note: 'Complaint submitted. AI analysis complete.',
          updatedBy: 'System (AI)',
          timestamp: createdAt,
        },
        ...(status !== 'submitted' ? [{
          id: '2',
          status: 'under_review',
          note: 'Complaint reviewed and assigned to department.',
          updatedBy: 'System',
          timestamp: daysAgo(daysOld - 1),
        }] : []),
        ...(status === 'resolved' ? [{
          id: '3',
          status: 'resolved',
          note: 'Issue resolved. Verified by department officer.',
          updatedBy: 'Officer',
          timestamp: daysAgo(0),
        }] : []),
      ],
      aiAnalysis: {
        category: template.category,
        confidence: 0.85 + Math.random() * 0.13,
        priority: template.priority,
        priorityScore: template.score,
        sentiment: template.priority === 'P1' ? 'urgent' : 'negative',
        urgency: template.priority === 'P1' ? 0.9 : template.priority === 'P2' ? 0.6 : 0.3,
        keywords: [template.category, 'complaint', 'municipal', 'urgent'].slice(0, 3),
      },
      createdAt,
      updatedAt: createdAt,
    }
    await addDoc(collection(db, 'ugirp_complaints'), doc)
    console.log(`✅ ${i + 1}/${COMPLAINTS.length}: ${template.title.slice(0, 50)}`)
  }
  console.log('\n✨ Seed complete! Visit http://localhost:3000')
  process.exit(0)
}
seed().catch(e => { console.error(e); process.exit(1) })
