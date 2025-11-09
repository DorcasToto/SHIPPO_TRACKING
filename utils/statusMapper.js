const statusMap = {
  TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  FAILURE: "EXCEPTION",
  UNKNOWN: "UNKNOWN",
};

module.exports = function mapStatus(rawStatus) {
  return statusMap[rawStatus?.toUpperCase()] || "UNKNOWN";
};
