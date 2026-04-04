const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sapphire_aviation';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'security', 'admin'],
    default: 'visitor'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  badgeNumber: String,
  shift: String,
  position: String,
  department: String,
  nfcCardId: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Visitor Schema
const visitorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phoneNumber: { type: String, required: true },
  idNumber: { type: String, required: true },
  idImage: String,
  purposeOfVisit: { type: String, required: true },
  vehicleNumber: { type: String, default: "" },
  visitDate: { type: Date, required: true },
  visitTime: { type: Date, required: true },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'checked_in', 'checked_out', 'expired', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  registeredAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Visitor.deleteMany({});
    console.log('✅ Cleared existing users and visitors...\n');

    // ============ CREATE ADMIN ACCOUNT ============
    console.log('📝 Creating Admin Account...');
    
    const adminUsers = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@sapphire.edu',  // ← MATCHES YOUR SERVER.JS
        password: await bcrypt.hash('Admin123!', 10),  // ← MATCHES YOUR SERVER.JS
        phone: '09123456789',
        role: 'admin',
        status: 'active',
        isActive: true,
        department: 'IT Administration',
        position: 'System Administrator',
        nfcCardId: `SAFEPASS-ADMIN-${Date.now()}`,
      }
    ];
    
    const createdAdmins = await User.insertMany(adminUsers);
    console.log(`✅ Created ${createdAdmins.length} admin account\n`);

    // ============ CREATE SECURITY ACCOUNT ============
    console.log('📝 Creating Security Account...');
    
    const securityUsers = [
      {
        firstName: 'Security',
        lastName: 'Officer',
        email: 'security@sapphire.edu',  // ← MATCHES YOUR SERVER.JS
        password: await bcrypt.hash('Security123!', 10),  // ← MATCHES YOUR SERVER.JS
        phone: '09123456780',
        role: 'security',
        status: 'active',
        isActive: true,
        badgeNumber: 'SEC-001',
        shift: 'Morning (6:00 AM - 2:00 PM)',
        position: 'Security Officer',
        department: 'Security Department',
        nfcCardId: `SAFEPASS-SEC-${Date.now()}`,
      }
    ];
    
    const createdSecurity = await User.insertMany(securityUsers);
    console.log(`✅ Created ${createdSecurity.length} security account\n`);

    // ============ CREATE APPROVED VISITOR ACCOUNT ============
    console.log('📝 Creating Approved Visitor Account...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    // Create visitor record for approved visitor
    const approvedVisitor = new Visitor({
      fullName: 'John Smith',
      email: 'john.smith@email.com',
      phoneNumber: '09171234567',
      idNumber: 'PASSPORT-12345',
      idImage: null,
      purposeOfVisit: 'Campus Tour',
      vehicleNumber: 'ABC-1234',
      visitDate: tomorrow,
      visitTime: tomorrow,
      approvalStatus: 'approved',
      status: 'approved',
      approvedAt: new Date(),
      registeredAt: new Date(),
    });
    
    await approvedVisitor.save();
    
    // Create user account for approved visitor
    const approvedVisitorUser = new User({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      password: await bcrypt.hash('Visitor123!', 10),
      phone: '09171234567',
      role: 'visitor',
      status: 'active',
      isActive: true,
      visitorId: approvedVisitor._id,
      nfcCardId: `SAFEPASS-VIS-${Date.now()}`,
    });
    
    await approvedVisitorUser.save();
    console.log(`✅ Created approved visitor account: john.smith@email.com / Visitor123!\n`);

    // ============ CREATE PENDING VISITOR ACCOUNT ============
    console.log('📝 Creating Pending Visitor Account...');
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 30, 0, 0);
    
    // Create visitor record for pending visitor
    const pendingVisitor = new Visitor({
      fullName: 'Jane Doe',
      email: 'jane.doe@email.com',
      phoneNumber: '09174447890',
      idNumber: 'PASSPORT-78901',
      idImage: null,
      purposeOfVisit: 'Job Interview',
      vehicleNumber: 'JKL-7890',
      visitDate: nextWeek,
      visitTime: nextWeek,
      approvalStatus: 'pending',
      status: 'pending',
      registeredAt: new Date(),
    });
    
    await pendingVisitor.save();
    
    // Create user account for pending visitor
    const pendingVisitorUser = new User({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@email.com',
      password: await bcrypt.hash('pending123', 10),
      phone: '09174447890',
      role: 'visitor',
      status: 'pending',
      isActive: false,
      visitorId: pendingVisitor._id,
      nfcCardId: `PENDING-${Date.now()}`,
    });
    
    await pendingVisitorUser.save();
    console.log(`✅ Created pending visitor account: jane.doe@email.com / pending123\n`);

    // ============ PRINT SUMMARY ============
    console.log('='.repeat(60));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    console.log('\n🔐 DEMO CREDENTIALS:');
    console.log('─'.repeat(50));
    
    console.log('\n👑 ADMIN ACCOUNT:');
    console.log(`   Email: admin@sapphire.edu`);
    console.log(`   Password: Admin123!`);
    console.log(`   Role: Administrator - Full system access`);
    console.log('');
    
    console.log('👮 SECURITY ACCOUNT:');
    console.log(`   Email: security@sapphire.edu`);
    console.log(`   Password: Security123!`);
    console.log(`   Role: Security - Can verify visitors`);
    console.log('');
    
    console.log('✅ APPROVED VISITOR ACCOUNT:');
    console.log(`   Email: john.smith@email.com`);
    console.log(`   Password: Visitor123!`);
    console.log(`   Role: Visitor - Can login and access dashboard`);
    console.log('');
    
    console.log('⏳ PENDING VISITOR ACCOUNT:');
    console.log(`   Email: jane.doe@email.com`);
    console.log(`   Password: pending123`);
    console.log(`   Role: Visitor - Cannot login (pending approval)`);
    console.log('');
    
    console.log('='.repeat(60));
    console.log('\n💡 TESTING TIPS:');
    console.log('   • Admin: admin@sapphire.edu / Admin123! - to approve visitors');
    console.log('   • Security: security@sapphire.edu / Security123! - to check in/out visitors');
    console.log('   • Approved Visitor: john.smith@email.com / Visitor123! - to test visitor dashboard');
    console.log('   • Pending Visitor: jane.doe@email.com / pending123 - to test pending approval message');
    console.log('   • Your registered visitors need admin approval before they can login');
    
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed function
seedDatabase();