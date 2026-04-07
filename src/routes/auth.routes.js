const { Router } = require('express');
const authController = require('../controllers/AuthController');
const authenticate   = require('../middleware/authenticate');
const validate       = require('../middleware/validate');
const { loginSchema, createUserSchema } = require('../validators/schemas');

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);

router.post('/register', validate(createUserSchema), AuthController.register);

router.get('/me', authenticate, AuthController.me);

module.exports = router;
