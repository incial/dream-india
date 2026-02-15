import axios from 'axios';
import { CRMEntry, AuthResponse, User, ForgotPasswordRequest, VerifyOtpRequest, ChangePasswordRequest, UpdatePasswordRequest, ApiResponse, RegisterRequest, Project, CreateProjectRequest, UpdateSalesDataRequest, UpdateAccountsDataRequest, UpdateInstallationDataRequest, StageTransitionRequest, ProjectStage } from '../types';

// ============================================================================
// ⚙️ API CONFIGURATION
// ============================================================================

//const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const API_URL = 'http://localhost:8080/api/v1';


const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor to handle Token Expiration (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for Unauthorized (401) or Forbidden (403) which usually means token expired/invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Dispatch a custom event that AuthContext will listen to
        window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper to extract error message from backend response
const handleApiError = (error: any) => {
    if (error.response) {
        // Backend returned an error response (4xx, 5xx)
        console.error("API Error:", error.response.status, error.response.data);
        const message = error.response.data?.message || error.response.data?.error || "Request failed";
        throw new Error(message);
    } else if (error.request) {
        // Network error (Backend not reachable)
        console.error("Network Error:", error.request);
        throw new Error("Cannot connect to server. Please check if the backend is running.");
    } else {
        console.error("Request Setup Error:", error.message);
        throw new Error(error.message);
    }
};

// Helper to clean payload
const cleanPayload = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(cleanPayload);
    }
    
    if (data !== null && typeof data === 'object') {
        const cleaned: any = {};
        const excludeFields = ['id', 'createdAt', 'lastUpdatedAt'];

        Object.keys(data).forEach(key => {
            if (excludeFields.includes(key)) return;
            const value = data[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                cleaned[key] = cleanPayload(value);
            } 
            else if (value !== "" && value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        });
        return cleaned;
    }
    return data;
};

// Helper to check if current user is Admin
const isAdminUser = (): boolean => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        const user = JSON.parse(userStr);
        return user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN';
    } catch (e) {
        return false;
    }
};

// ============================================================================
// 🔌 API ENDPOINTS
// ============================================================================

