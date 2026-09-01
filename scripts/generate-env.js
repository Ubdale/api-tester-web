/* eslint-disable no-console */
/**
 * Writes src/environments/environment.prod.ts from the build environment.
 *
 * Angular compiles to static files, so the browser can never read a Vercel
 * environment variable at runtime - there is no server to read it from. The
 * value has to be baked into the bundle at build time, which is what this
 * does. `npm run build` runs it before ng build.
 *
 * The generated file is gitignored: it is an artifact of the build, and
 * committing it would let a stale localhost URL ship to production.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

// API_URL is the canonical name. NG_APP_API_URL is accepted too, since some
// hosts encourage a prefix to mark variables as build-time.
const apiUrl = (process.env.API_URL || process.env.NG_APP_API_URL || '').trim();

if (!apiUrl) {
  console.error(
    '\n[generate-env] API_URL is not set.\n' +
      '  A production build without it would call http://localhost:4000 from your\n' +
      "  users' browsers and fail. Set it to your deployed API, including /api:\n" +
      '    API_URL=https://your-api.onrender.com/api\n'
  );
  process.exit(1);
}

if (!/^https?:\/\//.test(apiUrl)) {
  console.error(`\n[generate-env] API_URL must start with http:// or https:// (got "${apiUrl}")\n`);
  process.exit(1);
}

// A trailing slash produces "…/api//auth/login", which some servers 404 on.
const normalized = apiUrl.replace(/\/+$/, '');

if (!normalized.endsWith('/api')) {
  console.warn(
    `[generate-env] warning: API_URL is "${normalized}" and does not end with /api. ` +
      'The backend mounts every route under /api, so this is probably wrong.'
  );
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  `// GENERATED FILE - do not edit, do not commit.\n` +
    `// Written by scripts/generate-env.js at build time.\n` +
    `export const environment = {\n` +
    `  production: true,\n` +
    `  apiUrl: '${normalized}'\n` +
    `};\n`
);

console.log(`[generate-env] wrote environment.prod.ts with apiUrl=${normalized}`);
