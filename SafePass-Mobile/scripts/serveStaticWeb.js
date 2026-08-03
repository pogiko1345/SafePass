const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "static");
const port = Number(process.env.PORT || process.argv[2] || 19006);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const sendFile = (response, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unable to read static file.");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    response.end(data);
  });
};

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("static/index.html was not found. Run npm run build:web first.");
  process.exit(1);
}

http
  .createServer((request, response) => {
    const requestedPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const safePath = path
      .normalize(requestedPath)
      .replace(/^(\.\.[/\\])+/, "")
      .replace(/^[/\\]/, "");
    const filePath = path.join(root, safePath || "index.html");

    if (filePath.startsWith(root) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(response, filePath);
      return;
    }

    sendFile(response, path.join(root, "index.html"));
  })
  .listen(port, () => {
    console.log(`SafePass web preview running at http://localhost:${port}`);
  });
