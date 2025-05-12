const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

console.log("🚀 Running the test-server.js from:", __filename);

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

app.put('/api/spaces/:id', (req, res) => {
  console.log("[DEBUG] PUT /api/spaces/:id route triggered");

  const { id } = req.params;
  const { status, userId } = req.body;

  console.log("Received PUT with:", { id, status, userId });

  res.json({ message: 'THIS IS DEFINITELY TEST SERVER' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
