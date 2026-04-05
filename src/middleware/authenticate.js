const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const {getDb} = require('../config/database');

const authenticate = (req,res,next)=>{
  const authHeader = req.headers['authorization'];

  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return next(ApiError.unauthorized('Authorization header missing or token invalid'));
  }

  const token = authHeader.split(' ')[1];

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET|| 'dev_secret');
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(payload.id);

    if(!user) return next(ApiError.unauthorized('User not found'));
    if(user.status === 'inactive') return next(ApiError.unauthorized('User account is inactive'));

    req.user = user;
    next();
  }catch(err){
    return next(ApiError.unauthorized('Invalid or expiredtoken'));
  }
};

module.exports = authenticate;