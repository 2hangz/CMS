// contexts/AuthContext.js - Secure authentication context for React components
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

// Auth action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_TOKEN: 'SET_TOKEN',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState
      };
    case AUTH_ACTIONS.SET_TOKEN:
      return {
        ...state,
        token: action.payload
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Storage utilities (memory-based for artifacts compatibility)
class MemoryStorage {
  constructor() {
    this.data = {};
  }

  setItem(key, value) {
    this.data[key] = value;
  }

  getItem(key) {
    return this.data[key] || null;
  }

  removeItem(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }
}

// Use memory storage instead of localStorage for artifacts
const storage = typeof window !== 'undefined' && window.localStorage 
  ? window.localStorage 
  : new MemoryStorage();

// AuthProvider component
export const AuthProvider = ({ children, apiBaseUrl = 'https://entyre-backend.onrender.com/api' }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = storage.getItem('token');
        const storedUser = storage.getItem('user');

        if (storedToken) {
          dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: storedToken });
        }

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: parsedUser });
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
        clearAuth();
      }
    };

    loadStoredAuth();
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(state.token && { 'Authorization': `Bearer ${state.token}` })
    };
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Store auth data
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token
        }
      });

      return { success: true, data };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (state.token) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
    }
  };

  // Clear authentication data
  const clearAuth = () => {
    storage.removeItem('token');
    storage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Verify token validity
  const verifyToken = async () => {
    if (!state.token) return false;

    try {
      const response = await fetch(`${apiBaseUrl}/auth/verify`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      if (data.valid) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data.user });
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
      return false;
    }
  };

  // Make authenticated API requests
  const apiRequest = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
    
    const config = {
      headers: getAuthHeaders(),
      credentials: 'include',
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      // Handle unauthorized responses
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Auth context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    clearAuth,
    verifyToken,
    clearError,

    // Utilities
    getAuthHeaders,
    apiRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected components
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Please log in to access this page.</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Protected Route component
export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Authentication required</div>
      </div>
    );
  }

  return children;
};

export default AuthContext;