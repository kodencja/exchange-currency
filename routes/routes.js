const express = require("express");
const controller = require("../controllers/controller");

// create a new instance of Router object - router is like a "mini-app" but doesn't do anything, we have to use router inside the app
const router = express.Router();

router.get("/countries", controller.countries);
router.get("/exchange", controller.exchange);

module.exports = router;
