const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

// Login user
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Login failed");
    }

    // backend wraps user & token under payload.data
    const { success, message } = payload;
    const { token, user } = payload.data || {};
    return { success, message, token, user };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Register user
export async function registerUser(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Login failed");
    }

    // backend wraps user & token under payload.data
    const { success, message } = payload;
    const { token, user } = payload.data || {};
    return { success, message, token, user };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// Get current user
export async function getCurrentUser(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Failed to get user");
    }

    // unwrap nested data
    return payload.data.user;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
}
// Delete the account 
export async function deleteAccount(token: string, password: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/users/account`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    }
  )
  if (!res.ok) {
    const payload = await res.json()
    throw new Error(payload.message || "Failed to delete account")
  }
}



// Update user profile
export async function updateUserProfile(
  token: string,
  userData: any
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Failed to update profile");
    }

    // unwrap nested data
    return payload.user;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}
