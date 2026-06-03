const { execSync } = require("child_process");

let version = "dev";
try {
  version = "v" + execSync("git rev-list --count HEAD").toString().trim();
} catch {}

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_VERSION: version,
  },
};
