const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
