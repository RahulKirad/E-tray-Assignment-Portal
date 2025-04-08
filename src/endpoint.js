const BASE_URL = process.env.REACT_APP_BASE_URL; 
const ENDPOINTS = {
  SUBMIT: `${BASE_URL}/submit`,
  UPDATE_RESPONSE: `${BASE_URL}/update-response`,
  SUBMIT_SKILLWISE: `${BASE_URL}/submit-skillwise`,
  UPDATE_SKILLWISE_RESPONSE: `${BASE_URL}/update-skillwise-response`,
  SUBMIT_INDUSTRY: `${BASE_URL}/industry/submit`,
  UPDATE_INDUSTRY_RESPONSE: `${BASE_URL}/industry/update-response`,
};

// ✅ Debugging to check if BASE_URL is loaded from environment
console.log("BASE_URL:", BASE_URL);
console.log("API Endpoints:", ENDPOINTS);

export default ENDPOINTS;