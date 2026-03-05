const express = require('express');
const router = express.Router();
const { Complaint } = require('../models');

// GET /share/complaint/:id
// Serves a simple HTML page with OpenGraph tags for social media preview
router.get('/complaint/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findByPk(req.params.id);
        if (!complaint) return res.status(404).send('Complaint not found');

        const title = complaint.title;
        const description = complaint.description.substring(0, 150) + '...';
        // Base URL for images - needs to be updated for production
        const imageUrl = complaint.image_url ? `https://jansoochna.app/${complaint.image_url}` : 'https://jansoochna.app/logo.png';
        const pageUrl = `https://jansoochna.app/share/complaint/${complaint.id}`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${title} | JanSoochna</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <style>
        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; color: #1e293b; padding: 20px; text-align: center; }
        .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 500px; }
        h1 { color: #2563eb; margin-bottom: 15px; }
        p { line-height: 1.6; }
        .btn { background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>JanSoochna</h1>
        <h2>${title}</h2>
        <p>${complaint.description}</p>
        <span class="btn">View in App</span>
    </div>
    <script>
        // Optional: Redirect to app scheme
        // window.location.href = "jansoochna://complaint/${complaint.id}";
    </script>
</body>
</html>
        `;
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
