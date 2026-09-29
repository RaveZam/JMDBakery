#!/usr/bin/env node
// Builds src/lib/ph-address/ph-address-data.json from the PSGC (Philippine
// Standard Geographic Code) sqlite database published by the ph-address
// project: https://github.com/kosinix/ph-address (sqlite/ph-addresses.db,
// PSGC 3Q 2022 datafile).
//
// We read that db file directly with Node's built-in node:sqlite instead of
// installing the ph-address package, which pulls in sequelize + sqlite3 and
// their native build tooling (node-gyp, node-tar, shell-quote) purely to
// open one bundled file — those transitive deps carry known critical
// vulnerabilities and we don't need any of ph-address's own JS code.
//
// To regenerate: download ph-addresses.db from the repo above (or clone it
// and run `npm install` there once to fetch the db) and run:
//   node scripts/generate-ph-address-data.js /path/to/ph-addresses.db
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const OUT_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "ph-address",
  "ph-address-data.json",
);
const NCR_PROVINCE = "Metro Manila";
const NOT_A_PROVINCE_SUFFIX = " (Not a Province)";

function stripNotAProvince(name) {
  return name.endsWith(NOT_A_PROVINCE_SUFFIX)
    ? name.slice(0, -NOT_A_PROVINCE_SUFFIX.length)
    : name;
}

// NCR has no provinces: barangay rows carry the city/municipality directly in
// provName (Manila's districts all share provName "City of Manila", which is
// how this merges Tondo/Sampaloc/etc. into one city). Pateros is the one NCR
// municipality with provName empty, so it falls back to cityMunName.
function resolveProvinceAndCity(row) {
  if (row.regName.includes("National Capital Region")) {
    const city = (row.provName || row.cityMunName).trim();
    return { province: NCR_PROVINCE, city };
  }
  return {
    province: stripNotAProvince(row.provName.trim()),
    city: row.cityMunName.trim(),
  };
}

function readBarangayRows(dbPath) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const rows = db
    .prepare(
      "SELECT name, cityMunName, provName, regName FROM Addresses WHERE level = 'Bgy'",
    )
    .all();
  db.close();
  return rows;
}

function buildTree(rows) {
  const tree = {};
  for (const row of rows) {
    const { province, city } = resolveProvinceAndCity(row);
    const barangay = row.name.trim();
    if (!province || !city || !barangay) continue;
    tree[province] ??= {};
    tree[province][city] ??= new Set();
    tree[province][city].add(barangay);
  }
  let barangayCount = 0;
  for (const province of Object.keys(tree)) {
    for (const city of Object.keys(tree[province])) {
      const barangays = [...tree[province][city]].sort();
      tree[province][city] = barangays;
      barangayCount += barangays.length;
    }
  }
  return { tree, barangayCount };
}

function main() {
  const dbPath = process.argv[2];
  if (!dbPath) {
    console.error(
      "Usage: node scripts/generate-ph-address-data.js /path/to/ph-addresses.db",
    );
    process.exit(1);
  }
  const rows = readBarangayRows(dbPath);
  const { tree, barangayCount } = buildTree(rows);
  fs.writeFileSync(OUT_PATH, JSON.stringify(tree));
  console.log(
    `Wrote ${Object.keys(tree).length} provinces, ${barangayCount} barangays to ${OUT_PATH}`,
  );
}

main();
