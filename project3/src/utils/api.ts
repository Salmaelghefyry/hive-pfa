import axios from 'axios';

const API_BASE = 'http://localhost:9999';

// Function to handle API requests
export const apiRequest = async (
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: any; // Added params option
    headers?: Record<string, string>;
  } = {}
) => {
  const { method = 'GET', body, params, headers = {} } = options;
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url,
      data: body,
      params,
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('API request failed:', error);
    // You can add more sophisticated error handling here
    // For now, we re-throw the error to be caught by the calling component
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data.message || error.response.statusText;
       console.error(`HTTP error! status: ${error.response.status}`, message);
       throw new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
       throw new Error('No response from server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
       throw new Error(`Error: ${error.message}`);
    }
  }
};

// Authentication API
export const authAPI = {
  register: (userData: any) => apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: userData
  }),
  login: (credentials: any) => apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: credentials
  }),
  authenticate: () => apiRequest('/api/v1/auth/authenticate', { method: 'POST' }),
  getAccountVerification: (token: string) => apiRequest(`/api/v1/auth/accountVerification/${token}`),
  postAccountVerification: (token: string) => apiRequest(`/api/v1/auth/accountVerification/${token}`, { method: 'POST' }),
};

// Demo/Testing API
export const demoAPI = {
  getProjectLeaders: () => apiRequest('/authenticated/pl'),
  getAdmins: () => apiRequest('/authenticated/pa'),
  getTeamMembers: () => apiRequest('/authenticated/tm'),
  getAll: () => apiRequest('/authenticated/all'),
};

// Project API
export const projectAPI = {
  create: (projectData: any) => apiRequest('/api/v1/project/create-project', {
    method: 'POST',
    body: projectData
  }),
  listMembers: (projectId: string) => apiRequest(`/api/v1/projects/${projectId}/members`),
  search: () => apiRequest('/api/v1/project/search-projects'),
  searchByName: (projectName: string) => apiRequest(`/api/v1/projects/search/${projectName}`),
  addMember: (projectId: string, userId: string) => apiRequest(`/api/v1/projects/${projectId}/members/${userId}`, { method: 'POST' }),
  removeMember: (projectId: string, userId: string) => apiRequest(`/api/v1/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
  getActiveProjectForUser: (userId: string) => apiRequest(`/api/v1/projects/active/${userId}`),
  getCompletedProjectsForUser: (userId: string) => apiRequest(`/api/v1/projects/completed/${userId}`),
  fetchUserProjects: () => apiRequest('/api/v1/project/user-projects'),
};

// Task API
export const taskAPI = {
  create: (projectId: string, taskData: any) => apiRequest(`/api/v1/tasks/${projectId}`, {
    method: 'POST',
    body: taskData
  }),
  update: (taskId: string, taskData: any) => apiRequest(`/api/v1/tasks/${taskId}`, {
    method: 'PUT',
    body: taskData
  }),
  get: (taskId: string) => apiRequest(`/api/v1/tasks/${taskId}`),
  delete: (projectId: string, taskId: string) => apiRequest(`/api/v1/tasks/${projectId}/${taskId}`, {
    method: 'DELETE'
  }),
  search: (params?: any) => {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest(`/api/v1/tasks${queryParams}`);
  },
  export: () => apiRequest('/api/v1/tasks/export'),
  assignToUsers: (assignmentData: any) => apiRequest('/api/v1/tasks/assign', {
    method: 'POST',
    body: assignmentData
  }),
  assignToAll: (assignmentData: any) => apiRequest('/api/v1/tasks/assign/all', {
    method: 'POST',
    body: assignmentData
  }),
  unassign: (unassignData: any) => apiRequest('/api/v1/tasks/unassign', {
    method: 'DELETE',
    body: unassignData
  }),
  unassignAll: (unassignData: any) => apiRequest('/api/v1/tasks/unassign/all', {
    method: 'DELETE',
    body: unassignData
  }),
  updateProgress: (taskId: string, projectId: string, progressData: any) => apiRequest(`/api/v1/tasks/${taskId}/${projectId}/progress`, {
    method: 'POST',
    body: progressData
  }),
  fetchTasks: (params?: { status?: string; projectId?: number; assignedToUserId?: number }) => apiRequest('/api/v1/task/management/searchTasks', {
    method: 'GET',
    params: params,
  }),
};

// Comment API
export const commentAPI = {
  onProject: (commentData: any) => apiRequest('/api/v1/comments/on-project', {
    method: 'POST',
    body: commentData
  }),
  onTask: (commentData: any) => apiRequest('/api/v1/comments/on-task', {
    method: 'POST',
    body: commentData
  }),
};
