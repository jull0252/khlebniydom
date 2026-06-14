import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct, apiGetOrders, apiUpdateOrderStatus, apiUploadImage } from '../utils/api';
import { loadFromStorage, saveToStorage, formatDate, getStatusColor, getStatusText, showNotification } from '../utils/storage';

function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('stats');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', weight: '', category: 'hleb', description: '', image: '', popular: false });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') { navigate('/'); return; }

    const fetchData = async () => {
      try {
        const [p, o] = await Promise.all([apiGetProducts(), apiGetOrders()]);
        setProducts(p);
        setOrders(o);
        saveToStorage('products', p);
        saveToStorage('orders', o);
      } catch {
        setProducts(loadFromStorage('products', INITIAL_PRODUCTS));
        setOrders(loadFromStorage('orders', []));
      }
    };
    fetchData();
    setUsers(loadFromStorage('users', []));
  }, [user, navigate, loading]);

  const stats = {
    totalOrders: orders.length,
    totalUsers: users.length,
    totalProducts: products.length,
    revenue: orders.reduce((s, o) => s + Number(o.total), 0),
    newOrders: orders.filter(o => o.status === 'new').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const handleImageUpload = async (file, setter) => {
    setUploading(true);
    try {
      const data = await apiUploadImage(file);
      const updater = s => ({ ...s, image: data.url });
      if (setter) setter(updater);
      else setNewProduct(updater);
      showNotification('Изображение загружено', 'success');
    } catch {
      showNotification('Ошибка загрузки изображения', 'error');
    }
    setUploading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const data = await apiAddProduct({
        name: newProduct.name,
        price: Number(newProduct.price),
        weight: Number(newProduct.weight),
        category: newProduct.category,
        description: newProduct.description,
        image: newProduct.image,
        popular: newProduct.popular,
      });
      setProducts(prev => [...prev, { ...newProduct, id: data.id }]);
      setNewProduct({ name: '', price: '', weight: '', category: 'hleb', description: '', image: '', popular: false });
      showNotification('Товар добавлен', 'success');
    } catch {
      showNotification('Ошибка при добавлении товара', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showNotification('Товар удалён', 'success');
    } catch {
      showNotification('Ошибка при удалении', 'error');
    }
  };

  const handleEditProduct = (product) => setEditModal({ ...product });

  const handleSaveEdit = async () => {
    try {
      await apiUpdateProduct(editModal);
      setProducts(prev => prev.map(p => p.id === editModal.id ? editModal : p));
      setEditModal(null);
      showNotification('Товар обновлён', 'success');
    } catch {
      showNotification('Ошибка при обновлении', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showNotification('Статус обновлён', 'success');
    } catch {
      showNotification('Ошибка при обновлении статуса', 'error');
    }
  };

  const sections = ['stats', 'products', 'orders', 'users'];

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;

  return (
    <div className="admin-container">
      <div className="admin-tabs">
        {sections.map(s => (
          <button key={s} className={`admin-tab${activeSection === s ? ' active' : ''}`} onClick={() => setActiveSection(s)}>
            {s === 'stats' ? 'Статистика' : s === 'products' ? 'Товары' : s === 'orders' ? 'Заказы' : 'Пользователи'}
          </button>
        ))}
      </div>

      {activeSection === 'stats' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{stats.totalOrders}</div><div>Всего заказов</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalUsers}</div><div>Пользователей</div></div>
            <div className="stat-card"><div className="stat-value">{stats.totalProducts}</div><div>Товаров</div></div>
            <div className="stat-card"><div className="stat-value">{stats.revenue.toLocaleString()} ₽</div><div>Выручка</div></div>
          </div>
          <h3>Статусы заказов</h3>
          <div className="status-stats">
            <div className="status-card" style={{ borderLeft: '4px solid #ff9800' }}><div className="stat-value">{stats.newOrders}</div><div>Новые</div></div>
            <div className="status-card" style={{ borderLeft: '4px solid #2196f3' }}><div className="stat-value">{stats.processing}</div><div>В работе</div></div>
            <div className="status-card" style={{ borderLeft: '4px solid #4caf50' }}><div className="stat-value">{stats.delivered}</div><div>Доставлены</div></div>
            <div className="status-card" style={{ borderLeft: '4px solid #f44336' }}><div className="stat-value">{stats.cancelled}</div><div>Отменены</div></div>
          </div>
        </div>
      )}

      {activeSection === 'products' && (
        <div>
          <div className="form-add">
            <h3>Добавить товар</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-row">
                <div className="form-group"><label>Название *</label><input type="text" required value={newProduct.name} onChange={e => setNewProduct(s => ({ ...s, name: e.target.value }))} /></div>
                <div className="form-group"><label>Цена (₽) *</label><input type="number" required value={newProduct.price} onChange={e => setNewProduct(s => ({ ...s, price: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Вес (кг) *</label><input type="number" step="0.01" required value={newProduct.weight} onChange={e => setNewProduct(s => ({ ...s, weight: e.target.value }))} /></div>
                <div className="form-group"><label>Категория</label><select value={newProduct.category} onChange={e => setNewProduct(s => ({ ...s, category: e.target.value }))}><option value="hleb">Хлеб</option><option value="sdoba">Сдоба</option><option value="pirogi">Пироги</option></select></div>
              </div>
              <div className="form-group"><label>Описание</label><textarea rows="3" value={newProduct.description} onChange={e => setNewProduct(s => ({ ...s, description: e.target.value }))} /></div>
              <div className="form-group"><label>Изображение</label><input type="file" accept="image/*" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />{uploading && <span> Загрузка...</span>}{newProduct.image && <img src={newProduct.image} alt="" style={{ maxWidth: 100, display: 'block', marginTop: 5 }} />}</div>
              <div className="form-group"><label><input type="checkbox" checked={newProduct.popular} onChange={e => setNewProduct(s => ({ ...s, popular: e.target.checked }))} /> Популярный</label></div>
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Добавить товар</button>
            </form>
          </div>
          <h3>Список товаров</h3>
          <table>
            <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Вес</th><th>Категория</th><th>Действия</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price} ₽</td>
                  <td>{p.weight} кг</td>
                  <td>{p.category_name || p.category}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditProduct(p)}>Ред.</button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(p.id)}>Удал.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'orders' && (
        <div>
          <h3>Список заказов</h3>
          <table>
            <thead><tr><th>ID</th><th>Дата</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Действия</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{formatDate(o.created_at || o.createdAt)}</td>
                  <td>{o.customer_name || o.customerName || o.customer_email}</td>
                  <td>{o.total} ₽</td>
                  <td><span className="status-badge" style={{ backgroundColor: getStatusColor(o.status) }}>{getStatusText(o.status)}</span></td>
                  <td>
                    <select value={o.status} onChange={e => handleUpdateStatus(o.id, e.target.value)} style={{ padding: '4px 8px', borderRadius: '5px' }}>
                      <option value="new">Новый</option>
                      <option value="processing">В работе</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'users' && (
        <div>
          <h3>Список пользователей</h3>
          <table>
            <thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Дата регистрации</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role === 'admin' ? 'Админ' : u.role === 'b2b' ? 'B2B' : 'Клиент'}</td>
                  <td>{formatDate(u.createdAt || u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <h3>Редактировать товар</h3>
            <div className="form-group"><label>Название</label><input type="text" value={editModal.name} onChange={e => setEditModal(s => ({ ...s, name: e.target.value }))} /></div>
            <div className="form-group"><label>Описание</label><textarea rows="3" value={editModal.description || editModal.desc} onChange={e => setEditModal(s => ({ ...s, description: e.target.value }))} /></div>
            <div className="form-group"><label>Цена (₽)</label><input type="number" value={editModal.price} onChange={e => setEditModal(s => ({ ...s, price: Number(e.target.value) }))} /></div>
            <div className="form-group"><label>Вес (кг)</label><input type="number" step="0.01" value={editModal.weight} onChange={e => setEditModal(s => ({ ...s, weight: Number(e.target.value) }))} /></div>
            <div className="form-group"><label>Категория</label><select value={editModal.category_slug || editModal.category} onChange={e => setEditModal(s => ({ ...s, category: e.target.value }))}><option value="hleb">Хлеб</option><option value="sdoba">Сдоба</option><option value="pirogi">Пироги</option></select></div>
            <div className="form-group"><label>Изображение</label><input type="file" accept="image/*" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], setEditModal)} />{uploading && <span> Загрузка...</span>}{editModal.image && <img src={editModal.image} alt="" style={{ maxWidth: 100, display: 'block', marginTop: 5 }} />}</div>
            <div className="form-group"><label><input type="checkbox" checked={editModal.popular} onChange={e => setEditModal(s => ({ ...s, popular: e.target.checked }))} /> Популярный</label></div>
            <button className="btn-primary" onClick={handleSaveEdit}>Сохранить</button>
            <button style={{ marginLeft: '10px' }} onClick={() => setEditModal(null)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Хлеб Бородинский', category: 'хлеб', price: 90, weight: 0.5, desc: 'Традиционный ржаной хлеб на закваске с кориандром.', popular: true },
  { id: 2, name: 'Круассан классический', category: 'сдоба', price: 120, weight: 0.15, desc: 'Воздушный слоеный круассан на настоящем фермерском масле.', popular: true },
  { id: 3, name: 'Пирог с вишней', category: 'пироги', price: 450, weight: 0.8, desc: 'Сладкий закрытый пирог с сочной вишневой начинкой.', popular: true },
  { id: 4, name: 'Багет французский', category: 'хлеб', price: 85, weight: 0.3, desc: 'Хрустящая корочка и нежный пористый мякиш внутри.' },
  { id: 5, name: 'Улитка с корицей', category: 'сдоба', price: 110, weight: 0.12, desc: 'Ароматная выпечка с корицей, политая сахарной глазурью.' },
  { id: 6, name: 'Пирог с мясом', category: 'пироги', price: 600, weight: 1.0, desc: 'Сытный пирог с начинкой из фермерской говядины и свинины.' },
];

export default Admin;
