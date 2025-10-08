import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { UserModel, UserDocument } from '../src/models/User';
import { CourseModel } from '../src/models/Course';
import { AttendanceModel } from '../src/models/Attendance';
import { AnnouncementModel } from '../src/models/Announcement';
import { GradeModel } from '../src/models/Grade';
import { hashPassword } from '../src/utils/password';

async function connect() {
	const options = {
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	} as const;
	await mongoose.connect(env.mongoUri, options);
	console.log('✅ Connected to MongoDB');
}

async function disconnect() {
	await mongoose.disconnect();
	console.log('Disconnected from MongoDB');
}

async function upsertUser(
	fullName: string,
	email: string,
	role: UserDocument['role'],
	password: string
) {
	const passwordHash = await hashPassword(password);
	const updated = await UserModel.findOneAndUpdate(
		{ email },
		{ $setOnInsert: { fullName, email, role, passwordHash } },
		{ upsert: true, new: true }
	);
	return updated!;
}

// Sample data arrays
const usersData = [
	// Admins
	{
		fullName: 'System Administrator',
		email: 'admin@university.edu',
		role: 'admin' as const,
		password: 'AdminPass123!',
	},
	{
		fullName: 'Academic Director',
		email: 'director@university.edu',
		role: 'admin' as const,
		password: 'DirectorPass123!',
	},

	// Teachers
	{
		fullName: 'Dr. Sarah Johnson',
		email: 'sarah.johnson@university.edu',
		role: 'teacher' as const,
		password: 'TeacherPass123!',
	},
	{
		fullName: 'Prof. Michael Chen',
		email: 'michael.chen@university.edu',
		role: 'teacher' as const,
		password: 'TeacherPass123!',
	},
	{
		fullName: 'Dr. Emily Rodriguez',
		email: 'emily.rodriguez@university.edu',
		role: 'teacher' as const,
		password: 'TeacherPass123!',
	},
	{
		fullName: 'Prof. David Kim',
		email: 'david.kim@university.edu',
		role: 'teacher' as const,
		password: 'TeacherPass123!',
	},

	// Students
	{
		fullName: 'Alice Thompson',
		email: 'alice.thompson@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Bob Martinez',
		email: 'bob.martinez@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Carol Williams',
		email: 'carol.williams@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'David Brown',
		email: 'david.brown@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Emma Davis',
		email: 'emma.davis@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Frank Wilson',
		email: 'frank.wilson@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Grace Lee',
		email: 'grace.lee@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Henry Taylor',
		email: 'henry.taylor@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Iris Anderson',
		email: 'iris.anderson@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
	{
		fullName: 'Jack Miller',
		email: 'jack.miller@student.university.edu',
		role: 'student' as const,
		password: 'StudentPass123!',
	},
];

const coursesData = [
	{
		title: 'Introduction to Computer Science',
		description: 'Foundations of computing, algorithms, and problem solving.',
		code: 'CS101',
		credits: 3,
		semester: 'Fall',
		academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
		students: [
			'alice.thompson@student.university.edu',
			'bob.martinez@student.university.edu',
			'carol.williams@student.university.edu',
			'david.brown@student.university.edu',
		],
	},
	{
		title: 'Data Structures and Algorithms',
		description:
			'Advanced programming concepts with focus on data structures and algorithmic thinking.',
		code: 'CS201',
		credits: 4,
		semester: 'Fall',
		academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
		students: [
			'alice.thompson@student.university.edu',
			'bob.martinez@student.university.edu',
			'emma.davis@student.university.edu',
		],
	},
	{
		title: 'Calculus I',
		description: 'Differential and integral calculus with applications.',
		code: 'MATH101',
		credits: 4,
		semester: 'Fall',
		academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
		students: [
			'carol.williams@student.university.edu',
			'david.brown@student.university.edu',
			'emma.davis@student.university.edu',
			'frank.wilson@student.university.edu',
		],
	},
	{
		title: 'Physics I',
		description: 'Mechanics, thermodynamics, and waves.',
		code: 'PHYS101',
		credits: 4,
		semester: 'Spring',
		academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
		students: [
			'grace.lee@student.university.edu',
			'henry.taylor@student.university.edu',
			'iris.anderson@student.university.edu',
		],
	},
	{
		title: 'English Literature',
		description: 'Survey of English literature from medieval to modern times.',
		code: 'ENGL201',
		credits: 3,
		semester: 'Spring',
		academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
		students: [
			'jack.miller@student.university.edu',
			'grace.lee@student.university.edu',
			'frank.wilson@student.university.edu',
		],
	},
];

const gradesData = [
	// CS101 grades
	{
		student: 'alice.thompson@student.university.edu',
		course: 'CS101',
		type: 'assignment',
		title: 'Assignment 1',
		score: 88,
		maxScore: 100,
	},
	{
		student: 'alice.thompson@student.university.edu',
		course: 'CS101',
		type: 'quiz',
		title: 'Quiz 1',
		score: 92,
		maxScore: 100,
	},
	{
		student: 'alice.thompson@student.university.edu',
		course: 'CS101',
		type: 'exam',
		title: 'Midterm Exam',
		score: 85,
		maxScore: 100,
	},
	{
		student: 'bob.martinez@student.university.edu',
		course: 'CS101',
		type: 'assignment',
		title: 'Assignment 1',
		score: 76,
		maxScore: 100,
	},
	{
		student: 'bob.martinez@student.university.edu',
		course: 'CS101',
		type: 'quiz',
		title: 'Quiz 1',
		score: 82,
		maxScore: 100,
	},
	{
		student: 'carol.williams@student.university.edu',
		course: 'CS101',
		type: 'assignment',
		title: 'Assignment 1',
		score: 94,
		maxScore: 100,
	},
	{
		student: 'david.brown@student.university.edu',
		course: 'CS101',
		type: 'quiz',
		title: 'Quiz 1',
		score: 78,
		maxScore: 100,
	},

	// CS201 grades
	{
		student: 'alice.thompson@student.university.edu',
		course: 'CS201',
		type: 'project',
		title: 'Data Structure Project',
		score: 91,
		maxScore: 100,
	},
	{
		student: 'bob.martinez@student.university.edu',
		course: 'CS201',
		type: 'assignment',
		title: 'Algorithm Assignment',
		score: 84,
		maxScore: 100,
	},
	{
		student: 'emma.davis@student.university.edu',
		course: 'CS201',
		type: 'exam',
		title: 'Final Exam',
		score: 89,
		maxScore: 100,
	},

	// MATH101 grades
	{
		student: 'carol.williams@student.university.edu',
		course: 'MATH101',
		type: 'quiz',
		title: 'Calculus Quiz 1',
		score: 96,
		maxScore: 100,
	},
	{
		student: 'david.brown@student.university.edu',
		course: 'MATH101',
		type: 'exam',
		title: 'Midterm Exam',
		score: 87,
		maxScore: 100,
	},
	{
		student: 'emma.davis@student.university.edu',
		course: 'MATH101',
		type: 'assignment',
		title: 'Problem Set 1',
		score: 93,
		maxScore: 100,
	},
	{
		student: 'frank.wilson@student.university.edu',
		course: 'MATH101',
		type: 'quiz',
		title: 'Calculus Quiz 1',
		score: 79,
		maxScore: 100,
	},
];

const announcementsData = [
	{
		title: 'Welcome to Fall Semester',
		content:
			'Welcome back to another exciting semester! Please check your course schedules and familiarize yourselves with the campus resources available.',
		type: 'general',
		targetAudience: ['all'],
		isActive: true,
	},
	{
		title: 'CS101 - Assignment Due Next Week',
		content:
			"Don't forget that Assignment 1 is due next Friday. Please submit your work through the online portal.",
		type: 'course',
		targetAudience: ['student'],
		course: 'CS101',
		isActive: true,
	},
	{
		title: 'Library Hours Extended',
		content:
			'The main library will have extended hours during midterm season. Check the library website for updated hours.',
		type: 'academic',
		targetAudience: ['student', 'teacher'],
		isActive: true,
	},
	{
		title: 'Faculty Meeting',
		content:
			'There will be a mandatory faculty meeting this Thursday at 3 PM in the conference room.',
		type: 'general',
		targetAudience: ['teacher', 'admin'],
		isActive: true,
	},
	{
		title: 'Campus Safety Alert',
		content:
			'Please be aware of increased traffic around campus due to construction. Use designated walkways and be cautious of heavy equipment.',
		type: 'emergency',
		targetAudience: ['all'],
		isActive: true,
	},
];

async function createAttendanceRecords(
	users: UserDocument[],
	courses: any[],
	days: number = 30
) {
	console.log('📅 Creating attendance records...');
	const attendancePromises: Promise<any>[] = [];

	// Create attendance for the last 30 days for each student in each course
	for (let i = 0; i < days; i++) {
		const date = new Date();
		date.setDate(date.getDate() - i);

		for (const course of courses) {
			const teacher = users.find(
				u =>
					u.role === 'teacher' &&
					course.teacher?.toString() === u._id.toString()
			);
			if (!teacher) continue;

			for (const studentEmail of course.students || []) {
				const student = users.find(
					u => u.email === studentEmail && u.role === 'student'
				);
				if (!student) continue;

				// Random attendance status (weighted towards present)
				const statuses = ['present', 'present', 'present', 'absent', 'late'];
				const status = statuses[Math.floor(Math.random() * statuses.length)];

				attendancePromises.push(
					AttendanceModel.findOneAndUpdate(
						{
							student: student._id,
							course: course._id,
							date: new Date(
								date.getFullYear(),
								date.getMonth(),
								date.getDate()
							),
						},
						{
							$setOnInsert: {
								student: student._id,
								course: course._id,
								date: new Date(
									date.getFullYear(),
									date.getMonth(),
									date.getDate()
								),
								status,
								recordedBy: teacher._id,
							},
						},
						{ upsert: true, new: true }
					) as any
				);
			}
		}
	}

	await Promise.all(attendancePromises);
	console.log(`✅ Created attendance records for ${days} days`);
}

async function run() {
	console.log('🌱 Seeding database with comprehensive sample data...');
	await connect();

	try {
		// Create all users
		console.log('👤 Creating users...');
		const users: UserDocument[] = [];
		for (const userData of usersData) {
			const user = await upsertUser(
				userData.fullName,
				userData.email,
				userData.role,
				userData.password
			);
			users.push(user);
		}

		const admins = users.filter(u => u.role === 'admin');
		const teachers = users.filter(u => u.role === 'teacher');
		const students = users.filter(u => u.role === 'student');

		console.log(
			`✅ Created ${admins.length} admins, ${teachers.length} teachers, ${students.length} students`
		);

		// Create all courses
		console.log('📚 Creating courses...');
		const courses: any[] = [];
		for (const courseData of coursesData) {
			const teacher = teachers.find(
				t => t.email === 'sarah.johnson@university.edu'
			); // Assign to first teacher for simplicity
			if (!teacher) continue;

			const enrolledStudents = students.filter(s =>
				courseData.students.includes(s.email)
			);

			const course = (await CourseModel.findOneAndUpdate(
				{ code: courseData.code },
				{
					$setOnInsert: {
						title: courseData.title,
						description: courseData.description,
						code: courseData.code,
						credits: courseData.credits,
						teacher: teacher._id,
						students: enrolledStudents.map(s => s._id),
						semester: courseData.semester,
						academicYear: courseData.academicYear,
						isActive: true,
					},
				},
				{ upsert: true, new: true }
			)) as any;
			courses.push(course);
		}
		console.log(`✅ Created ${courses.length} courses`);

		// Create grades
		console.log('📊 Creating grades...');
		for (const gradeData of gradesData) {
			const student = students.find(s => s.email === gradeData.student);
			const course = courses.find(c => c.code === gradeData.course);
			const teacher = teachers.find(
				t => t.email === 'sarah.johnson@university.edu'
			);

			if (!student || !course || !teacher) continue;

			const percentage = (gradeData.score / gradeData.maxScore) * 100;
			let letterGrade = 'F';
			if (percentage >= 93) letterGrade = 'A';
			else if (percentage >= 90) letterGrade = 'A-';
			else if (percentage >= 87) letterGrade = 'B+';
			else if (percentage >= 83) letterGrade = 'B';
			else if (percentage >= 80) letterGrade = 'B-';
			else if (percentage >= 77) letterGrade = 'C+';
			else if (percentage >= 73) letterGrade = 'C';
			else if (percentage >= 70) letterGrade = 'C-';
			else if (percentage >= 67) letterGrade = 'D+';
			else if (percentage >= 63) letterGrade = 'D';
			else if (percentage >= 60) letterGrade = 'D-';

			(await GradeModel.findOneAndUpdate(
				{
					student: student._id,
					course: course._id,
					title: gradeData.title,
				},
				{
					$setOnInsert: {
						student: student._id,
						course: course._id,
						gradeType: gradeData.type,
						title: gradeData.title,
						score: gradeData.score,
						maxScore: gradeData.maxScore,
						percentage: Math.round(percentage * 100) / 100,
						letterGrade,
						gradedBy: teacher._id,
						submittedAt: new Date(),
					},
				},
				{ upsert: true, new: true }
			)) as any;
		}
		console.log(`✅ Created ${gradesData.length} grades`);

		// Create attendance records
		await createAttendanceRecords(users, courses);

		// Create announcements
		console.log('📣 Creating announcements...');
		for (const announcementData of announcementsData) {
			const author =
				announcementData.type === 'course'
					? teachers.find(t => t.email === 'sarah.johnson@university.edu')
					: admins.find(a => a.email === 'admin@university.edu');

			if (!author) continue;

			let course;
			if (announcementData.course) {
				course = courses.find(c => c.code === announcementData.course);
			}

			(await AnnouncementModel.findOneAndUpdate(
				{ title: announcementData.title },
				{
					$setOnInsert: {
						title: announcementData.title,
						content: announcementData.content,
						type: announcementData.type,
						author: author._id,
						targetAudience: announcementData.targetAudience,
						course: course?._id,
						isActive: announcementData.isActive,
						publishedAt: new Date(),
						expiresAt:
							announcementData.type === 'emergency'
								? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
								: undefined,
					},
				},
				{ upsert: true, new: true }
			)) as any;
		}
		console.log(`✅ Created ${announcementsData.length} announcements`);

		console.log('\n🎉 Comprehensive seed completed successfully!');
		console.log(`📈 Summary:`);
		console.log(
			`   👤 Users: ${admins.length} admins, ${teachers.length} teachers, ${students.length} students`
		);
		console.log(`   📚 Courses: ${courses.length}`);
		console.log(`   📊 Grades: ${gradesData.length}`);
		console.log(
			`   📅 Attendance: ~${courses.length * students.length * 30} records`
		);
		console.log(`   📣 Announcements: ${announcementsData.length}`);
	} catch (error) {
		console.error('❌ Seed failed:', error);
		throw error;
	} finally {
		await disconnect();
	}
}

if (require.main === module) {
	run().catch(err => {
		console.error('❌ Seed failed:', err);
		process.exit(1);
	});
}
