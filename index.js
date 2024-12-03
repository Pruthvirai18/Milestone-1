const express = require('express');
const bodyParser = require('body-parser');
const habitRoutes = require('./routes/habits');
const startWebSocketServer = require('./utils/cronJobs');

const app = express();


app.use(bodyParser.json());


app.use('/api', habitRoutes);


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


startWebSocketServer();
