#!/usr/bin/env node
/**
 * Create PNG icons using Canvas API (requires node-canvas)
 * Alternative: Creates base64 data URLs that can be converted to PNG
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create optimized SVG for each size
function createOptimizedSVG(size) {
  const strokeWidth = Math.max(1, size / 16);
  const cornerRadius = Math.max(2, size / 6);
  const tabSpacing = size / 8;
  const notificationRadius = size / 12;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#2563eb"/>
  <g>
    <path d="M${size/4} ${size/3}L${size*3/4} ${size/3}M${size/4} ${size/2}L${size*3/4} ${size/2}M${size/4} ${size*2/3}L${size*3/4} ${size*2/3}" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
    <circle cx="${size*0.8}" cy="${size*0.2}" r="${notificationRadius}" fill="#ef4444"/>
  </g>
</svg>`;
}

// Create data URLs for PNG conversion
function createDataURL(size) {
  const svgContent = createOptimizedSVG(size);
  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
}

// Generate optimized icons
function generateOptimizedIcons() {
  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join(__dirname, 'dist', 'icons');
  
  console.log('🎨 Creating optimized Tab Nudge icons...');
  
  sizes.forEach(size => {
    const svgContent = createOptimizedSVG(size);
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    const dataUrlPath = path.join(iconsDir, `icon-${size}-dataurl.txt`);
    const dataUrl = createDataURL(size);
    
    // Save optimized SVG
    fs.writeFileSync(svgPath, svgContent);
    
    // Save data URL for manual PNG conversion
    fs.writeFileSync(dataUrlPath, dataUrl);
    
    console.log(`✓ Generated optimized icon-${size}.svg`);
    console.log(`✓ Generated data URL for icon-${size}.png conversion`);
  });

  console.log('\n📱 To convert to PNG:');
  console.log('1. Open browser dev tools');
  console.log('2. Create new canvas element:');
  console.log('   const canvas = document.createElement("canvas")');
  console.log('   const ctx = canvas.getContext("2d")');
  console.log('   const img = new Image()');
  console.log('3. Load SVG and draw to canvas');
  console.log('4. Export as PNG using canvas.toDataURL()');
  console.log('\nOR use online converter with the generated SVG files.');
}

generateOptimizedIcons();