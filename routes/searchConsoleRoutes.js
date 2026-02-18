// Express routes for Google Search Console integration
const express = require('express');
const router = express.Router();
// const { SearchConsoleService } = require('../services/searchConsoleService');

// POST /api/integrations/search-console/auth
router.post('/integrations/search-console/auth', async (req, res) => {
  // TODO: Handle OAuth2 callback, store tokens
  res.json({ message: 'Not implemented' });
});

// GET /api/search-console/keywords
router.get('/search-console/keywords', async (req, res) => {
  // TODO: Return stored keyword data
  res.json({ keywords: [] });
});

// POST /api/search-console/keywords/fetch
router.post('/search-console/keywords/fetch', async (req, res) => {
  // TODO: Trigger manual fetch from Google
  res.json({ message: 'Not implemented' });
});

module.exports = router;
