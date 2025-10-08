#!/usr/bin/env node

/**
 * API Test Script
 *
 * This script tests the main API endpoints to ensure everything is working.
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';

function makeRequest(path) {
	return new Promise((resolve, reject) => {
		const req = http.get(`${BASE_URL}${path}`, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			});
			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					data: data,
				});
			});
		});

		req.on('error', error => {
			reject(error);
		});

		req.setTimeout(5000, () => {
			req.destroy();
			reject(new Error('Request timeout'));
		});
	});
}

async function testAPI() {
	console.log('🧪 Testing E-System API...\n');

	const tests = [
		{ name: 'Health Check', path: '/health' },
		{ name: 'API Documentation', path: '/api/v1' },
		{ name: 'Favicon', path: '/favicon.ico' },
	];

	for (const test of tests) {
		try {
			console.log(`🔍 Testing ${test.name}...`);
			const result = await makeRequest(test.path);

			if (result.statusCode === 200 || result.statusCode === 204) {
				console.log(`✅ ${test.name}: ${result.statusCode}`);
				if (result.data && test.path !== '/favicon.ico') {
					try {
						const json = JSON.parse(result.data);
						console.log(
							`   📄 Response: ${JSON.stringify(json, null, 2).substring(0, 100)}...`
						);
					} catch (e) {
						console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
					}
				}
			} else {
				console.log(`❌ ${test.name}: ${result.statusCode}`);
			}
		} catch (error) {
			console.log(`❌ ${test.name}: ${error.message}`);
		}
		console.log('');
	}

	console.log('🎉 API testing completed!');
	console.log('\n📋 Available endpoints:');
	console.log('   • Health: http://localhost:4000/health');
	console.log('   • API Docs: http://localhost:4000/api/v1');
	console.log('   • Auth: http://localhost:4000/api/v1/auth');
	console.log('   • Admin: http://localhost:4000/api/v1/admin');
	console.log('   • Teacher: http://localhost:4000/api/v1/teacher');
	console.log('   • Student: http://localhost:4000/api/v1/student');
	console.log('   • Courses: http://localhost:4000/api/v1/courses');
	console.log('   • Attendance: http://localhost:4000/api/v1/attendance');
	console.log('   • Users: http://localhost:4000/api/v1/users');
	console.log('   • Grades: http://localhost:4000/api/v1/grades');
	console.log('   • Announcements: http://localhost:4000/api/v1/announcements');
}

// Run if called directly
if (require.main === module) {
	testAPI()
		.then(() => {
			console.log('\n✅ All tests completed!');
			process.exit(0);
		})
		.catch(error => {
			console.error('\n❌ Test failed:', error);
			process.exit(1);
		});
}

module.exports = { testAPI };
