const {
  createTracking,
  getTrackingByCode,
} = require("../services/shippoService");

// POST /api/track
exports.createTracker = async (req, res) => {
  const { carrier, tracking_number } = req.body;
  console.log("Received create tracking request:", req.body);

  if (!carrier || !tracking_number) {
    return res.status(400).json({ error: "Carrier and tracking number are required." });
  }

  try {
    const result = await createTracking(carrier, tracking_number);
    res.status(201).json(result);
  } catch (error) {
    console.error("Create tracking error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message || "Server error",
    });
  }
};

// GET /api/track/:carrier/:trackingNumber
exports.getTrackerStatus = async (req, res) => {
  const { carrier, trackingNumber } = req.params;
  try {
    const result = await getTrackingByCode(carrier, trackingNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error("Get tracking status error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message || "Server error",
    });
  }
};
