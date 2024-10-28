const express = require('express');
const connectDB = require('./db/db');
const stockRoutes = require('./handlers/stockHandlers');
const cors = require('cors')

const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(cors())
app.use('/api/stocks', stockRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
