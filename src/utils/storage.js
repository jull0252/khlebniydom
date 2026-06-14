export function loadFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCart() {
  return loadFromStorage('cart', []);
}

export function saveCart(cart) {
  saveToStorage('cart', cart);
}

export function getCurrentUser() {
  return loadFromStorage('user', null);
}

export function calculateTotal() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0);
  const deliveryCost = subtotal < 1000 && subtotal > 0 ? 300 : 0;
  const total = subtotal + deliveryCost;
  return { subtotal, deliveryCost, total, totalWeight };
}

export function getStatusColor(status) {
  const colors = {
    new: '#ff9800',
    processing: '#2196f3',
    delivered: '#4caf50',
    cancelled: '#f44336',
  };
  return colors[status] || '#999';
}

export function getStatusText(status) {
  const texts = {
    new: 'Новый',
    processing: 'В работе',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  return texts[status] || status;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const els = document.querySelectorAll('.cart-count');
  els.forEach(el => { el.textContent = count; });
}

export function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container') || (() => {
    const div = document.createElement('div');
    div.id = 'notification-container';
    div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(div);
    return div;
  })();

  const notif = document.createElement('div');
  const bgColors = { success: '#4caf50', error: '#f44336', info: '#2196f3' };
  notif.style.cssText = `padding:12px 24px;border-radius:8px;color:white;background:${bgColors[type] || bgColors.info};font-family:Montserrat,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => { notif.remove(); }, 3000);
}

export function calculateWholesale(weight, pricePerKg) {
  let discount = 0;
  if (weight >= 50) discount = 0.15;
  else if (weight >= 20) discount = 0.10;
  else if (weight >= 10) discount = 0.05;
  const subtotal = weight * pricePerKg;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;
  return { subtotal, discount, discountAmount, total };
}

export function getUserOrders(user) {
  const orders = loadFromStorage('orders', []);
  return orders.filter(o => o.userId === user?.id || o.customerEmail === user?.email);
}
