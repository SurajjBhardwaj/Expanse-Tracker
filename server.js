const path = require("path");

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.resolve(__dirname, "frontend/dist/index.html"));
  } else {
    next();
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend/dist/index.html"));
});
