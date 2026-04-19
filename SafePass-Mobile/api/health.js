module.exports = (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "SafePass API",
    runtime: "vercel",
    timestamp: new Date().toISOString(),
  });
};
