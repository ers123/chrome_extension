import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('📦 Packaging Tab Nudge Extension...')

// Ensure dist directory exists and is clean
if (fs.existsSync('dist')) {
  console.log('🧹 Cleaning existing dist directory...')
  execSync('rm -rf dist')
}

console.log('🔨 Building extension...')
execSync('npm run build', { stdio: 'inherit' })

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version

// Create zip file
console.log(`📦 Creating extension package (v${version})...`)
const zipName = `tab-nudge-v${version}.zip`

// Remove unwanted OS metadata files
execSync("find dist -name '.DS_Store' -delete || true")

try {
  execSync(`cd dist && zip -r ../${zipName} . -x '*.DS_Store'`, { stdio: 'inherit' })
  
  // Generate checksum
  const checksum = execSync(`shasum -a 256 ${zipName}`).toString().trim()
  fs.writeFileSync(`${zipName}.sha256`, checksum)
  
  console.log('✅ Package created successfully!')
  console.log(`📁 File: ${zipName}`)
  console.log(`🔐 Checksum: ${checksum}`)
  console.log('')
  console.log('🚀 Ready for Chrome Web Store upload!')
  
} catch (error) {
  console.error('❌ Error creating package:', error.message)
  process.exit(1)
}
