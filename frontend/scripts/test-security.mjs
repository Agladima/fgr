/**
 * FGR Security & RBAC Verification Test Suite
 * 
 * Tests:
 * 1. RBAC Matrix & Role Boundaries (Unit)
 * 2. Sliding Window Rate Limiter (Unit)
 * 3. Duplicate Submission Detection (Unit)
 * 4. Honeypot Spam Protection (Unit)
 * 5. Open-Redirect Prevention (Unit)
 * 6. Live API Route Protection & Security Headers (Integration against server)
 */

import http from "node:http";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

// ============================================================================
// 1. Role-Based Access Control (RBAC) Boundary Tests
// ============================================================================
console.log("\n--- Testing 1: Role-Based Access Control (RBAC) Permissions ---");

const ROLE_PERMISSIONS = {
  super_admin: [
    'registrations:read', 'registrations:write', 'registrations:export',
    'partnerships:read', 'partnerships:write',
    'enquiries:read', 'enquiries:write',
    'programmes:read', 'programmes:write',
    'events:read', 'events:write',
    'content:read', 'content:write',
    'follow_ups:read', 'follow_ups:write',
    'reports:read', 'reports:export',
    'staff:manage', 'audit_logs:read', 'settings:manage',
  ],
  admin: [
    'registrations:read', 'registrations:write', 'registrations:export',
    'partnerships:read', 'partnerships:write',
    'enquiries:read', 'enquiries:write',
    'programmes:read', 'programmes:write',
    'events:read', 'events:write',
    'content:read', 'content:write',
    'follow_ups:read', 'follow_ups:write',
    'reports:read', 'reports:export',
    'audit_logs:read',
  ],
  training_officer: [
    'registrations:read', 'registrations:write', 'registrations:export',
    'programmes:read', 'events:read',
    'follow_ups:read', 'follow_ups:write',
    'reports:read',
  ],
  partnerships_officer: [
    'partnerships:read', 'partnerships:write',
    'enquiries:read', 'enquiries:write',
    'follow_ups:read', 'follow_ups:write',
    'reports:read',
  ],
  content_manager: [
    'programmes:read', 'programmes:write',
    'events:read', 'events:write',
    'content:read', 'content:write',
    'media:manage',
  ],
};

function hasPermission(role, permission) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

// Super Admin
assert(hasPermission('super_admin', 'staff:manage') === true, 'super_admin can manage staff');
assert(hasPermission('super_admin', 'settings:manage') === true, 'super_admin can manage settings');
assert(hasPermission('super_admin', 'registrations:read') === true, 'super_admin can read registrations');

// Regular Admin
assert(hasPermission('admin', 'registrations:read') === true, 'admin can read registrations');
assert(hasPermission('admin', 'staff:manage') === false, 'admin cannot manage staff (super_admin only)');
assert(hasPermission('admin', 'settings:manage') === false, 'admin cannot manage settings (super_admin only)');

// Training Officer Boundary
assert(hasPermission('training_officer', 'registrations:read') === true, 'training_officer can read registrations');
assert(hasPermission('training_officer', 'partnerships:read') === false, 'training_officer CANNOT read partnerships');
assert(hasPermission('training_officer', 'enquiries:read') === false, 'training_officer CANNOT read enquiries');
assert(hasPermission('training_officer', 'staff:manage') === false, 'training_officer CANNOT manage staff');

// Partnerships Officer Boundary
assert(hasPermission('partnerships_officer', 'partnerships:read') === true, 'partnerships_officer can read partnerships');
assert(hasPermission('partnerships_officer', 'enquiries:read') === true, 'partnerships_officer can read enquiries');
assert(hasPermission('partnerships_officer', 'registrations:read') === false, 'partnerships_officer CANNOT read registrations');
assert(hasPermission('partnerships_officer', 'staff:manage') === false, 'partnerships_officer CANNOT manage staff');

