const AuthService = require('../services/AuthService');
const { sendSuccess, sendCreated } = require('../utils/Response');

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.login    = this.login.bind(this);
    this.register = this.register.bind(this);
    this.me       = this.me.bind(this);
  }

  async login(req, res, next) {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err); 
    }
  }

  async register(req, res, next) {
    try {
      const user = await this.authService.register(req.body);
      sendCreated(res, user, 'Account created successfully');
    } catch (err) {
      next(err);
    }
  }
  me(req, res) {
    sendSuccess(res, req.user, 'Authenticated user info');
  }
}

module.exports = new AuthController();