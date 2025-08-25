/**
 * E-System Database Setup Script
 * 
 * This script initializes the MongoDB database with:
 * - Database creation
 * - Collection setup
 * - Index creation
 * - Sample data insertion
 * - Admin user creation
 */

// MongoDB connection string (update this as needed)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system';

// Import required modules
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        
        // 1. Create collections
        console.log('\n📁 Creating collections...');
        await createCollections(db);
        
        // 2. Create indexes
        console.log('\n🔍 Creating indexes...');
        await createIndexes(db);
        
        // 3. Insert sample data
        console.log('\n📝 Inserting sample data...');
        await insertSampleData(db);
        
        // 4. Create admin user
        console.log('\n👤 Creating admin user...');
        await createAdminUser(db);
        
        console.log('\n🎉 Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    } finally {
        await client.close();
    }
}

async function createCollections(db) {
    const collections = [
        'users',
        'courses', 
        'attendance',
        'grades',
        'announcements'
    ];
    
    for (const collectionName of collections) {
        try {
            await db.createCollection(collectionName);
            console.log(`✅ Created collection: ${collectionName}`);
        } catch (error) {
            if (error.code === 48) { // Collection already exists
                console.log(`ℹ️ Collection already exists: ${collectionName}`);
            } else {
                console.error(`❌ Error creating collection ${collectionName}:`, error);
            }
        }
    }
}

async function createIndexes(db) {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    console.log('✅ Users indexes created');
    
    // Courses collection indexes
    await db.collection('courses').createIndex({ code: 1 }, { unique: true });
    await db.collection('courses').createIndex({ teacher: 1, isActive: 1 });
    await db.collection('courses').createIndex({ students: 1, isActive: 1 });
    console.log('✅ Courses indexes created');
    
    // Attendance collection indexes
    await db.collection('attendance').createIndex(
        { student: 1, course: 1, date: 1 }, 
        { unique: true }
    );
    await db.collection('attendance').createIndex({ course: 1, date: 1 });
    await db.collection('attendance').createIndex({ student: 1, date: 1 });
    console.log('✅ Attendance indexes created');
    
    // Grades collection indexes
    await db.collection('grades').createIndex({ student: 1, course: 1 });
    await db.collection('grades').createIndex({ course: 1, gradeType: 1 });
    await db.collection('grades').createIndex({ student: 1, gradeType: 1 });
    console.log('✅ Grades indexes created');
    
    // Announcements collection indexes
    await db.collection('announcements').createIndex({ type: 1, isActive: 1, publishedAt: -1 });
    await db.collection('announcements').createIndex({ course: 1, isActive: 1, publishedAt: -1 });
    await db.collection('announcements').createIndex({ targetAudience: 1, isActive: 1, publishedAt: -1 });
    console.log('✅ Announcements indexes created');
}

