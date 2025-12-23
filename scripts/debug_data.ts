import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { UserModel } from '../src/models/User';
import { CourseModel } from '../src/models/Course';

async function run() {
    console.log('🔍 Debugging Data...');
    await mongoose.connect(env.mongoUri);

    const kimleap = await UserModel.findOne({ email: 'kimleap@student.university.edu' });
    if (!kimleap) {
        console.log('❌ User Kimleap NOT FOUND');
    } else {
        console.log('✅ User Kimleap FOUND:', kimleap._id);
    }

    const course = await CourseModel.findOne({ code: 'MOB101' });
    if (!course) {
        console.log('❌ Course MOB101 NOT FOUND');
    } else {
        console.log('✅ Course MOB101 FOUND:', course._id);
        console.log('   Students Enrolled:', course.students.length);
        console.log('   Student IDs:', course.students.map(id => id.toString()));

        if (kimleap) {
            const isEnrolled = course.students.some(id => id.toString() === kimleap._id.toString());
            if (isEnrolled) {
                console.log('🎉 MATCH! Kimleap is enrolled in MOB101');
            } else {
                console.log('😱 MISMATCH! Kimleap is NOT in the students list.');
            }
        }
    }

    await mongoose.disconnect();
}

run().catch(console.error);