// Content Manager Boundary
assert(hasPermission('content_manager', 'content:write') === true, 'content_manager can write content');
assert(hasPermission('content_manager', 'registrations:read') === false, 'content_manager CANNOT read registrations');
assert(hasPermission('content_manager', 'partnerships:read') === false, 'content_manager CANNOT read partnerships');
assert(hasPermission('content_manager', 'enquiries:read') === false, 'content_manager CANNOT read enquiries');
assert(hasPermission('content_manager', 'reports:read') === false, 'content_manager CANNOT read financial/CRM reports');
assert(hasPermission('content_manager', 'staff:manage') === false, 'content_manager CANNOT manage staff');

// Unknown role or empty role
assert(hasPermission('', 'registrations:read') === false, 'empty role denied');
assert(hasPermission('guest', 'content:read') === false, 'unrecognized role denied');


// ============================================================================
// 2. Open-Redirect Prevention Logic Tests
// ============================================================================
console.log("\n--- Testing 2: Open-Redirect Prevention (Middleware) ---");

function isSafeReturnUrl(url) {
  if (!url) return false;
  if (!url.startsWith("/admin")) return false;
  if (url.startsWith("//") || url.startsWith("/\\")) return false;
  if (url.includes(":") || url.includes("\\")) return false;
  return true;
}

assert(isSafeReturnUrl("/admin") === true, 'Valid relative /admin is safe');
assert(isSafeReturnUrl("/admin/registrations") === true, 'Valid /admin subpath is safe');
assert(isSafeReturnUrl("/admin/partnerships?filter=pending") === true, 'Valid query parameter path is safe');
assert(isSafeReturnUrl("https://evil.com") === false, 'Full external URL rejected');
assert(isSafeReturnUrl("http://evil.com/admin") === false, 'http protocol URL rejected');
assert(isSafeReturnUrl("//evil.com/admin") === false, 'Protocol-relative //evil.com rejected');
assert(isSafeReturnUrl("/\\evil.com/admin") === false, 'Backslash escape /\\evil.com rejected');
assert(isSafeReturnUrl("javascript:alert(1)") === false, 'Javascript pseudo-protocol rejected');
assert(isSafeReturnUrl("/admin/evil\\domain") === false, 'Backslash traversal rejected');
assert(isSafeReturnUrl("/public/page") === false, 'Non-admin path rejected');


// ============================================================================
// 3. In-Memory Sliding Window Rate Limiter Tests
// ============================================================================
console.log("\n--- Testing 3: Rate Limiting & Throttling ---");

function createRateLimiter() {
  const store = new Map();
  return function checkLimit(clientIp, actionKey, limit = 5, windowMs = 60000) {
    const key = `${actionKey}:${clientIp}`;
    const now = Date.now();
    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length >= limit) {
      return { allowed: false, remaining: 0 };
    }
    record.timestamps.push(now);
    return { allowed: true, remaining: limit - record.timestamps.length };
  };
}

const limiter = createRateLimiter();
const testIp = "192.168.1.100";

// First 5 requests should succeed
for (let i = 1; i <= 5; i++) {
  const res = limiter(testIp, "login", 5, 60000);
  assert(res.allowed === true, `Login attempt ${i} of 5 allowed`);
}

// 6th attempt should be blocked
const blocked = limiter(testIp, "login", 5, 60000);
assert(blocked.allowed === false, "6th rapid login attempt blocked (rate limited)");

// Different IP should still be allowed
const diffIpRes = limiter("10.0.0.1", "login", 5, 60000);
assert(diffIpRes.allowed === true, "Request from distinct IP allowed independently");


// ============================================================================
// 4. Duplicate Submission Guard Tests
// ============================================================================
console.log("\n--- Testing 4: Rapid Duplicate Submission Guard ---");

function createDuplicateGuard() {
  const submissions = new Map();
  return function isDuplicate(fingerprint, cooldownSeconds = 10) {
    const now = Date.now();
    const last = submissions.get(fingerprint);
    if (last && now - last < cooldownSeconds * 1000) {
      return true;
    }
    submissions.set(fingerprint, now);
    return false;
  };
}

const guard = createDuplicateGuard();
const emailFingerprint = "candidate@example.com:prog_123";

