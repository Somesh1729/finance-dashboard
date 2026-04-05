const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../repositories/UserRepository');
const ApiError = require('../utils/ApiError');
const { USER_STATUS } = require('../constants');

class UserService {
  constructor() {
    this.userRepo = new UserRepository();
  }

  listUsers() {
    return this.userRepo.findAll();
  }

  getUserById(id) {
    const user = this.userRepo.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async createUser({ name, email, password, role }) {
    if (this.userRepo.existsByEmail(email)) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userRepo.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      status: USER_STATUS.ACTIVE,
    });
  }

  updateUser(id, fields) {
    this.getUserById(id);
    const updated = this.userRepo.update(id, fields);
    if (!updated) throw ApiError.internal('Update failed');
    return updated;
  }

  deleteUser(id, requesterId) {
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }
    this.getUserById(id); 
    this.userRepo.delete(id);
  }
}

module.exports = UserService;