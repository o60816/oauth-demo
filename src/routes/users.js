const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

router.get('/oauth', userController.oauthLogin);

module.exports = router;
