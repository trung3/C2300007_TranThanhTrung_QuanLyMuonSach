const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", ctrl.register);   // tạo nhân viên
router.post("/login", ctrl.login);         // đăng nhập
router.get("/me", auth, ctrl.me);          // kiểm tra token

module.exports = router;