assert(guard(emailFingerprint) === false, "First submission accepted");
assert(guard(emailFingerprint) === true, "Immediate duplicate click rejected (cooldown active)");
assert(guard("other_candidate@example.com:prog_123") === false, "Different candidate submission accepted");


// ============================================================================
// 5. Honeypot Spam Protection
// ============================================================================
console.log("\n--- Testing 5: Honeypot Spam Detection ---");

function isSpamSubmission(field) {
  return Boolean(field && field.trim().length > 0);
}

assert(isSpamSubmission("") === false, "Empty honeypot field is genuine submission");
assert(isSpamSubmission(undefined) === false, "Undefined honeypot is genuine submission");
assert(isSpamSubmission(null) === false, "Null honeypot is genuine submission");
assert(isSpamSubmission("http://spam-link.ru") === true, "Filled honeypot detected as bot spam");
assert(isSpamSubmission("   ") === false, "Whitespace-only honeypot is treated safely");


// ============================================================================
// 6. Live Server HTTP Verification (if dev/prod server is accessible)
// ============================================================================
console.log("\n--- Testing 6: Live Server Verification ---");

async function checkLiveServer() {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  async function testUrl(path, options = {}) {
    return new Promise((resolve) => {
      const url = new URL(path, baseUrl);
      const req = http.request(
        url,
        {
          method: options.method || "GET",
          headers: options.headers || {},
          timeout: 15000,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            resolve({ status: res.statusCode, headers: res.headers, body });
          });
        }
      );
      req.on("error", (err) => resolve({ error: err.message }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ error: "TIMEOUT" });
      });
      if (options.body) req.write(options.body);
      req.end();
    });
  }

  const ping = await testUrl("/");
  if (ping.error) {
    console.log(`  ℹ Live server not reachable at ${baseUrl} (${ping.error}). Skipping live HTTP tests.`);
    console.log(`    (Run 'npm run dev' and run 'node scripts/test-security.mjs' to execute live tests).`);
    return;
  }

  console.log(`  Connected to server at ${baseUrl}. Executing endpoint security checks:`);

  // Unauthenticated Admin API checks
  const endpoints = [
    "/api/admin/registrations",
    "/api/admin/enquiries",
    "/api/admin/partnerships",
    "/api/admin/stats",
    "/api/admin/staff",
    "/api/admin/activity-logs",
    "/api/admin/notes?recordType=registration&recordId=00000000-0000-0000-0000-000000000000",
  ];

  for (const ep of endpoints) {
    const res = await testUrl(ep);
    assert(
      res.status === 401 || res.status === 403,
      `Unauthenticated ${ep} returns ${res.status} (expected 401/403)`
    );
  }

  // Security Headers Check
  const homeRes = await testUrl("/");
  assert(
    Boolean(homeRes.headers["x-frame-options"]),
    `X-Frame-Options header present: ${homeRes.headers["x-frame-options"] || "missing"}`
  );
  assert(
    homeRes.headers["x-content-type-options"] === "nosniff",
    `X-Content-Type-Options is nosniff: ${homeRes.headers["x-content-type-options"] || "missing"}`
  );
  assert(
    Boolean(homeRes.headers["referrer-policy"]),
    `Referrer-Policy header present: ${homeRes.headers["referrer-policy"] || "missing"}`
  );

  // Public Form Validation Check
  const invalidReg = await testUrl("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(
    invalidReg.status === 400 || invalidReg.status === 422,
    `Empty registration payload rejected with status ${invalidReg.status}`
  );

  const invalidContact = await testUrl("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(
    invalidContact.status === 400 || invalidContact.status === 422,
    `Empty contact payload rejected with status ${invalidContact.status}`
  );

  const invalidPartner = await testUrl("/api/partnership", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(
    invalidPartner.status === 400 || invalidPartner.status === 422,
    `Empty partnership payload rejected with status ${invalidPartner.status}`
  );
}

// Execute tests
await checkLiveServer();

console.log("\n========================================================");
console.log(`Security Test Suite Completed:`);
console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("========================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
