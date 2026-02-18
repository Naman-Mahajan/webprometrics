const { Router } = require('express');
const { getAllUsers, signup, login } = require('../controllers/userController.js');

const router = Router();

router.get('/', getAllUsers);
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
