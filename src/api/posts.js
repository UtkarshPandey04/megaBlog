import conf from "../conf/conf.js";

function getToken() {
    return localStorage.getItem(conf.tokenKey);
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
        const message = data?.message || "Request failed";
        throw new Error(message);
    }
    return data;
}

export class PostsService {
    async createPost({ title, slug, content, featuredImage, status, userId, category, tags }) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("content", content);
        if (status) formData.append("status", status);
        if (category) formData.append("category", category);
        if (tags) formData.append("tags", tags);
        if (featuredImage) formData.append("image", featuredImage);
        if (userId) formData.append("userId", userId);

        return await request("/api/posts", {
            method: "POST",
            body: formData,
        });
    }

    async updatePost(slug, { title, content, featuredImage, status, category, tags }) {
        const formData = new FormData();
        if (title !== undefined) formData.append("title", title);
        if (content !== undefined) formData.append("content", content);
        if (status !== undefined) formData.append("status", status);
        if (category !== undefined) formData.append("category", category);
        if (tags !== undefined) formData.append("tags", tags);
        if (featuredImage) formData.append("image", featuredImage);

        return await request(`/api/posts/${slug}`, {
            method: "PUT",
            body: formData,
        });
    }

    async deletePost(slug) {
        await request(`/api/posts/${slug}`, { method: "DELETE" });
        return true;
    }

    async getPost(slug) {
        return await request(`/api/posts/${slug}`);
    }

    async getPosts(options) {
        if (options && !Array.isArray(options)) {
            const params = new URLSearchParams();
            if (options.status) params.set("status", options.status);
            if (options.page) params.set("page", String(options.page));
            if (options.limit) params.set("limit", String(options.limit));
            if (options.category) params.set("category", options.category);
            if (options.tag) params.set("tag", options.tag);
            if (options.q) params.set("q", options.q);
            if (options.author) params.set("author", options.author);
            const url = `/api/posts?${params.toString()}`;
            const data = await request(url);
            return { documents: data.items || [], meta: data };
        }

        const url =
            options === undefined
                ? "/api/posts?status=active"
                : Array.isArray(options) && options.length === 0
                ? "/api/posts"
                : "/api/posts?status=active";
        const data = await request(url);
        if (Array.isArray(data)) {
            return { documents: data };
        }
        return { documents: data.items || [], meta: data };
    }

    async uploadFile(file) {
        return file;
    }

    async deleteFile(_fileId) {
        return true;
    }

    getFilePreview(filePath) {
        if (!filePath) return "";
        return filePath;
    }

    async getComments(slug) {
        return await request(`/api/posts/${slug}/comments`);
    }

    async addComment(slug, content) {
        return await request(`/api/posts/${slug}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
    }

    async deleteComment(slug, commentId) {
        return await request(`/api/posts/${slug}/comments/${commentId}`, { method: "DELETE" });
    }

    async likePost(slug) {
        return await request(`/api/posts/${slug}/likes`, { method: "POST" });
    }

    async unlikePost(slug) {
        return await request(`/api/posts/${slug}/likes`, { method: "DELETE" });
    }
}

const postsService = new PostsService();
export default postsService;
