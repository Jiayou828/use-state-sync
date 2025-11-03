const fs = require('fs');
const { minify } = require('terser');

async function build() {
  const code = fs.readFileSync('dist/index.js', 'utf8');
  
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

  fs.writeFileSync('dist/index.js', result.code);
  
  // Copy README.md to dist directory
  if (fs.existsSync('README.md')) {
    fs.copyFileSync('README.md', 'dist/README.md');
    console.log('✓ README.md copied to dist');
  }
  
  console.log('✓ Code minified and mangled successfully');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});


