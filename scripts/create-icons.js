import fs from 'fs'
import path from 'path'

const iconDir = 'public/icons'

// Ensure icons directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true })
}

// Simple SVG icon for Tab Nudge
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <rect x="2" y="3" width="20" height="18" rx="2" stroke="#2563eb" stroke-width="2" fill="#dbeafe"/>
  <rect x="4" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
  <rect x="9" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
  <rect x="14" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
  <circle cx="18" cy="7.5" r="2" fill="#ef4444"/>
  <text x="18" y="9" text-anchor="middle" fill="white" font-size="8" font-weight="bold">!</text>
</svg>`

// Convert SVG to different sizes (simplified approach)
const sizes = [16, 32, 48, 128]

sizes.forEach(size => {
  // For now, just create a simple colored square as placeholder
  // In a real project, you'd use a proper image processing library
  const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="#2563eb" stroke-width="2" fill="#dbeafe"/>
    <rect x="4" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
    <rect x="9" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
    <rect x="14" y="6" width="4" height="3" rx="1" fill="#2563eb"/>
    <circle cx="18" cy="7.5" r="2" fill="#ef4444"/>
    <text x="18" y="9" text-anchor="middle" fill="white" font-size="8" font-weight="bold">!</text>
  </svg>`
  
  fs.writeFileSync(path.join(iconDir, `icon-${size}.svg`), canvas)
})

console.log('Icons created successfully!')
console.log('Note: SVG icons created as placeholders. For production, convert to PNG format.')