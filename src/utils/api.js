/**
 * API-клиент для связи с PHP-бэкендом
 *
 * Настройка:
 *   1. Убедитесь, что Apache (XAMPP) запущен
 *   2. Папка api/ должна быть доступна из веба
 *      (например, симлинк или скопировать api/ в htdocs)
 *   3. В .env.local React-проекта укажите:
 *      REACT_APP_API_URL=http://localhost/khlebniy_dom/api
 *
 * Если бэкенд недоступен — используем localStorage (режим offline)
 */

const API_URL = process.env.REACT_APP_API_URL || '';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function request(endpoint, options = {}) {
  const url = API_URL
    ? `${API_URL}/${endpoint}`
    : `/api/${endpoint}`;

  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    return data;
  } catch (err) {
    // Если сервер недоступен — пробрасываем ошибку
    throw err;
  }
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

export async function apiLogin(email, password) {
  return request('users/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data) {
  return request('users/register.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetProfile() {
  return request('users/profile.php');
}

export async function apiUpdateProfile(data) {
  return request('users/profile.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiChangePassword(oldPassword, newPassword) {
  return request('users/profile.php', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword, _action: 'changePassword' }),
  });
}

// ==================== ТОВАРЫ ====================

export async function apiGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`products/list.php${qs ? '?' + qs : ''}`);
}

export async function apiAddProduct(data) {
  return request('products/add.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateProduct(data) {
  return request('products/update.php', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteProduct(id) {
  return request(`products/delete.php?id=${id}`, {
    method: 'DELETE',
  });
}

// ==================== ЗАКАЗЫ ====================

export async function apiCreateOrder(data) {
  return request('orders/create.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetOrders() {
  return request('orders/list.php');
}

export async function apiUpdateOrderStatus(id, status) {
  return request('orders/update_status.php', {
    method: 'PUT',
    body: JSON.stringify({ id, status }),
  });
}

// ==================== ЗАГРУЗКА ФАЙЛОВ ====================

export async function apiUploadImage(file) {
  const url = API_URL ? `${API_URL}/upload.php` : `/api/upload.php`;
  const formData = new FormData();
  formData.append('image', file);

  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    throw err;
  }
}

// ==================== B2B ====================

export async function apiB2bRequest(data) {
  return request('b2b/request.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
