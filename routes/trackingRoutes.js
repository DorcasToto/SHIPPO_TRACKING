const express = require("express");
const router = express.Router();
const {
  createTracker,
  getTrackerStatus,
} = require("../controllers/trackingController");

// POST /api/track/ - create and track
router.post("/", createTracker);

// GET /api/track/:id - get status
router.get('/:carrier/:trackingNumber', getTrackerStatus);





module.exports = router;
