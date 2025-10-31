#!/usr/bin/env node
/**
 * Generate PNG icons from SVG for Chrome extension
 * Creates proper sized icons: 16x16, 32x32, 48x48, 128x128
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tab Nudge icon SVG template
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#2563eb"/>
  <g transform="translate(4, 4)">
    <path d="M2 4h12M2 8h12M2 12h12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="14" cy="2" r="2" fill="#ef4444"/>
  </g>
</svg>`;
}

// Generate SVG files for different sizes
function generateIcons() {
  const sizes = [16, 32, 48, 128];
  const iconsDir = path.join(__dirname, 'dist', 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Generating Tab Nudge icons...');
  
  sizes.forEach(size => {
    const svgContent = createIconSVG(size);
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✓ Generated icon-${size}.svg`);
  });

  console.log('\n📝 For PNG conversion, you can:');
  console.log('1. Use online tools like https://svg2png.com');
  console.log('2. Use Inkscape: inkscape -w 16 -h 16 icon-16.svg -o icon-16.png');
  console.log('3. Use ImageMagick: convert icon-16.svg -resize 16x16 icon-16.png');
  console.log('\nFor now, copying existing PNG as placeholders...');
  
  // Use existing icon-16.png as base for other sizes
  const basePngPath = path.join(iconsDir, 'icon-16.png');
  
  if (fs.existsSync(basePngPath)) {
    sizes.forEach(size => {
      if (size !== 16) {
        const targetPath = path.join(iconsDir, `icon-${size}.png`);
        fs.copyFileSync(basePngPath, targetPath);
        console.log(`✓ Created placeholder icon-${size}.png`);
      }
    });
  } else {
    console.log('⚠️  No base PNG found. Please create icon PNGs manually.');
  }
}

generateIcons();