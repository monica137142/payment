const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const serverDir = path.join(dist, "server");

const files = {
  html: fs.readFileSync(path.join(root, "index.html"), "utf8"),
  css: fs.readFileSync(path.join(root, "styles.css"), "utf8"),
  js: fs.readFileSync(path.join(root, "app.js"), "utf8"),
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(serverDir, { recursive: true });

const worker = `
const assets = {
  "/": { body: ${JSON.stringify(files.html)}, type: "text/html; charset=utf-8" },
  "/index.html": { body: ${JSON.stringify(files.html)}, type: "text/html; charset=utf-8" },
  "/styles.css": { body: ${JSON.stringify(files.css)}, type: "text/css; charset=utf-8" },
  "/app.js": { body: ${JSON.stringify(files.js)}, type: "application/javascript; charset=utf-8" }
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname] || assets["/"];
    return new Response(asset.body, {
      headers: {
        "content-type": asset.type,
        "cache-control": "public, max-age=60"
      }
    });
  }
};
`.trimStart();

fs.writeFileSync(path.join(serverDir, "index.js"), worker);
console.log("Built dist/server/index.js");
