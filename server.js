const express = require("express");
const dotenv = require("dotenv");
const trackingRoutes = require("./routes/trackingRoutes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/track", trackingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
