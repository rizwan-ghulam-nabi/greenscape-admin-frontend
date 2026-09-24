// lib/api.js
const API_BASE_URL = 'http://localhost:5001/api/admin'; // ✅ FIXED: /admin added

// ==========================================
// 1. ADMIN LOGIN
// ==========================================
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {  // ✅ Now /api/admin/login
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 2. GET ADMIN DASHBOARD DATA
// ==========================================
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {  // ✅ /api/admin/dashboard
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch dashboard stats');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 3. GET ALL PRODUCTS (Admin)
// ==========================================
export const getAdminProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {  // ✅ /api/admin/products
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 4. GET ALL ORDERS (Admin)
// ==========================================
export const getAdminOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {  // ✅ /api/admin/orders
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch orders');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 5. CREATE PRODUCT (Admin)
// ==========================================
export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create product');
    }

    return data;
  } catch (error) {
    throw error;
  }
};


// ==========================================
// 7. GET ALL CATEGORIES (Admin)
// ==========================================
export const getAdminCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch categories');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 8. GET SINGLE CATEGORY (Admin)
// ==========================================
export const getAdminCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 9. CREATE CATEGORY (Admin)
// ==========================================
export const createAdminCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 10. UPDATE CATEGORY (Admin)
// ==========================================
export const updateAdminCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 11. DELETE CATEGORY (Admin)
// ==========================================
export const deleteAdminCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete category');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 12. GET PUBLIC CATEGORIES (No auth)
// ==========================================
export const getPublicCategories = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/public/categories');

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch categories');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 6. LOGOUT
// ==========================================
export const adminLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};