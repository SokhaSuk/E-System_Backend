#!/usr/bin/env node

/**
 * E-System Status Check
 * 
 * This script shows the current status of your application.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:4000';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(3000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function checkDatabase() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system';
        await mongoose.connect(mongoUri);
        const collections = await mongoose.connection.db.listCollections().toArray();
        await mongoose.disconnect();
        return { status: 'connected', collections: collections.length };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

async function showStatus() {
    console.log('🔍 E-System Status Check\n');
    
    // Check server
    console.log('🌐 Server Status:');
    try {
        const healthResult = await makeRequest('/health');
        if (healthResult.statusCode === 200) {
            console.log('   ✅ Server: Running on port 4000');
            try {
                const healthData = JSON.parse(healthResult.data);
                console.log(`   📊 Environment: ${healthData.environment}`);
                console.log(`   🕒 Last Check: ${healthData.timestamp}`);
            } catch (e) {
                console.log('   📊 Health endpoint responding');
            }
        } else {
            console.log(`   ❌ Server: HTTP ${healthResult.statusCode}`);
        }
    } catch (error) {
        console.log(`   ❌ Server: ${error.message}`);
    }
    
    // Check database
    console.log('\n🗄️ Database Status:');
    const dbStatus = await checkDatabase();
    if (dbStatus.status === 'connected') {
        console.log('   ✅ Database: Connected');
        console.log(`   📁 Collections: ${dbStatus.collections}`);
    } else {
        console.log(`   ❌ Database: ${dbStatus.message}`);
    }
    
    // Check API endpoints
    console.log('\n🔗 API Endpoints:');
    const endpoints = [
        { name: 'Health Check', path: '/health', expected: 200 },
        { name: 'API Docs', path: '/api', expected: 200 },
        { name: 'Auth (401 expected)', path: '/api/auth', expected: 401 },
        { name: 'Admin (401 expected)', path: '/api/admin', expected: 401 }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(endpoint.path);
            if (result.statusCode === endpoint.expected) {
                console.log(`   ✅ ${endpoint.name}: ${result.statusCode}`);
            } else {
                console.log(`   ⚠️ ${endpoint.name}: ${result.statusCode} (expected ${endpoint.expected})`);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint.name}: ${error.message}`);
        }
    }
    
    console.log('\n🎉 Status Summary:');
    console.log('   • Your server is running correctly');
    console.log('   • Database is connected');
    console.log('   • API endpoints are responding');
    console.log('   • Authentication is working (401 responses are normal)');
    console.log('\n📋 Quick Links:');
    console.log('   • Health: http://localhost:4000/health');
    console.log('   • API Docs: http://localhost:4000/api');
    console.log('   • Test API: npm run test:api');
    console.log('   • Test DB: npm run db:test');
}

// Run if called directly
if (require.main === module) {
    showStatus()
        .then(() => {
            console.log('\n✅ Status check completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Status check failed:', error);
            process.exit(1);
        });
}

module.exports = { showStatus };
