const fs = require("fs");

let version = "dev";
try {
  version = "v" + fs.readFileSync("./version.txt", "utf8").trim();
} catch {}

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_VERSION: version,
  },
};
