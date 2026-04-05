const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../repositories/UserRepository');
const ApiError = require('../utils/ApiError');
const { ROLES, USER_STATUS } = require('../constants');

class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
  }

  async register({ name, email, password, role = ROLES.VIEWER }) {
    if (this.userRepo.existsByEmail(email)) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      id: uuidv4(),      
      name,
      email,
      password: hashedPassword,
      role,
      status: USER_STATUS.ACTIVE,
    });

    return user;
  }

  async login({ email, password }) {
    const user = this.userRepo.findByEmail(email);
    if (!user) throw ApiError.unauthorized('Invalid credentials');

    if (user.status === USER_STATUS.INACTIVE) {
      throw ApiError.unauthorized('Account is inactive');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw ApiError.unauthorized('Invalid credentials');

    const token = this._signToken(user);
    const { password: _removed, ...safeUser } = user;
    return { token, user: safeUser };
  }

  _signToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }
}

module.exports = AuthService;