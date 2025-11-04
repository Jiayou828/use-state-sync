const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createHash } = require('crypto');
const { minify } = require('terser');

async function build() {
  const distFile = path.join(__dirname, 'dist/index.js');
  
  if (!fs.existsSync(distFile)) {
    console.log('⚠️  dist/index.js not found, waiting for tsc to compile...');
    return;
  }
  
  const code = fs.readFileSync(distFile, 'utf8');
  
  const result = await minify(code, {
    compress: {
      passes: 5,
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      unsafe: true,
      unsafe_comps: true,
      unsafe_math: true,
      unsafe_methods: true,
      pure_funcs: ['console.error']
    },
    mangle: {
      toplevel: true,
      reserved: ['useStateSync']
    },
    format: {
      comments: false,
      beautify: false
    }
  });

  fs.writeFileSync(distFile, result.code);
  
  // Copy README.md to dist directory
  const readmeSrc = path.join(__dirname, 'README.md');
  const readmeDest = path.join(__dirname, 'dist/README.md');
  if (fs.existsSync(readmeSrc)) {
    fs.copyFileSync(readmeSrc, readmeDest);
    console.log('✓ README.md copied to dist');
  }
  
  console.log('✓ Code minified and mangled successfully');
}

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  // Watch mode: start tsc --watch and monitor dist/index.js for changes
  const distFile = path.join(__dirname, 'dist/index.js');
  const distDir = path.join(__dirname, 'dist');
  
  console.log('👀 Starting watch mode...');
  console.log('   TypeScript compiler will watch for changes...');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Track file hash to avoid unnecessary rebuilds
  let lastFileHash = null;
  let isBuilding = false;
  
  // Function to get file hash
  function getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return createHash('md5').update(content).digest('hex');
  }
  
  // Start TypeScript compiler in watch mode
  const tscProcess = spawn('tsc', ['--watch'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  // Wait a bit for initial compilation, then do initial build
  setTimeout(() => {
    if (fs.existsSync(distFile)) {
      lastFileHash = getFileHash(distFile);
      build().catch(err => {
        console.error('Initial build failed:', err);
      });
    }
  }, 1000);
  
  // Watch for file changes
  let watchTimeout;
  fs.watch(distDir, (eventType, filename) => {
    if (filename === 'index.js' && eventType === 'change' && !isBuilding) {
      // Debounce: wait a bit for tsc to finish writing
      clearTimeout(watchTimeout);
      watchTimeout = setTimeout(() => {
        const currentHash = getFileHash(distFile);
        // Only build if file content actually changed
        if (currentHash && currentHash !== lastFileHash) {
          lastFileHash = currentHash;
          isBuilding = true;
          build()
            .then(() => {
              // Update hash after build (minified file is different)
              lastFileHash = getFileHash(distFile);
              isBuilding = false;
            })
            .catch(err => {
              console.error('Build failed:', err);
              isBuilding = false;
            });
        }
      }, 300);
    }
  });
  
  // Handle process termination
  const cleanup = () => {
    console.log('\n👋 Stopping watch mode...');
    tscProcess.kill();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Handle tsc process exit
  tscProcess.on('exit', (code) => {
    if (code !== null && code !== 0 && code !== 130) {
      console.error(`TypeScript compiler exited with code ${code}`);
      process.exit(code);
    }
  });
} else {
  // Normal build mode
  build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
}


