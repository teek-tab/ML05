const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/numbers'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ ML05 API lancée sur http://localhost:${PORT}`);
});
