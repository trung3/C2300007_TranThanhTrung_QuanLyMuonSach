const ApiError = require("../api-error");
module.exports = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Chưa đăng nhập"));
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Không có quyền"));
  }
  next();
};
