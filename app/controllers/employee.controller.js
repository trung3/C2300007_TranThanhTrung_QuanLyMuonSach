const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");
const { getClient, getDb } = require("../../utils/mongodb.util");
const EmployeeService = require("../services/employee.service");

exports.create = async (req, res, next) => {
  try {
    const { code, fullName, password, role = "staff", address = "", phone = "" } = req.body || {};
    if (!code || !fullName || !password) return next(new ApiError(400, "Thiếu code/fullName/password"));
    await getClient();
    const svc = new EmployeeService(getDb());
    const existed = await svc.findByCode(code);
    if (existed) return next(new ApiError(409, "Mã nhân viên đã tồn tại"));
    const emp = await svc.create({ code, fullName, password, role, address, phone });
    res.status(201).json({ _id: emp._id, code, fullName, role, address, phone });
  } catch (e) { next(new ApiError(500, e.message || "Không tạo được nhân viên")); }
};

exports.findAll = async (_req, res, next) => {
  try {
    await getClient();
    const col = getDb().collection("employees");
    const list = await col.find({}, { projection: { passwordHash: 0 } }).toArray();
    res.json(list);
  } catch { next(new ApiError(500, "Không lấy được danh sách nhân viên")); }
};

exports.findOne = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const col = getDb().collection("employees");
    const emp = await col.findOne({ _id: new ObjectId(req.params.id) }, { projection: { passwordHash: 0 } });
    if (!emp) return next(new ApiError(404, "Không tìm thấy nhân viên"));
    res.json(emp);
  } catch { next(new ApiError(500, "Không lấy được nhân viên")); }
};

exports.update = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const col = getDb().collection("employees");
    const { fullName, role, address, phone, password } = req.body || {};
    const $set = {};
    if (fullName !== undefined) $set.fullName = fullName;
    if (role !== undefined) $set.role = role;
    if (address !== undefined) $set.address = address;
    if (phone !== undefined) $set.phone = phone;
    if (password) $set.passwordHash = await bcrypt.hash(password, 10);

    const r = await col.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set },
      { returnDocument: "after", projection: { passwordHash: 0 } }
    );
    if (!r.value) return next(new ApiError(404, "Không tìm thấy nhân viên"));
    res.json(r.value);
  } catch (e) { next(new ApiError(400, e.message || "Cập nhật nhân viên thất bại")); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return next(new ApiError(400, "ID không hợp lệ"));
    await getClient();
    const col = getDb().collection("employees");
    const r = await col.deleteOne({ _id: new ObjectId(req.params.id) });
    if (!r.deletedCount) return next(new ApiError(404, "Không tìm thấy nhân viên"));
    res.json({ deleted: true });
  } catch { next(new ApiError(400, "Xóa nhân viên thất bại")); }
};
