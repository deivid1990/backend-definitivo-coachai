require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const routineRoutes = require('./routes/routine.routes');

app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
