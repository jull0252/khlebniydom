import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, saveToStorage, calculateTotal } from '../utils/storage';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(getCart());
    const handler = () => setCartItems(getCart());
    window.addEventListener('cart-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const updateQuantity = (id, delta) => {
    const newCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCartItems(newCart);
    saveToStorage('cart', newCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeFromCart = (id) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    saveToStorage('cart', newCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const { subtotal, deliveryCost, total, totalWeight } = calculateTotal();

  return (
    <div className="cart-container">
      <div>
        <h2>Корзина</h2>
        <table className="cart-table">
          <thead>
            <tr><th>Товар</th><th>Название</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th></tr>
          </thead>
          <tbody>
            {cartItems.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Корзина пуста</td></tr>
            ) : (
              cartItems.map(item => (
                <tr key={item.id}>
                  <td><div style={{ width: '50px', height: '50px', background: '#f3e1cb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}</div></td>
                  <td>{item.name}</td>
                  <td>{item.price} ₽</td>
                  <td>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '50%', background: 'white', cursor: 'pointer' }}>−</button>
                    <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '30px', height: '30px', border: '1px solid #ddd', borderRadius: '50%', background: 'white', cursor: 'pointer' }}>+</button>
                  </td>
                  <td>{item.price * item.quantity} ₽</td>
                  <td><button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Удалить</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="cart-summary">
        <h3>Итого</h3>
        <div className="summary-row"><span>Промежуточная сумма:</span><span>{subtotal} ₽</span></div>
        <div className="summary-row"><span>Общий вес:</span><span>{totalWeight.toFixed(2)} кг</span></div>
        <div className="summary-row"><span>Доставка:</span><span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}</span></div>
        <div className="summary-total"><span>Итого к оплате:</span><span>{total} ₽</span></div>
        <button className="add-to-cart" style={{ marginTop: '20px' }} onClick={() => navigate('/checkout')} disabled={cartItems.length === 0}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

export default Cart;