// --- USERS API ---
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
        const res = await api.get("/users/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },
  
  update: async (id: number, data: Partial<User>): Promise<User> => {
    try {
        const res = await api.put(`/users/update/${id}`, data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
        await api.delete(`/users/delete/${id}`);
    } catch (error) { throw handleApiError(error); }
  }
};

// --- CRM API ---
export const crmApi = {
  getAll: async (): Promise<{crmList: CRMEntry[]}> => {
    try {
        const res = await api.get("/crm/all");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  getMyCrm: async (): Promise<CRMEntry> => {
    try {
        const res = await api.get("/crm/my-crm");
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  create: async (data: Omit<CRMEntry, 'id'>): Promise<CRMEntry> => {
    try {
        const payload = cleanPayload(data);
        const res = await api.post("/crm/create", payload);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     try {
        const payload = cleanPayload(data);
        const res = await api.put(`/crm/update/${id}`, payload);
        return res.data;
     } catch (error) { throw handleApiError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
        await api.delete(`/crm/delete/${id}`);
    } catch (error) { throw handleApiError(error); }
  }
};

// --- COMPANIES API ---
export const companiesApi = {
  getAll: async (): Promise<CRMEntry[]> => {
    if (isAdminUser()) {
        try {
            const res = await api.get("/crm/all");
            const data = res.data.crmList || [];
            return data.map((item: any) => ({
                ...item,
                company: item.name || item.company
            }));
        } catch (e) {
            console.warn("Admin CRM fetch failed, falling back to companies endpoint...", e);
        }
    }

    try {
        const res = await api.get("/companies/all");
        const data = Array.isArray(res.data) ? res.data : [];
        return data.map((item: any) => ({
            ...item,
            company: item.name || item.company
        }));
    } catch (error: any) { 
        console.warn("Primary companies endpoint failed, attempting fallback to CRM...", error.message);
        try {
            const res = await api.get("/crm/all");
            const data = res.data.crmList || [];
            return data.map((item: any) => ({
                ...item,
                company: item.name || item.company
            }));
        } catch (fallbackError) {
            throw handleApiError(error); 
        }
    }
  },
  
  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     const payload = cleanPayload(data);
     if (isAdminUser()) {
        try {
            const res = await api.put(`/crm/update/${id}`, payload);
            return { ...res.data, company: res.data.name || res.data.company };
        } catch (e) {
             console.warn("Admin CRM update failed, falling back to companies endpoint...", e);
        }
     }

     try {
        const res = await api.put(`/companies/update/${id}`, payload);
        return { ...res.data, company: res.data.name || res.data.company };
     } catch (error: any) { 
         console.warn("Primary companies update failed, attempting fallback to CRM...", error.message);
         try {
            const res = await api.put(`/crm/update/${id}`, payload);
            return { ...res.data, company: res.data.name || res.data.company };
         } catch (fallbackError) {
            throw handleApiError(error);
         }
     }
  }
};



// --- AUTH API ---
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const res = await api.post("/auth/login", { email, password });
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    try {
        const res = await api.post("/auth/google-login", { credential });
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  registerUser: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
        const res = await api.post("/auth/register", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    try {
        const res = await api.post("/auth/forgot-password", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse> => {
    try {
        const res = await api.post("/auth/verify-otp", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    try {
        const res = await api.post("/auth/change-password", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  },

  updatePassword: async (data: UpdatePasswordRequest): Promise<ApiResponse> => {
    try {
        const res = await api.post("/auth/update-password", data);
        return res.data;
    } catch (error) { throw handleApiError(error); }
  }
};

// ============================================================================
// 📋 PROJECT API ENDPOINTS (Work Hub CRM)
// ============================================================================

export const projectApi = {
  // Executive - Create Project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    try {
        const res = await api.post("/projects/create", data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Executive - Update Project
  updateProject: async (id: number, data: CreateProjectRequest): Promise<Project> => {
    try {
        const res = await api.put(`/projects/${id}`, data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Executive - Transition Stage
  transitionStage: async (id: number, data: StageTransitionRequest): Promise<Project> => {
    try {
        const res = await api.post(`/projects/${id}/transition`, data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Get Executive Projects
  getExecutiveProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/executive");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Sales - Get Projects
  getSalesProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/sales");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Sales - Update Sales Data
  updateSalesData: async (id: number, data: UpdateSalesDataRequest): Promise<Project> => {
    try {
        const res = await api.put(`/projects/${id}/sales`, data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Sales - Mark Ready for Accounts
  markReadyForAccounts: async (id: number): Promise<Project> => {
    try {
        const res = await api.post(`/projects/${id}/ready-for-accounts`);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Accounts - Get Projects
  getAccountsProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/accounts");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Accounts - Update Accounts Data
  updateAccountsData: async (id: number, data: UpdateAccountsDataRequest): Promise<Project> => {
    try {
        const res = await api.put(`/projects/${id}/accounts`, data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Installation - Get Projects
  getInstallationProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/installation");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Installation - Update Installation Data
  updateInstallationData: async (id: number, data: UpdateInstallationDataRequest): Promise<Project> => {
    try {
        const res = await api.put(`/projects/${id}/installation`, data);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Get Completed Projects
  getCompletedProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/completed");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Get Project By ID
  getProjectById: async (id: number): Promise<Project> => {
    try {
        const res = await api.get(`/projects/${id}`);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Admin - Get All Projects
  getAllProjects: async (): Promise<Project[]> => {
    try {
        const res = await api.get("/projects/all");
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  },

  // Get Projects by Stage
  getProjectsByStage: async (stage: ProjectStage): Promise<Project[]> => {
    try {
        const res = await api.get(`/projects/stage/${stage}`);
        return res.data.data;
    } catch (error) { throw handleApiError(error); }
  }
};
