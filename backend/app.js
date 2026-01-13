const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config');


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/users', require('./userRoutes'));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);