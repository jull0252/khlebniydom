import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetOrders } from '../utils/api';
import { loadFromStorage, formatDate, getStatusColor, getStatusText } from '../utils/storage';

function Cabinet() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, discount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      try {
        const data = await apiGetOrders();
        const totalOrders = data.length;
        const totalSpent = data.reduce((sum, o) => sum + Number(o.total), 0);
        let discount = 0;
        if (totalSpent >= 50000) discount = 15;
        else if (totalSpent >= 20000) discount = 10;
        else if (totalSpent >= 10000) discount = 5;
        setStats({ totalOrders, totalSpent, discount });
        setRecentOrders(data.slice(0, 5));
      } catch {
        const orders = loadFromStorage('orders', []);
        const userOrders = orders.filter(o => o.userId === user.id || o.customerEmail === user.email);
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
        let discount = 0;
        if (totalSpent >= 50000) discount = 15;
        else if (totalSpent >= 20000) discount = 10;
        else if (totalSpent >= 10000) discount = 5;
        setStats({ totalOrders, totalSpent, discount });
        setRecentOrders(userOrders.slice(-5).reverse());
      }
    };
    fetchOrders();
  }, [user, navigate, loading]);

  return (
    <div className="cabinet-container">
      <div className="welcome-card">
        <h1>Добро пожаловать, {user?.name || user?.email}!</h1>
        <p>Рады видеть вас в личном кабинете</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div>Всего заказов</div></div>
        <div className="stat-card"><div className="stat-value">{stats.totalSpent.toLocaleString()} ₽</div><div>Потрачено</div></div>
        <div className="stat-card"><div className="stat-value">{stats.discount}%</div><div>Ваша скидка</div></div>
      </div>

      <div className="recent-orders">
        <h3>Последние заказы</h3>
        <table>
          <thead><tr><th>№ заказа</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr></thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>У вас пока нет заказов</td></tr>
            ) : (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatDate(order.created_at || order.createdAt)}</td>
                  <td>{order.total} ₽</td>
                  <td><span style={{ backgroundColor: getStatusColor(order.status), padding: '4px 8px', borderRadius: '20px', fontSize: '12px', color: 'white' }}>{getStatusText(order.status)}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Link to="/profile" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#d45a2b' }}>Перейти в полную версию кабинета →</Link>
      </div>
    </div>
  );
}

export default Cabinet;
