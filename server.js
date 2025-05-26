app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.resolve(__dirname, "frontend/dist/index.html"));
  } else {
    next();
  }
});
