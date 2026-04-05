const FinancialRecordService = require('../services/FinancialRecordService');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/Response');

class FinancialRecordController {
  constructor() {
    this.recordService = new FinancialRecordService();
    this.list   = this.list.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  list(req, res, next) {
    try {
      const { page, limit, ...filters } = req.query;
      const { rows, total } = this.recordService.listRecords({
        ...filters, page, limit,
      });
      sendPaginated(res, rows, total, page, limit);
    } catch (err) {
      next(err);
    }
  }

  getOne(req, res, next) {
    try {
      const record = this.recordService.getRecordById(req.params.id);
      sendSuccess(res, record, 'Record retrieved');
    } catch (err) {
      next(err);
    }
  }

  create(req, res, next) {
    try {
      const record = this.recordService.createRecord(req.body, req.user.id);
      sendCreated(res, record, 'Record created successfully');
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const record = this.recordService.updateRecord(req.params.id, req.body);
      sendSuccess(res, record, 'Record updated successfully');
    } catch (err) {
      next(err);
    }
  }

  remove(req, res, next) {
    try {
      this.recordService.deleteRecord(req.params.id);
      sendSuccess(res, null, 'Record deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FinancialRecordController();