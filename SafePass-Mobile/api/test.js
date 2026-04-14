module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: "SafePass API test endpoint is reachable.",
    runtime: "vercel",
    timestamp: new Date().toISOString(),
  });
};
