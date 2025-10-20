// app/controllers/loan.controller.js
const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const { getClient, getDb } = require("../../utils/mongodb.util");
const LoanService = require("../services/loan.service");

exports.borrow = async (req, res, next) => {
  try {
    const { bookId, readerId } = req.body || {};
    if (!bookId || !readerId) {
      return next(new ApiError(400, "Thiếu bookId hoặc readerId"));
    }
    if (!ObjectId.isValid(bookId) || !ObjectId.isValid(readerId)) {
      return next(new ApiError(400, "ID không hợp lệ"));
    }

    await getClient();
    const service = new LoanService(getDb());

    const doc = await service.borrow({
      ...req.body,
      employeeId: req.user?.sub,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(new ApiError(400, e.message || "Mượn sách thất bại"));
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return next(new ApiError(400, "ID không hợp lệ"));

    await getClient();
    const service = new LoanService(getDb());
    const doc = await service.returnLoan(id);
    if (!doc) return next(new ApiError(404, "Phiếu mượn không tồn tại hoặc đã trả"));
    res.json(doc);
  } catch (e) {
    next(new ApiError(400, e.message || "Trả sách thất bại"));
  }
};

exports.listBorrowing = async (_req, res, next) => {
  try {
    await getClient();
    const service = new LoanService(getDb());
    const items = await service.listBorrowing();
    res.json(items);
  } catch (e) {
    next(new ApiError(500, "Không lấy được danh sách đang mượn"));
  }
};
exports.history = async (_req, res, next) => {
  try {
    await getClient();
    const service = new LoanService(getDb());
    const items = await service.listHistory();
    res.json(items);
  } catch (e) {
    next(new ApiError(500, "Không lấy được lịch sử mượn/trả"));
  }
};
