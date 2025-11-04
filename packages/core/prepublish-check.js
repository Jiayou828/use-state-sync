const fs = require('fs');
const path = require('path');

// 读取 package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 检查所有依赖字段是否有 workspace 协议
const checkForWorkspace = (deps) => {
  if (!deps) return false;
  return Object.values(deps).some(value => 
    typeof value === 'string' && value.startsWith('workspace:')
  );
};

const hasWorkspace = 
  checkForWorkspace(packageJson.dependencies) ||
  checkForWorkspace(packageJson.devDependencies) ||
  checkForWorkspace(packageJson.optionalDependencies) ||
  checkForWorkspace(packageJson.peerDependencies);

if (hasWorkspace) {
  console.error('❌ Error: package.json contains workspace: protocol references!');
  console.error('This package cannot be published to npm with workspace: dependencies.');
  process.exit(1);
}

console.log('✓ package.json validation passed - no workspace: protocols found');

