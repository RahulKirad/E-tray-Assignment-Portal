const BASE_URL = "http://localhost:2024/etray-api"; 

const ENDPOINTS = {
  SUBMIT: `${BASE_URL}/submit`,
  UPDATE_RESPONSE: `${BASE_URL}/update-response`,
  SUBMIT_SKILLWISE: `${BASE_URL}/submit-skillwise`, 
  UPDATE_SKILLWISE_RESPONSE: `${BASE_URL}/update-skillwise-response`, 
  SUBMIT_INDUSTRY: `${BASE_URL}/industry/submit`,
  UPDATE_INDUSTRY_RESPONSE: `${BASE_URL}/industry/update-response`,
};

// ✅ Debugging to check if endpoints are correctly set
console.log("API Endpoints:", ENDPOINTS);

export default ENDPOINTS;
