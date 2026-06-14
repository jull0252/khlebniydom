import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetOrders, apiUpdateProfile, apiChangePassword } from '../utils/api';
import { loadFromStorage, saveToStorage, formatDate, getStatusColor, getStatusText, getCart, showNotification } from '../utils/storage';

function Profile() {
  const { user, loading, saveAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [editForm, setEditForm] = useState({ name: '', phone: '', companyName: '', inn: '' });
  const [passwordForm, setPasswordForm] = useState({ old: '', newPwd: '', confirm: '' });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const data = await apiGetOrders();
        setOrders(data);
        saveToStorage('orders', data);
      } catch {
        const stored = loadFromStorage('orders', []);
        const userOrders = stored.filter(o => o.userId === user.id || o.customerEmail === user.email);
        setOrders(userOrders);
      }
    };
    fetchOrders();

    setEditForm({ name: user.name || '', phone: user.phone || '', companyName: user.companyName || '', inn: user.inn || '' });
  }, [user, navigate, loading]);

  useEffect(() => {
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    let d = 0;
    if (totalSpent >= 50000) d = 15;
    else if (totalSpent >= 20000) d = 10;
    else if (totalSpent >= 10000) d = 5;
    setDiscount(d);
  }, [orders]);

  const handleRepeatOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.items) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const cart = getCart();
      if (Array.isArray(items)) {
        items.forEach(item => {
          const existing = cart.find(i => i.id === item.id || i.id === item.product_id);
          const qty = item.quantity || 1;
          if (existing) existing.quantity += qty;
          else cart.push({ id: item.product_id || item.id, name: item.product_name || item.name, price: item.price, quantity: qty, image: item.image || '', weight: 0.5 });
        });
      }
      saveToStorage('cart', cart);
      window.dispatchEvent(new Event('cart-updated'));
      showNotification('Товары добавлены в корзину', 'success');
      setTimeout(() => navigate('/cart'), 1000);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiUpdateProfile(editForm);
      const updatedUser = { ...user, ...editForm };
      saveAuth(localStorage.getItem('token'), updatedUser);
      showNotification('Данные сохранены', 'success');
    } catch {
      showNotification('Ошибка при сохранении', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { old, newPwd, confirm } = passwordForm;
    if (newPwd !== confirm) { showNotification('Новые пароли не совпадают', 'error'); return; }
    if (newPwd.length < 6) { showNotification('Пароль должен быть не менее 6 символов', 'error'); return; }
    try {
      await apiChangePassword(old, newPwd);
      showNotification('Пароль изменён', 'success');
      setPasswordForm({ old: '', newPwd: '', confirm: '' });
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const tabs = [
    { id: 'orders', label: 'Мои заказы' },
    { id: 'profile', label: 'Личные данные' },
    { id: 'password', label: 'Смена пароля' },
    ...(user?.role === 'b2b' ? [{ id: 'discounts', label: 'Мои скидки' }] : []),
  ];

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar"></div>
          <div className="profile-name">{user?.name || user?.email}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-role" style={{ textAlign: 'center', marginTop: '5px' }}>
            {user?.role === 'admin' ? 'Администратор' : user?.role === 'b2b' ? 'B2B клиент' : 'Частный клиент'}
          </div>
        </div>
        <div className="profile-menu">
          {tabs.map(tab => (
            <div key={tab.id} className={`profile-menu-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</div>
          ))}
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'orders' && (
          <div>
            <h3>История заказов</h3>
            <table className="orders-table">
              <thead><tr><th>№ заказа</th><th>Дата</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>У вас пока нет заказов</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{formatDate(order.created_at || order.createdAt)}</td>
                      <td>{order.total} ₽</td>
                      <td><span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>{getStatusText(order.status)}</span></td>
                      <td><button className="repeat-order" onClick={() => handleRepeatOrder(order.id)}>Повторить</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h3>Личные данные</h3>
            <form className="form-edit" onSubmit={handleProfileSubmit}>
              <div className="form-group"><label>Имя</label><input type="text" value={editForm.name} onChange={e => setEditForm(s => ({ ...s, name: e.target.value }))} /></div>
              <div className="form-group"><label>Телефон</label><input type="tel" value={editForm.phone} onChange={e => setEditForm(s => ({ ...s, phone: e.target.value }))} /></div>
              {user?.role === 'b2b' && (
                <>
                  <div className="form-group"><label>Название организации</label><input type="text" value={editForm.companyName} onChange={e => setEditForm(s => ({ ...s, companyName: e.target.value }))} /></div>
                  <div className="form-group"><label>ИНН</label><input type="text" value={editForm.inn} onChange={e => setEditForm(s => ({ ...s, inn: e.target.value }))} /></div>
                </>
              )}
              <div className="form-group"><label>Email</label><input type="email" value={user?.email || ''} readOnly /></div>
              <button type="submit" className="btn-primary">Сохранить изменения</button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h3>Смена пароля</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group"><label>Текущий пароль</label><input type="password" required value={passwordForm.old} onChange={e => setPasswordForm(s => ({ ...s, old: e.target.value }))} /></div>
              <div className="form-group"><label>Новый пароль</label><input type="password" required value={passwordForm.newPwd} onChange={e => setPasswordForm(s => ({ ...s, newPwd: e.target.value }))} /></div>
              <div className="form-group"><label>Подтверждение пароля</label><input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm(s => ({ ...s, confirm: e.target.value }))} /></div>
              <button type="submit" className="btn-primary">Изменить пароль</button>
            </form>
          </div>
        )}

        {activeTab === 'discounts' && (
          <div>
            <h3>Мои скидки</h3>
            <div style={{ background: '#fef7e8', padding: '20px', borderRadius: '10px' }}>
              <h4>Ваша персональная скидка: {discount}%</h4>
              <p>Общая сумма заказов: {totalSpent.toLocaleString()} ₽</p>
              <p>Для повышения скидки:</p>
              <ul>
                <li>Скидка 5% — при заказе от 10 000 ₽</li>
                <li>Скидка 10% — при заказе от 20 000 ₽</li>
                <li>Скидка 15% — при заказе от 50 000 ₽</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
