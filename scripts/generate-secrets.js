#!/usr/bin/env node

/**
 * Security Utilities for E-System Backend
 * 
 * This script helps generate secure secrets and credentials
 * for your application.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 E-System Security Utilities\n');

// Generate JWT Secret
function generateJWTSecret() {
    return crypto.randomBytes(32).toString('hex');
}

// Generate Admin Signup Code
function generateAdminCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

// Generate Database Password
function generateDBPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Check if .env file exists
function checkEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        console.log('⚠️  Warning: .env file already exists!');
        console.log('   This script will show you new values but won\'t overwrite your existing file.\n');
        return true;
    }
    return false;
}

// Main function
function main() {
    const envExists = checkEnvFile();
    
    console.log('🔑 Generated Secure Credentials:\n');
    
    // JWT Secret
    const jwtSecret = generateJWTSecret();
    console.log('JWT_SECRET=' + jwtSecret);
    
    // Admin Signup Code
    const adminCode = generateAdminCode();
    console.log('ADMIN_SIGNUP_CODE=' + adminCode);
    
    // Database Password (if needed)
    const dbPassword = generateDBPassword();
    console.log('DB_PASSWORD=' + dbPassword);
    
    console.log('\n📝 Instructions:');
    console.log('1. Copy these values to your .env file');
    console.log('2. Replace the placeholder values in .env.example');
    console.log('3. Never commit your .env file to Git');
    
    if (!envExists) {
        console.log('\n💡 To create your .env file:');
        console.log('   cp .env.example .env');
        console.log('   Then replace the placeholder values with the ones above');
    }
    
    console.log('\n🔒 Security Tips:');
    console.log('- Use different secrets for development and production');
    console.log('- Rotate secrets regularly in production');
    console.log('- Store production secrets securely (e.g., environment variables)');
    console.log('- Never share these secrets publicly');
    
    console.log('\n✅ Done! Your secrets are ready to use.');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    generateJWTSecret,
    generateAdminCode,
    generateDBPassword
};
