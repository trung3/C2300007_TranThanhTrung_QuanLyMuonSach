// app/routes/reader.route.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reader.controller");

router.get("/test", (req, res) => res.json({ ok: true, route: "readers" }));

router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
