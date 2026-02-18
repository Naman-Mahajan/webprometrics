const { Router } = require('express');
const userRoutes = require('./user.js');

const router = Router();

router.use('/users', userRoutes);
// Add more route modules as needed

module.exports = router;
