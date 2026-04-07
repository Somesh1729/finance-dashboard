const userService = require('../services/UserService');
const { sendSuccess, sendCreated } = require('../utils/Response');

class UserController {
  constructor() {
    this.userService = new UserService();
    this.list   = this.list.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  list(req, res, next) {
    try {
      const users = this.userService.listUsers();
      sendSuccess(res, users, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  }

  getOne(req, res, next) {
    try {
      const user = this.userService.getUserById(req.params.id);
      sendSuccess(res, user, 'User retrieved');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const user = await this.userService.createUser(req.body);
      sendCreated(res, user, 'User created successfully');
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const user = this.userService.updateUser(req.params.id, req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  }

  remove(req, res, next) {
    try {
      this.userService.deleteUser(req.params.id, req.user.id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
