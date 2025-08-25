#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * 
 * This script tests the database connection using your environment configuration.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e_system';
    
    try {
        console.log(`📊 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
        
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Database connection successful!');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        console.log(`🔗 Host: ${mongoose.connection.host}`);
        console.log(`🚪 Port: ${mongoose.connection.port}`);
        
        // Test basic operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        
        if (collections.length > 0) {
            console.log('📋 Available collections:');
            collections.forEach(collection => {
                console.log(`   - ${collection.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Check if MongoDB is running');
        console.log('2. Verify your MONGO_URI in .env file');
        console.log('3. Ensure network connectivity');
        console.log('4. Check firewall settings');
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run if called directly
if (require.main === module) {
    testDatabaseConnection()
        .then(() => {
            console.log('\n✅ Database test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Database test failed:', error);
            process.exit(1);
        });
}

module.exports = { testDatabaseConnection };
