const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const JWT_SECRET = "dev-secret";

module.exports = (req, _res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next(new ApiError(401, "Thiếu token"));

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, "Token không hợp lệ"));
  }
};
