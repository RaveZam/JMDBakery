const { defineConfig, globalIgnores } = require("eslint/config");
const expo = require("eslint-config-expo/flat");

// --- Layering guardrail -------------------------------------------------
// Dependencies may only point "down": app -> features -> shared -> lib.
// Features must not import each other, except the few declared edges below.
const FEATURES = [
  "auth",
  "routes",
  "sessions",
  "inventory",
  "history",
  "store",
  "settings",
];

// Allowed cross-feature edges: importer -> [allowed targets].
// Keep this list tiny; every entry is a coupling we accept on purpose.
const ALLOWED_FEATURE_EDGES = {
  routes: ["sessions"], // RouteDetailScreen starts a session via useStartSession
  inventory: ["store", "sessions"], // reuses store's picker/types; can cancel the ongoing session
  history: ["store"], // session history renders store distribution items
};

const crossFeatureZones = FEATURES.flatMap((importer) =>
  FEATURES.filter(
    (target) =>
      target !== importer &&
      !(ALLOWED_FEATURE_EDGES[importer] || []).includes(target),
  ).map((target) => ({
    target: `./src/features/${importer}`,
    from: `./src/features/${target}`,
    message: `Feature "${importer}" must not import from feature "${target}". Move shared code down into src/shared or src/lib, or declare the edge in eslint.config.js.`,
  })),
);

const layerZones = [
  // lib is the bottom layer: it owns data/infra and depends on nothing above it.
  {
    target: "./src/lib",
    from: "./src/features",
    message: "src/lib (data layer) must not import from features.",
  },
  {
    target: "./src/lib",
    from: "./src/shared",
    message: "src/lib (data layer) must not import from src/shared.",
  },
  // shared sits above lib but below features: it may use lib, never features/app.
  {
    target: "./src/shared",
    from: "./src/features",
    message: "src/shared must not import from features.",
  },
];

const eslintConfig = defineConfig([
  ...expo,

  {
    rules: {
      "max-lines-per-function": ["error", { max: 40 }],
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-lines": ["warn", 300],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",

      "import/no-restricted-paths": [
        "error",
        { zones: [...layerZones, ...crossFeatureZones] },
      ],
    },
  },

  globalIgnores(["dist/**", "build/**", ".expo/**", "android/**", "expo-env.d.ts"]),
]);

module.exports = eslintConfig;
