import conf from "../conf/conf.js";

const tokenKey = conf.tokenKey;

function getToken() {
    return localStorage.getItem(tokenKey);
}

function setToken(token) {
    if (token) {
        localStorage.setItem(tokenKey, token);
    }
}

function clearToken() {
    localStorage.removeItem(tokenKey);
}

async function request(path, options = {}) {
    const url = `${conf.apiUrl}${path}`;
    const headers = options.headers || {};
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (res.status === 413) {
            throw new Error("Image too large for deployment limit. Please use an image up to 2MB.");
        }
        const message = data?.message || "Request failed";
        throw new Error(message);
    }
    return data;
}

export class AuthService {
    async createAccount({ email, password, name, phone, dob, description, avatar }) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        if (dob) formData.append("dob", dob);
        if (description) formData.append("description", description);
        if (avatar) formData.append("avatar", avatar);

        const data = await request("/api/auth/signup", {
            method: "POST",
            body: formData,
        });
        setToken(data.token);
        return data.user;
    }

    async login({ email, password }) {
        const data = await request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        return data.user;
    }

    async getCurrentUser() {
        try {
            const token = getToken();
            if (!token) return null;
            return await request("/api/auth/me");
        } catch (error) {
            if (error.message === "Invalid token") {
                clearToken();
            }
            return null;
        }
    }

    async verifyEmail(token) {
        return await request("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
    }

    async resendEmailVerification() {
        return await request("/api/auth/resend-email-verification", { method: "POST" });
    }

    async updateProfile({ name, email, phone, dob, description, avatar }) {
        const formData = new FormData();
        if (name !== undefined) formData.append("name", name);
        if (email !== undefined) formData.append("email", email);
        if (phone !== undefined) formData.append("phone", phone);
        if (dob !== undefined) formData.append("dob", dob);
        if (description !== undefined) formData.append("description", description);
        if (avatar) formData.append("avatar", avatar);

        return await request("/api/auth/me", {
            method: "PUT",
            body: formData,
        });
    }

    async logout() {
        clearToken();
        return true;
    }

    async getAuthor(id) {
        return await request(`/api/auth/author/${id}`);
    }

    async getBookmarks() {
        return await request("/api/auth/bookmarks");
    }

    async addBookmark(slug) {
        return await request(`/api/auth/bookmarks/${slug}`, { method: "POST" });
    }

    async removeBookmark(slug) {
        return await request(`/api/auth/bookmarks/${slug}`, { method: "DELETE" });
    }
}

const authService = new AuthService();

export default authService;
