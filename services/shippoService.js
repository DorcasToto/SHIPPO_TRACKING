const axios = require("axios");
const mapStatus = require("../utils/statusMapper");

const API_KEY = process.env.SHIPPO_API_KEY;
const BASE_URL = "https://api.goshippo.com/tracks/";

// Initialize Axios with Shippo base URL and authorization header

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `ShippoToken ${API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

// Reusable retry function
const retry = async (fn, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 || error.code === "ECONNABORTED") {
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        attempt++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded.");
};

// POST /tracks/
exports.createTracking = async (carrier, trackingNumber) => {
  return retry(() =>
    axiosInstance.post(`/`, {
      carrier,
      tracking_number: trackingNumber
    })
  ).then((res) => {
    const data = res.data;

    return {
      tracking_id: data.tracking_status.object_id,
      carrier: data.carrier,
      tracking_number: data.tracking_number,
      original_status: data.tracking_status?.status,
      mapped_status: mapStatus(data.tracking_status?.status),
    };
  });
};


// GET /tracks/:carrier/:trackingNumber
exports.getTrackingByCode = async (carrier, trackingNumber) => {
  return retry(() =>
    axiosInstance.get(`/${carrier}/${trackingNumber}`)
  ).then((res) => {
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
  });
};


