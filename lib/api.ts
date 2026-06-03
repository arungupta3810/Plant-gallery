// Typed client for the Plant Gallery API (NestJS backend).
// All calls go through `request`, which attaches the JWT (if present) and
// normalizes errors. The backend base URL is configurable via env so the API
// can be deployed/moved independently of the frontend.

import type { Plant } from './plants';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'pg_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean };

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  // `auth` is accepted to flag required-auth calls at call sites; the token is
  // attached whenever present regardless, so it is intentionally not read here.
  const { body, auth: _auth = false, headers, ...rest } = opts;
  const h: Record<string, string> = { ...(headers as Record<string, string>) };

  if (body !== undefined) h['Content-Type'] = 'application/json';
  // Always attach the token when present — harmless on public routes, and it
  // lets optional-auth routes (checkout, contact) associate the request with the user.
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running?', 0);
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message ?? msg;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(msg, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Types ----------

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  phone?: string | null;
};
export type AuthResponse = { token: string; user: AuthUser };

export type OrderItem = { id: string; name: string; price: number; qty: number; plant?: { slug: string; icon: string } };
export type Order = {
  id: string;
  number: string;
  email: string;
  name: string;
  phone?: string | null;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  shipLine1: string;
  shipLine2?: string | null;
  shipCity: string;
  shipState?: string | null;
  shipZip: string;
  items: OrderItem[];
  payment?: { method: string; status: string } | null;
};

export type BlogPost = {
  id: string; slug: string; title: string; excerpt: string;
  body: string; tag: string; icon: string; createdAt: string;
};
export type Faq = { id: string; question: string; answer: string };

export type Notification = {
  id: string; type: string; title: string; body: string;
  href?: string | null; read: boolean; createdAt: string;
};
export type NotificationList = { items: Notification[]; unread: number };

export type Review = { id: string; author: string; rating: number; body: string; createdAt: string };
export type ReviewSummary = { average: number | null; count: number; reviews: Review[] };
export type ReviewEligibility = { canReview: boolean; hasPurchased: boolean; alreadyReviewed: boolean };

export type CheckoutPayload = {
  name: string; email: string; phone?: string;
  shipLine1: string; shipLine2?: string; shipCity: string; shipState?: string; shipZip: string;
  paymentMethod?: 'cod' | 'card';
  items: { slug: string; qty: number }[];
};

export type PlantQuery = {
  category?: string; q?: string; light?: string; difficulty?: string;
  sort?: 'featured' | 'low' | 'high';
};

// ---------- Endpoints ----------

export const api = {
  // auth
  register: (b: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: b }),
  login: (b: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: b }),
  me: () => request<AuthUser>('/auth/me', { auth: true }),

  // catalog
  plants: (q: PlantQuery = {}) => {
    const sp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => { if (v) sp.set(k, String(v)); });
    const qs = sp.toString();
    return request<Plant[]>(`/plants${qs ? `?${qs}` : ''}`);
  },
  plant: (slug: string) => request<Plant>(`/plants/${slug}`),
  categories: () => request<string[]>('/plants/categories'),

  // orders
  checkout: (b: CheckoutPayload) => request<Order>('/orders', { method: 'POST', body: b }),
  myOrders: () => request<Order[]>('/orders/mine', { auth: true }),
  trackOrder: (number: string) => request<Order>(`/orders/track/${number}`),

  // wishlist
  wishlist: () => request<Plant[]>('/wishlist', { auth: true }),
  toggleWish: (slug: string) =>
    request<{ slug: string; saved: boolean }>(`/wishlist/toggle/${slug}`, { method: 'POST', auth: true }),

  // content
  blog: () => request<BlogPost[]>('/blog'),
  blogPost: (slug: string) => request<BlogPost>(`/blog/${slug}`),
  faqs: () => request<Faq[]>('/faqs'),

  // reviews
  reviews: (slug: string) => request<ReviewSummary>(`/plants/${slug}/reviews`),
  reviewEligibility: (slug: string) => request<ReviewEligibility>(`/plants/${slug}/reviews/eligibility`, { auth: true }),
  addReview: (slug: string, b: { rating: number; body: string }) =>
    request<ReviewSummary>(`/plants/${slug}/reviews`, { method: 'POST', body: b, auth: true }),

  // contact
  contact: (b: { name: string; email: string; phone?: string; message: string }) =>
    request<{ ok: boolean }>('/contact', { method: 'POST', body: b }),

  // notifications
  notifications: () => request<NotificationList>('/notifications', { auth: true }),
  markNotificationRead: (id: string) =>
    request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH', auth: true }),
  markAllNotificationsRead: () =>
    request<{ ok: boolean }>('/notifications/read-all', { method: 'PATCH', auth: true }),

  // admin
  adminStats: () => request<{
    plants: number; orders: number; customers: number; newLeads: number; revenue: number;
    lowStock: { name: string; slug: string; stock: number }[];
  }>('/admin/stats', { auth: true }),
  adminOrders: () => request<Order[]>('/orders', { auth: true }),
  adminUpdateOrderStatus: (number: string, status: string) =>
    request<Order>(`/orders/${number}/status`, { method: 'PATCH', body: { status }, auth: true }),
  adminUpsertPlant: (b: Record<string, unknown>, slug?: string) =>
    request<Plant>(slug ? `/plants/${slug}` : '/plants', { method: slug ? 'PUT' : 'POST', body: b, auth: true }),
  adminDeletePlant: (slug: string) =>
    request<{ ok: boolean }>(`/plants/${slug}`, { method: 'DELETE', auth: true }),
};
