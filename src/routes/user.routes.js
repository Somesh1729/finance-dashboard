const { Router } = require('express');
const userController = require('../controllers/UserController');
const authenticate   = require('../middleware/authenticate');
const authorize      = require('../middleware/authorize');
const validate       = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/schemas');

const router = Router();

router.use(authenticate);
router.use(authorize('users:read'));


router
  .route('/')
  .get(userController.list)
  .post(authorize('users:create'), validate(createUserSchema), userController.create);

router
  .route('/:id')
  .get(userController.getOne)
  .patch(authorize('users:update'), validate(updateUserSchema), userController.update)
  .delete(authorize('users:delete'), userController.remove);

module.exports = router;