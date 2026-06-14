const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const root = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(express.static(root));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(root, 'alumni-portal-landing.html'));
});

app.listen(PORT, () => {
    console.log(`AlumniConnect server running at http://localhost:${PORT}`);
    console.log('Demo accounts: student@demo.com / michael@demo.com — password: demo1234');
});
