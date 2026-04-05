const { Router } = require('express');
const recordController = require('../controllers/FinancialRecordController');
const authenticate     = require('../middleware/authenticate');
const authorize        = require('../middleware/authorize');
const validate         = require('../middleware/validate');
const {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} = require('../validators/schemas');

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize('records:read'), validate(recordFilterSchema, 'query'), recordController.list)
  .post(authorize('records:create'), validate(createRecordSchema), recordController.create);

router
  .route('/:id')
  .get(authorize('records:read'), recordController.getOne)
  .patch(authorize('records:update'), validate(updateRecordSchema), recordController.update)
  .delete(authorize('records:delete'), recordController.remove);

module.exports = router;