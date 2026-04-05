const sendSuccess = (res, data= null, message= 'Success', statusCode= 200) =>{
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, data, message= 'Created successfulluy') => {
  return sendSuccess(res, data, message, 201);
};

const sendPaginated = (res, items, total, page, limit) =>{
  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
};