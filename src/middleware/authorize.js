const { PERMISSIONS } = require('../constants');
const ApiError = require('../utils/ApiError');

const authorize = (permission) => (req, res, next) => {
  const userPermissions = PERMISSIONS[req.user?.role] || [];

  if (!userPermissions.includes(permission)) {
    return next(ApiError.forbidden());
  }

  next();
};

module.exports = authorize;