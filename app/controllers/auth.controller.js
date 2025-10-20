const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../api-error");
const { getClient, getDb } = require("../../utils/mongodb.util");
const EmployeeService = require("../services/employee.service");

// tạm hardcode (sau có thể chuyển sang .env)
const JWT_SECRET = "dev-secret";
const JWT_EXPIRES = "7d";

// ĐĂNG KÝ NHÂN VIÊN (seed)
exports.register = async (req, res, next) => {
  try {
    const { code, fullName, password, role } = req.body || {};
    if (!code || !fullName || !password) {
      return next(new ApiError(400, "Thiếu code/fullName/password"));
    }
    await getClient();
    const svc = new EmployeeService(getDb());
    const existed = await svc.findByCode(code);
    if (existed) return next(new ApiError(409, "Nhân viên đã tồn tại"));
    const emp = await svc.create({ code, fullName, password, role });
    res.status(201).json(emp);
  } catch (e) {
    next(new ApiError(500, e.message || "Lỗi tạo nhân viên"));
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res, next) => {
  try {
    const { code, password } = req.body || {};
    if (!code || !password) {
      return next(new ApiError(400, "Thiếu code/password"));
    }
    await getClient();
    const svc = new EmployeeService(getDb());
    const emp = await svc.findByCode(code);
    if (!emp) return next(new ApiError(401, "Sai tài khoản hoặc mật khẩu"));
    const ok = await bcrypt.compare(password, emp.passwordHash);
    if (!ok) return next(new ApiError(401, "Sai tài khoản hoặc mật khẩu"));

    const token = jwt.sign({ sub: emp._id, code: emp.code, role: emp.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token });
  } catch (e) {
    next(new ApiError(500, e.message || "Đăng nhập thất bại"));
  }
};

// /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: req.user });
};
