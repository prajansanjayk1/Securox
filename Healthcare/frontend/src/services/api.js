import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  getOverview: () => apiClient.get('/overview'),
  getThreats: () => apiClient.get('/threats'),
  getAssets: () => apiClient.get('/assets'),
  getAssetDetail: (id) => apiClient.get(`/assets/${id}`),
  getDependencies: () => apiClient.get('/dependencies'),
  getPathways: () => apiClient.get('/pathways'),
  getPathwayDetail: (id) => apiClient.get(`/pathways/${id}`),
  getExposure: () => apiClient.get('/exposure'),
  getBlastRadius: (assetId) => apiClient.get('/blast-radius', { params: assetId ? { asset_id: assetId } : {} }),
  getDevices: () => apiClient.get('/devices'),
  getHealthIT: () => apiClient.get('/health-it'),
  getRisk: () => apiClient.get('/risk'),
  getEvidence: (tableName, limit = 6) => apiClient.get('/evidence', { params: { table_name: tableName, limit } }),
  getDatasets: () => apiClient.get('/datasets'),
  getDataCoverage: () => apiClient.get('/coverage'),
  getCyberOverview: () => apiClient.get('/cyber/overview'),
  getCyberAccounting: () => apiClient.get('/cyber/accounting'),
  getCyberDevices: () => apiClient.get('/cyber/devices'),
  getCyberCategories: () => apiClient.get('/cyber/categories'),
  getCyberHospitalThreats: () => apiClient.get('/cyber/hospital-threats'),
  getCyberInventory: () => apiClient.get('/cyber/inventory'),
  getCicids2017: () => apiClient.get('/cyber/cicids2017'),
  getCsecicids2018: () => apiClient.get('/cyber/csecicids2018'),
  getCicFlowMeter: () => apiClient.get('/cyber/cicflowmeter'),
  getLanlRedTeam: () => apiClient.get('/cyber/lanl-redteam'),
  getIncidents: () => apiClient.get('/incidents'),
  getIncidentDetail: (id) => apiClient.get(`/incidents/${id}`),
  advanceIncidentStage: (id, newStage, notes = null) =>
    apiClient.post(`/incidents/${id}/stage`, { new_stage: newStage, notes }),
  executeResponse: (assetId, actionType, operatorNotes = null, incidentId = null) =>
    apiClient.post('/response', {
      asset_id: assetId,
      action_type: actionType,
      operator_notes: operatorNotes,
      incident_id: incidentId
    })
};

export default api;

