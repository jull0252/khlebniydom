import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../utils/storage';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const cart = getCart();
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart-updated', update);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">Хлебный дом</Link>
          <nav className="nav-menu">
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/" onClick={() => setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100)}>О нас</Link>
            <Link to="/b2b">Опт</Link>
            <Link to="/" onClick={() => setTimeout(() => document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' }), 100)}>Контакты</Link>
            {user ? (
              <>
                <Link to="/profile">Личный кабинет</Link>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', padding: 0 }}>Выход</button>
              </>
            ) : (
              <Link to="/login">Вход</Link>
            )}
          </nav>
          <div className="cart-icon" onClick={() => navigate('/cart')}>
            <span>Корзина</span>
            <span className="cart-count">{cartCount}</span>
          </div>
        </div>
      </header>

      <main style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Хлебный дом</h4>
            <p>Свежая выпечка с доставкой на дом с 2018 года</p>
          </div>
          <div className="footer-column">
            <h4>Меню</h4>
            <Link to="/">Главная</Link>
            <Link to="/catalog">Каталог</Link>
            <Link to="/b2b">Оптовикам</Link>
          </div>
          <div className="footer-column">
            <h4>Контакты</h4>
            <p>+7 (495) 123-45-67</p>
            <p>info@khlebniydom.ru</p>
            <p>г. Москва, ул. Хлебная, 15</p>
          </div>
          <div className="footer-column">
            <h4>Часы работы</h4>
            <p>Пн-Вс: 8:00 - 22:00</p>
          </div>
        </div>
        <div className="copyright">
          <p>© 2026 Хлебный дом. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
