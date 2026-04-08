/**
 * Firebase Seed Script
 * Run: node seed.js
 * Seeds sample complaints and admin users for demo purposes
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyAECw9foiA16-QNnnBYIbURDYfyzBTTBGA",
  authDomain: "public-grivance-portal.firebaseapp.com",
  projectId: "public-grivance-portal",
  storageBucket: "public-grivance-portal.firebasestorage.app",
  messagingSenderId: "760260395924",
  appId: "1:760260395924:web:8224deebd52e107f884581",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SAMPLE_COMPLAINTS = [
  { title: 'Major water pipeline burst near school', description: 'Large water pipeline burst near Government Primary School, causing flooding on road. Multiple shops affected. Water supply cut for 3 days.', category: 'water', severity: 'critical', location: { lat: 20.5937, lng: 78.9629, area: 'Station Road', address: 'Near Govt School, Station Road' }, reportCount: 12, status: 'submitted', populationImpact: 45 },
  { title: 'Street light outage on main highway', description: 'All streetlights from Police Chowki to Bus Stand have been non-functional for 5 days. Accidents happening at night.', category: 'electricity', severity: 'high', location: { lat: 20.5940, lng: 78.9635, area: 'Market Area', address: 'Main Highway, Market Area' }, reportCount: 7, status: 'underReview', populationImpact: 200 },
  { title: 'Large pothole causing accidents', description: 'Dangerous pothole (2 feet deep) near hospital junction. 2 bike accidents already happened this week.', category: 'road', severity: 'high', location: { lat: 20.5945, lng: 78.9620, area: 'Hospital Zone', address: 'Hospital Junction Road' }, reportCount: 22, status: 'assigned', populationImpact: 500 },
  { title: 'Garbage pile near residential area for 10 days', description: 'No garbage collection for 10+ days. Foul smell spreading. Health risk to nearby residents, especially children.', category: 'sanitation', severity: 'medium', location: { lat: 20.5930, lng: 78.9640, area: 'Ashok Nagar', address: 'Block B, Ashok Nagar' }, reportCount: 5, status: 'pending', populationImpact: 80 },
  { title: 'Illegal water pipeline connection', description: 'Someone has drilled into the main water supply pipeline illegally, causing low water pressure for the entire block.', category: 'water', severity: 'medium', location: { lat: 20.5950, lng: 78.9615, area: 'Gandhi Nagar', address: 'Gandhi Nagar Colony' }, reportCount: 3, status: 'inProgress', populationImpact: 30 },
  { title: 'Gas leakage reported in apartment', description: 'Strong gas smell from LPG pipeline in building basement. Residents evacuated. Emergency services called but no response.', category: 'gas', severity: 'critical', location: { lat: 20.5935, lng: 78.9650, area: 'New Extension', address: 'Sunrise Apartments, New Extension' }, reportCount: 18, status: 'escalated', populationImpact: 120 },
  { title: 'Clogged drain causing waterlogging', description: 'Main drainage channel is clogged with debris. Water is overflowing onto road during rains. Vehicles cannot pass.', category: 'flood', severity: 'high', location: { lat: 20.5925, lng: 78.9625, area: 'Old Town', address: 'Old Town Main Drain, Ring Road' }, reportCount: 9, status: 'submitted', populationImpact: 350 },
  { title: 'Broken electricity pole on footpath', description: 'Electricity pole has fallen on footpath. Live wires are exposed. Very dangerous for pedestrians. Children walk here daily.', category: 'electricity', severity: 'critical', location: { lat: 20.5942, lng: 78.9618, area: 'Civil Lines', address: 'Civil Lines Park Road' }, reportCount: 31, status: 'submitted', populationImpact: 800 },
  { title: 'Stray dogs menace near school', description: 'Pack of 15+ aggressive stray dogs near Primary School. Children are afraid to come to school. One child bitten last week.', category: 'animal', severity: 'high', location: { lat: 20.5948, lng: 78.9645, area: 'Sector 1', address: 'Govt Primary School, Sector 1' }, reportCount: 8, status: 'pending', populationImpact: 60 },
  { title: 'Water supply contaminated with mud', description: 'Brown, muddy water coming from taps since yesterday. Residents cannot use water for drinking or cooking.', category: 'water', severity: 'high', location: { lat: 20.5932, lng: 78.9632, area: 'Sector 2', address: 'Sector 2, Block A' }, reportCount: 15, status: 'underReview', populationImpact: 200 },
  { title: 'Road construction damage – still unrepaired', description: 'Contractor dug up road for pipeline work 3 months ago but never repaired it. Deep trenches causing accidents daily.', category: 'road', severity: 'medium', location: { lat: 20.5960, lng: 78.9628, area: 'Bus Stand', address: 'Bus Stand Approach Road' }, reportCount: 4, status: 'resolved', populationImpact: 1500 },
  { title: 'Public toilet facility locked permanently', description: 'The public toilet near the market has been locked for 2 weeks by the contractor. Citizens forced to use open spaces.', category: 'sanitation', severity: 'medium', location: { lat: 20.5938, lng: 78.9660, area: 'Market Area', address: 'Weekly Market Area' }, reportCount: 6, status: 'pending', populationImpact: 2000 },
];

const ADMIN_ACCOUNTS = [
  { email: 'superadmin@grievanceiq.ai', password: 'Admin@123', name: 'Super Admin', role: 'superAdmin' },
  { email: 'roads@grievanceiq.ai', password: 'Dept@123', name: 'Roads Department', role: 'department', department: 'road' },
  { email: 'water@grievanceiq.ai', password: 'Dept@123', name: 'Water Supply', role: 'department', department: 'water' },
  { email: 'power@grievanceiq.ai', password: 'Dept@123', name: 'Electricity Dept', role: 'department', department: 'electricity' },
];

const CITIZEN_ACCOUNTS = [
  { email: 'rahul@citizen.in', password: 'Pass@123', name: 'Rahul Sharma', phone: '9876543210' },
  { email: 'priya@citizen.in', password: 'Pass@123', name: 'Priya Patel', phone: '9123456789' },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // Create admin accounts
  console.log('Creating admin accounts...');
  for (const acc of ADMIN_ACCOUNTS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      await setDoc(doc(db, 'adminUsers', cred.user.uid), {
        email: acc.email, name: acc.name, role: acc.role,
        department: acc.department || null,
        createdAt: new Date(),
      });
      console.log(`✅ Admin: ${acc.email}`);
    } catch (e) {
      console.log(`⚠️  ${acc.email}: ${e.message}`);
    }
  }

  // Create citizen accounts
  console.log('\nCreating citizen accounts...');
  const citizenIds = {};
  for (const acc of CITIZEN_ACCOUNTS) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: acc.email, name: acc.name, phone: acc.phone,
        createdAt: new Date(), totalComplaints: 0,
      });
      citizenIds[acc.email] = cred.user.uid;
      console.log(`✅ Citizen: ${acc.email}`);
    } catch (e) {
      console.log(`⚠️  ${acc.email}: ${e.message}`);
    }
  }

  // Add sample complaints
  console.log('\nAdding sample complaints...');
  const userId = citizenIds['rahul@citizen.in'] || 'demo-user';
  for (let i = 0; i < SAMPLE_COMPLAINTS.length; i++) {
    const c = SAMPLE_COMPLAINTS[i];
    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    try {
      await addDoc(collection(db, 'complaints'), {
        ...c,
        ticketId: `GRV-${(Math.random() * 999999 | 0).toString(36).toUpperCase()}`,
        userId,
        userName: 'Rahul Sharma',
        userPhone: '9876543210',
        source: 'mobile',
        upvotes: Math.floor(Math.random() * 15),
        media: [],
        createdAt,
        updatedAt: new Date(),
      });
      console.log(`✅ Complaint ${i + 1}: ${c.title.slice(0, 50)}`);
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
  }

  console.log('\n✨ Seed complete!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('Admin Panel (http://localhost:5173):');
  ADMIN_ACCOUNTS.forEach(a => console.log(`  ${a.role === 'superAdmin' ? '⭐' : '🏢'} ${a.email} / ${a.password}`));
  console.log('\nCitizen Portal (http://localhost:5174):');
  CITIZEN_ACCOUNTS.forEach(a => console.log(`  👤 ${a.email} / ${a.password}`));
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
