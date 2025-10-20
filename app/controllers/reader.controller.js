// app/controllers/reader.controller.js
const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const { getClient, getDb } = require("../../utils/mongodb.util");
const ReaderService = require("../services/reader.service");

exports.create = async (req, res, next) => {
  try {
    if (!req.body?.code || !req.body?.fullName) {
      return next(new ApiError(400, "code và fullName là bắt buộc"));
    }
    await getClient();
    const service = new ReaderService(getDb());
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (e) {
    if (e?.code === 11000) return next(new ApiError(409, "code độc giả đã tồn tại"));
    next(new ApiError(500, e.message || "Không tạo được độc giả"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    await getClient();
    const service = new ReaderService(getDb());

    const { name, code, phone, gender } = req.query;
    const filter = {};
    if (code)  filter.code = code;
    if (phone) filter.phone = phone;
    if (gender !== undefined) filter.gender = Number(gender);
    if (name)  filter.fullName = { $regex: name, $options: "i" };

    const items = await service.find(filter);
    res.json(items);
  } catch {
    next(new ApiError(500, "Không lấy được danh sách độc giả"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const service = new ReaderService(getDb());
    const item = await service.findById(req.params.id);
    if (!item) return next(new ApiError(404, "Không tìm thấy độc giả"));
    res.json(item);
  } catch {
    next(new ApiError(500, "Không lấy được độc giả"));
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const service = new ReaderService(getDb());
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return next(new ApiError(404, "Không tìm thấy độc giả"));
    res.json(updated);
  } catch (e) {
    next(new ApiError(400, e.message || "Cập nhật độc giả thất bại"));
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const service = new ReaderService(getDb());
    const r = await service.delete(req.params.id);
    if (!r.deletedCount) return next(new ApiError(404, "Không tìm thấy độc giả"));
    res.json({ deleted: true });
  } catch {
    next(new ApiError(400, "Xóa độc giả thất bại"));
  }
};
