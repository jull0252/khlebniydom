import React, { useState, useMemo, useEffect } from 'react';
import { apiGetProducts } from '../utils/api';
import { loadFromStorage, saveToStorage, getCart, showNotification } from '../utils/storage';

function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (category !== 'all') params.category = category;
        if (searchQuery) params.search = searchQuery;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy !== 'default') params.sortBy = sortBy;
        const data = await apiGetProducts(params);
        setProducts(data);
        saveToStorage('products', data);
      } catch {
        const stored = loadFromStorage('products', null);
        setProducts(stored && stored.length > 0 ? stored : INITIAL_PRODUCTS);
      }
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, category, maxPrice, sortBy]);

  const handleAddToCart = (product) => {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, weight: product.weight || 0.5 });
    }
    saveToStorage('cart', cart);
    window.dispatchEvent(new Event('cart-updated'));
    showNotification(`${product.name} добавлен в корзину`, 'success');
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.description || p.desc || '').toLowerCase().includes(q));
    }
    if (category !== 'all') {
      result = result.filter(p => (p.category_slug || p.category) === category || p.category_id === ({ hleb: 1, sdoba: 2, pirogi: 3 })[category]);
    }
    if (maxPrice !== '') result = result.filter(p => p.price <= Number(maxPrice));
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return result;
  }, [searchQuery, category, maxPrice, sortBy, products]);

  return (
    <div>
      <div style={{ marginTop: '80px' }}></div>

      <div className="filters">
        <div className="filter-group">
          <label>Поиск</label>
          <input type="text" placeholder="Название или описание..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Категория</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="all">Все</option>
            <option value="hleb">Хлеб</option>
            <option value="sdoba">Сдоба</option>
            <option value="pirogi">Пироги</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Макс. цена</label>
          <input type="number" placeholder="Любая" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Сортировка</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">Сначала дешевые</option>
            <option value="price-desc">Сначала дорогие</option>
            <option value="name-asc">По названию (А-Я)</option>
          </select>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div style={{ width: '100%', height: '200px', background: '#f3e1cb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', overflow: 'hidden' }}>
                {product.image ? <img src={product.image} alt={product.name} /> : null}
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', height: '40px', overflow: 'hidden' }}>{product.description || product.desc}</p>
                <div className="product-price">{product.price} ₽</div>
                <button className="add-to-cart" onClick={() => handleAddToCart(product)}>В корзину</button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#888' }}>
            Товары, соответствующие фильтрам, не найдены.
          </p>
        )}
      </div>
    </div>
  );
}

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Хлеб Бородинский', category: 'хлеб', price: 90, desc: 'Традиционный ржаной хлеб на закваске с кориандром.', weight: 0.5 },
  { id: 2, name: 'Круассан классический', category: 'сдоба', price: 120, desc: 'Воздушный слоеный круассан на настоящем фермерском масле.', weight: 0.15 },
  { id: 3, name: 'Пирог с вишней', category: 'пироги', price: 450, desc: 'Сладкий закрытый пирог с сочной вишневой начинкой.', weight: 0.8 },
  { id: 4, name: 'Багет французский', category: 'хлеб', price: 85, desc: 'Хрустящая корочка и нежный пористый мякиш внутри.', weight: 0.3 },
  { id: 5, name: 'Улитка с корицей', category: 'сдоба', price: 110, desc: 'Ароматная выпечка с корицей, политая сахарной глазурью.', weight: 0.12 },
  { id: 6, name: 'Пирог с мясом', category: 'пироги', price: 600, desc: 'Сытный пирог с начинкой из фермерской говядины и свинины.', weight: 1.0 },
];

export default Catalog;
