import fs from 'fs'
import path from 'path'

const map = {
  'src/popup/index.html': 'popup.html',
  'src/options/index.html': 'options.html',
  'src/sidepanel/index.html': 'sidepanel.html',
  'src/actions/index.html': 'actions.html',
  'src/dashboard/index.html': 'dashboard.html',
}

const dist = 'dist'

function copyIfExists(fromRel, toRel) {
  const from = path.join(dist, fromRel)
  const to = path.join(dist, toRel)
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to)
    console.log(`✓ ${fromRel} → ${toRel}`)
  }
}

console.log('🧩 Post-build: normalizing HTML entry points...')
Object.entries(map).forEach(([from, to]) => copyIfExists(from, to))

// Optional: leave src/ tree for inspection; uncomment to remove
// fs.rmSync(path.join(dist, 'src'), { recursive: true, force: true })
console.log('✅ Post-build HTML normalization complete.')

