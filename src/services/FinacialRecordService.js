const { v4: uuidv4 } = require('uuid');
const FinancialRecordRepository = require('../repositories/FinancialRecordRepository');
const ApiError = require('../utils/ApiError');

class FinancialRecordService {
  constructor() {
    this.recordRepo = new FinancialRecordRepository();
  }

  listRecords(filters) {
    return this.recordRepo.findAll(filters);
  }

  getRecordById(id) {
    const record = this.recordRepo.findById(id);
    if (!record) throw ApiError.notFound('Financial record not found');
    return record;
  }

  createRecord(data, userId) {
    return this.recordRepo.create({
      ...data,
      id: uuidv4(),
      created_by: userId,
    });
  }

  updateRecord(id, fields) {
    this.getRecordById(id); 
    const updated = this.recordRepo.update(id, fields);
    if (!updated) throw ApiError.internal('Update failed');
    return updated;
  }

  deleteRecord(id) {
    this.getRecordById(id); 
    this.recordRepo.softDelete(id);
  }
}

module.exports = FinancialRecordService;