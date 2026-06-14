import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetProducts } from '../utils/api';
import { loadFromStorage, saveToStorage, getCart, showNotification } from '../utils/storage';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiGetProducts({ popular: '1' });
        setProducts(data);
        saveToStorage('products', data);
      } catch {
        const stored = loadFromStorage('products', null);
        if (stored && stored.length > 0) {
          setProducts(stored.filter(p => p.popular));
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      }
    };
    fetchProducts();
  }, []);

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

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1>Свежая выпечка<br />с доставкой на дом</h1>
          <p>Хлеб, круассаны, пироги — всё по авторским рецептам из фермерских ингредиентов</p>
          <Link to="/catalog" className="btn btn-primary">Выбрать хлеб</Link>
          <a href="#contacts" className="btn btn-secondary">Связаться с нами</a>
        </div>
      </section>

      <section id="about" style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ background: '#f3e1cb', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '120px', minHeight: '300px' }}></div>
          <div>
            <h2>Пекарня с душой</h2>
            <p>Мы печем хлеб по традиционным рецептам, используя только натуральные ингредиенты. Каждое утро наша команда пекарей создает ароматную выпечку, которая радует наших клиентов.</p>
            <p>Без консервантов, без усилителей вкуса — только настоящий хлеб, как в деревне у бабушки.</p>
            <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '20px' }}>Смотреть каталог</Link>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '40px' }}>Наши преимущества</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            <div><h3>Свежая выпечка</h3><p>Готовим каждую ночь, доставляем утром</p></div>
            <div><h3>Натуральные ингредиенты</h3><p>Только фермерская мука и масло</p></div>
            <div><h3>Доставка за 2 часа</h3><p>Бесплатно от 1000 ₽</p></div>
            <div><h3>Поддержка 24/7</h3><p>Всегда на связи с вами</p></div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }} id="popular">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Популярные товары</h2>
          <div className="products-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <div style={{ width: '100%', height: '200px', background: '#f3e1cb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', overflow: 'hidden' }}>
                  {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', height: '40px', overflow: 'hidden' }}>{product.description || product.desc}</p>
                  <div className="product-price">{product.price} ₽</div>
                  <button className="add-to-cart" onClick={() => handleAddToCart(product)}>В корзину</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" style={{ backgroundColor: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '40px' }}>Отзывы наших клиентов</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            <div style={{ background: '#fef7e8', padding: '20px', borderRadius: '15px' }}><p style={{ fontSize: '30px' }}>"</p><p>Самый вкусный хлеб в городе! Заказываю каждую неделю.</p><p style={{ marginTop: '15px' }}><strong>Анна, Москва</strong></p></div>
            <div style={{ background: '#fef7e8', padding: '20px', borderRadius: '15px' }}><p style={{ fontSize: '30px' }}>"</p><p>Доставка вовремя, всегда свежее. Отличный сервис!</p><p style={{ marginTop: '15px' }}><strong>Семья Петровых, СПб</strong></p></div>
            <div style={{ background: '#fef7e8', padding: '20px', borderRadius: '15px' }}><p style={{ fontSize: '30px' }}>"</p><p>Для нашего кафе заказываем оптом. Всегда свежая выпечка, гибкие скидки.</p><p style={{ marginTop: '15px' }}><strong>Екатерина, Казань</strong></p></div>
          </div>
        </div>
      </section>
    </div>
  );
}

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Хлеб Бородинский', category: 'хлеб', price: 90, desc: 'Традиционный ржаной хлеб на закваске с кориандром.', popular: true },
  { id: 2, name: 'Круассан классический', category: 'сдоба', price: 120, desc: 'Воздушный слоеный круассан на настоящем фермерском масле.', popular: true },
  { id: 3, name: 'Пирог с вишней', category: 'пироги', price: 450, desc: 'Сладкий закрытый пирог с сочной вишневой начинкой.', popular: true },
];

export default Home;
