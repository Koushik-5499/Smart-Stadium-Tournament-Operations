const { execSync } = require('child_process');

const envs = {
  VITE_FIREBASE_PROJECT_ID: 'smart-stadium-wc2026',
  VITE_FIREBASE_STORAGE_BUCKET: 'smart-stadium-wc2026.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '374908450938',
  VITE_FIREBASE_APP_ID: '1:374908450938:web:9c302f6226f016514523c3'
};

for (const [key, value] of Object.entries(envs)) {
  console.log(`Adding ${key}...`);
  try {
    execSync(`npx vercel env add ${key} production --value "${value}" --yes`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to add ${key}`);
  }
}
console.log("Done");
