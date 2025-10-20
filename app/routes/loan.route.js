// app/routes/loan.route.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/loan.controller");
const auth = require("../middlewares/auth.middleware");

// Các API dưới bắt buộc đăng nhập
router.post("/", auth, ctrl.borrow);                 // mượn
router.patch("/:id/return", auth, ctrl.returnBook);  // trả
router.get("/borrowing", auth, ctrl.listBorrowing);  // đang mượn
router.get("/history", auth, ctrl.history);          // đã trả
// router.get("/overdue", auth, ctrl.overdue);          // (nếu bạn đã thêm quá hạn)

module.exports = router;