async function insertSampleData(db) {
    // Sample teachers
    const teachers = [
        {
            fullName: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@university.edu',
            passwordHash: await bcrypt.hash('teacher123', 12),
            role: 'teacher',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            fullName: 'Prof. Michael Chen',
            email: 'michael.chen@university.edu',
            passwordHash: await bcrypt.hash('teacher123', 12),
            role: 'teacher',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            fullName: 'Dr. Emily Rodriguez',
            email: 'emily.rodriguez@university.edu',
            passwordHash: await bcrypt.hash('teacher123', 12),
            role: 'teacher',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    const teacherIds = [];
    for (const teacher of teachers) {
        const result = await db.collection('users').insertOne(teacher);
        teacherIds.push(result.insertedId);
        console.log(`✅ Inserted teacher: ${teacher.fullName}`);
    }
    
    // Sample students
    const students = [
        {
            fullName: 'John Smith',
            email: 'john.smith@student.university.edu',
            passwordHash: await bcrypt.hash('student123', 12),
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            fullName: 'Maria Garcia',
            email: 'maria.garcia@student.university.edu',
            passwordHash: await bcrypt.hash('student123', 12),
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            fullName: 'David Kim',
            email: 'david.kim@student.university.edu',
            passwordHash: await bcrypt.hash('student123', 12),
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            fullName: 'Lisa Wang',
            email: 'lisa.wang@student.university.edu',
            passwordHash: await bcrypt.hash('student123', 12),
            role: 'student',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    const studentIds = [];
    for (const student of students) {
        const result = await db.collection('users').insertOne(student);
        studentIds.push(result.insertedId);
        console.log(`✅ Inserted student: ${student.fullName}`);
    }
    
    // Sample courses
    const courses = [
        {
            title: 'Introduction to Computer Science',
            description: 'Fundamental concepts of programming and computer science',
            code: 'CS101',
            credits: 3,
            teacher: teacherIds[0],
            students: studentIds.slice(0, 2),
            semester: 'Fall',
            academicYear: '2024-2025',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'Advanced Mathematics',
            description: 'Advanced mathematical concepts and problem solving',
            code: 'MATH201',
            credits: 4,
            teacher: teacherIds[1],
            students: studentIds.slice(1, 3),
            semester: 'Fall',
            academicYear: '2024-2025',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'English Literature',
            description: 'Study of classic and contemporary literature',
            code: 'ENG101',
            credits: 3,
            teacher: teacherIds[2],
            students: studentIds.slice(2, 4),
            semester: 'Fall',
            academicYear: '2024-2025',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    const courseIds = [];
    for (const course of courses) {
        const result = await db.collection('courses').insertOne(course);
        courseIds.push(result.insertedId);
        console.log(`✅ Inserted course: ${course.title}`);
    }
    
    // Sample announcements
    const announcements = [
        {
            title: 'Welcome to Fall Semester 2024',
            content: 'Welcome back students! We hope you had a great summer. Classes begin on September 2nd.',
            type: 'general',
            author: teacherIds[0],
            targetAudience: ['all'],
            isActive: true,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'CS101 Assignment Due Date Extended',
            content: 'The deadline for Assignment 1 has been extended to Friday, September 15th.',
            type: 'course',
            author: teacherIds[0],
            targetAudience: ['student'],
            course: courseIds[0],
            isActive: true,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    for (const announcement of announcements) {
        await db.collection('announcements').insertOne(announcement);
        console.log(`✅ Inserted announcement: ${announcement.title}`);
    }
    
    // Sample attendance records
    const today = new Date();
    const attendanceRecords = [];
    
    // Create attendance records for the past week
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        for (const courseId of courseIds) {
            const course = courses.find(c => c._id === courseId);
            for (const studentId of course.students) {
                attendanceRecords.push({
                    student: studentId,
                    course: courseId,
                    date: date,
                    status: Math.random() > 0.1 ? 'present' : 'absent',
                    recordedBy: course.teacher,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
    
    for (const record of attendanceRecords) {
        try {
            await db.collection('attendance').insertOne(record);
        } catch (error) {
            if (error.code !== 11000) { // Skip duplicate key errors
                console.error('Error inserting attendance record:', error);
            }
        }
    }
    console.log(`✅ Inserted ${attendanceRecords.length} attendance records`);
    
    // Sample grades
    const gradeTypes = ['assignment', 'quiz', 'exam', 'project'];
    const gradeRecords = [];
    
    for (const courseId of courseIds) {
        const course = courses.find(c => c._id === courseId);
        for (const studentId of course.students) {
            for (const gradeType of gradeTypes) {
                const score = Math.floor(Math.random() * 20) + 80; // 80-100
                const maxScore = 100;
                const percentage = (score / maxScore) * 100;
                
                gradeRecords.push({
                    student: studentId,
                    course: courseId,
                    gradeType: gradeType,
                    title: `${gradeType.charAt(0).toUpperCase() + gradeType.slice(1)} 1`,
                    score: score,
                    maxScore: maxScore,
                    percentage: percentage,
                    letterGrade: calculateLetterGrade(percentage),
                    gradedBy: course.teacher,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
    
    for (const grade of gradeRecords) {
        await db.collection('grades').insertOne(grade);
    }
    console.log(`✅ Inserted ${gradeRecords.length} grade records`);
}

async function createAdminUser(db) {
    const adminUser = {
        fullName: 'System Administrator',
        email: 'admin@university.edu',
        passwordHash: await bcrypt.hash('admin123', 12),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await db.collection('users').insertOne(adminUser);
        console.log('✅ Admin user created successfully');
        console.log('📧 Email: admin@university.edu');
        console.log('🔑 Password: admin123');
    } catch (error) {
        if (error.code === 11000) {
            console.log('ℹ️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin user:', error);
        }
    }
}

function calculateLetterGrade(percentage) {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
}

// Run the setup
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('\n🎯 Database setup completed!');
            console.log('\n📋 Next steps:');
            console.log('1. Start your backend server: npm run dev');
            console.log('2. Test the API endpoints');
            console.log('3. Login with admin credentials:');
            console.log('   - Email: admin@university.edu');
            console.log('   - Password: admin123');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupDatabase };
