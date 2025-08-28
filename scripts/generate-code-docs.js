#!/usr/bin/env node

/**
 * Code Documentation Generator
 * 
 * This script generates a comprehensive code listing for the entire project.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'CODE_DOCUMENTATION.md');

// Files to include in documentation
const INCLUDE_PATTERNS = [
    'src/**/*.ts',
    'scripts/**/*.js',
    'package.json',
    'tsconfig.json',
    '.env.example',
    'README.md',
    'SECURITY.md',
    'DOCUMENTATION.md'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.git/**',
    '*.log',
    '*.md' // Exclude markdown files from code listing
];

function shouldIncludeFile(filePath) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    
    // Check exclude patterns
    for (const pattern of EXCLUDE_PATTERNS) {
        if (pattern.includes('**')) {
            const basePattern = pattern.replace('/**', '');
            if (relativePath.startsWith(basePattern)) {
                return false;
            }
        } else if (relativePath.includes(pattern.replace('*', ''))) {
            return false;
        }
    }
    
    // Check include patterns
    for (const pattern of INCLUDE_PATTERNS) {
        if (pattern.includes('**')) {
            const basePattern = pattern.replace('/**/*.ts', '').replace('/**/*.js', '');
            if (relativePath.startsWith(basePattern) && 
                (relativePath.endsWith('.ts') || relativePath.endsWith('.js'))) {
                return true;
            }
        } else if (relativePath.endsWith(pattern.replace('*.ts', '.ts').replace('*.js', '.js'))) {
            return true;
        }
    }
    
    return false;
}

function getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
}

function getLanguageFromExtension(ext) {
    const languageMap = {
        '.ts': 'typescript',
        '.js': 'javascript',
        '.json': 'json',
        '.env': 'env',
        '.md': 'markdown'
    };
    return languageMap[ext] || 'text';
}

function walkDirectory(dir) {
    const files = [];
    
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (stat.isFile() && shouldIncludeFile(fullPath)) {
                files.push(fullPath);
            }
        }
    }
    
    walk(dir);
    return files;
}

function generateCodeDocumentation() {
    console.log('📝 Generating Code Documentation...\n');
    
    const files = walkDirectory(PROJECT_ROOT);
    let documentation = `# E-System Backend - Complete Code Documentation

## 📋 Table of Contents

`;

    // Generate table of contents
    files.forEach((file, index) => {
        const relativePath = path.relative(PROJECT_ROOT, file);
        const ext = getFileExtension(file);
        const language = getLanguageFromExtension(ext);
        documentation += `${index + 1}. [${relativePath}](#${relativePath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()})\n`;
    });

    documentation += `

---

## 📁 Project Structure

\`\`\`
${files.map(file => path.relative(PROJECT_ROOT, file)).join('\n')}
\`\`\`

---

`;

    // Generate code sections
    files.forEach((file, index) => {
        const relativePath = path.relative(PROJECT_ROOT, file);
        const ext = getFileExtension(file);
        const language = getLanguageFromExtension(ext);
        
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            documentation += `## ${index + 1}. ${relativePath}

**File Type:** ${language.toUpperCase()}
**Path:** \`${relativePath}\`

\`\`\`${language}
${content}
\`\`\`

---

`;
        } catch (error) {
            console.warn(`⚠️ Could not read file: ${relativePath}`);
            documentation += `## ${index + 1}. ${relativePath}

**File Type:** ${language.toUpperCase()}
**Path:** \`${relativePath}\`
**Status:** Could not read file

\`\`\`${language}
// File could not be read: ${error.message}
\`\`\`

---

`;
        }
    });

    // Add summary
    documentation += `## 📊 Summary

- **Total Files:** ${files.length}
- **TypeScript Files:** ${files.filter(f => f.endsWith('.ts')).length}
- **JavaScript Files:** ${files.filter(f => f.endsWith('.js')).length}
- **JSON Files:** ${files.filter(f => f.endsWith('.json')).length}
- **Configuration Files:** ${files.filter(f => f.includes('config') || f.includes('.env')).length}

## 🔧 How to Use This Documentation

1. **Search for specific functionality** using Ctrl+F
2. **Navigate to specific files** using the table of contents
3. **Understand the code structure** by reviewing the project structure
4. **Reference implementation details** for development and debugging

## 📞 Support

For questions about the code:
1. Check the main documentation in \`DOCUMENTATION.md\`
2. Review the README.md file
3. Check the API documentation at \`http://localhost:4000/api\`

---

*Generated on: ${new Date().toISOString()}*
`;

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, documentation);
    
    console.log(`✅ Code documentation generated successfully!`);
    console.log(`📄 Output file: ${OUTPUT_FILE}`);
    console.log(`📊 Total files documented: ${files.length}`);
    
    // Show file breakdown
    const breakdown = {
        typescript: files.filter(f => f.endsWith('.ts')).length,
        javascript: files.filter(f => f.endsWith('.js')).length,
        json: files.filter(f => f.endsWith('.json')).length,
        config: files.filter(f => f.includes('config') || f.includes('.env')).length
    };
    
    console.log('\n📈 File Breakdown:');
    console.log(`   • TypeScript: ${breakdown.typescript}`);
    console.log(`   • JavaScript: ${breakdown.javascript}`);
    console.log(`   • JSON: ${breakdown.json}`);
    console.log(`   • Config: ${breakdown.config}`);
}

// Run if called directly
if (require.main === module) {
    generateCodeDocumentation();
}

module.exports = { generateCodeDocumentation };
