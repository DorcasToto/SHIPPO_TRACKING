const axios = require("axios");
const mapStatus = require("../utils/statusMapper");

const BASE_URL = "https://api.goshippo.com/tracks/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `ShippoToken ${API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 5000,
});


const retry = async (fn, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      const retryableStatus = [429, 500, 502, 503, 504];
      const retryableCodes = ["ECONNABORTED", "ETIMEDOUT"];

      const shouldRetry =
        retryableStatus.includes(error.response?.status) ||
        retryableCodes.includes(error.code);

      if (shouldRetry) {
        console.warn(`Retrying attempt ${attempt + 1}...`);
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        attempt++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached – Shippo API not responding.");
};


const errorMap = {
  400: "Bad Request – check carrier or tracking number.",
  401: "Unauthorized – invalid or missing API key.",
  403: "Forbidden – insufficient permissions.",
  404: "Not Found – tracking number does not exist.",
  429: "Rate limit exceeded – please retry later.",
};

function formatError(error) {
  const status = error.response?.status;
  const code = error.code;

  if (status && errorMap[status]) {
    return { status, message: errorMap[status] };
  }

  if (status >= 500) {
    return { status, message: "Shippo service temporarily unavailable." };
  }

  if (["ECONNABORTED", "ETIMEDOUT"].includes(code)) {
    return { status: 503, message: "Request timed out." };
  }

  return { status: 500, message: error.message || "Unexpected error occurred." };
}


exports.createTracking = async (carrier, trackingNumber) => {
  try {
    const res = await retry(() =>
      axiosInstance.post(`/`, { carrier, tracking_number: trackingNumber })
    );

    const data = res.data;
    return {
      tracking_id: data.tracking_status?.object_id,
      carrier: data.carrier,
      tracking_number: data.tracking_number,
      original_status: data.tracking_status?.status,
      mapped_status: mapStatus(data.tracking_status?.status),
    };
  } catch (error) {
    const err = formatError(error);
    console.error("Create Tracking Error:", err);
    throw err;
  }
};

exports.getTrackingByCode = async (carrier, trackingNumber) => {
  try {
    const res = await retry(() =>
      axiosInstance.get(`/${carrier}/${trackingNumber}`)
    );

    const data = res.data;
    return {
      tracking_id: data.object_id,
      tracking_number: data.tracking_number,
      carrier: data.carrier,
      original_status: data.tracking_status?.status,
      mapped_status: mapStatus(data.tracking_status?.status),
      eta: data.eta,
      location: data.tracking_status?.location,
      status_details: data.tracking_status?.status_details,
    };
  } catch (error) {
    const err = formatError(error);
    console.error("Get Tracking Error:", err);
    throw err;
  }
};
