import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCreateOrder } from '../utils/api';
import { getCart, calculateTotal, showNotification, getCurrentUser } from '../utils/storage';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', comment: '' });
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const items = getCart();
    setCartItems(items);
    const user = getCurrentUser();
    if (user) {
      setForm(f => ({ ...f, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
    }
  }, []);

  const { subtotal, deliveryCost } = calculateTotal();
  const actualDeliveryCost = deliveryType === 'pickup' ? 0 : deliveryCost;
  const actualTotal = subtotal + actualDeliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) { showNotification('Корзина пуста', 'error'); return; }

    setSubmitting(true);
    try {
      const orderData = {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        address: deliveryType === 'pickup' ? 'Самовывоз' : form.address,
        deliveryMethod: deliveryType,
        paymentMethod,
        comment: form.comment,
        subtotal,
        deliveryCost: actualDeliveryCost,
        total: actualTotal,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          icon: '',
        })),
      };

      await apiCreateOrder(orderData);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      showNotification('Заказ успешно оформлен!', 'success');
      setTimeout(() => navigate('/'), 2000);
    } catch {
      // Fallback: localStorage
      const user = getCurrentUser();
      const order = {
        id: Date.now(),
        userId: user?.id || null,
        items: cartItems,
        subtotal,
        deliveryCost: actualDeliveryCost,
        total: actualTotal,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        address: deliveryType === 'pickup' ? 'Самовывоз' : form.address,
        deliveryMethod: deliveryType,
        paymentMethod,
        comment: form.comment,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      showNotification('Заказ оформлен (офлайн-режим)', 'success');
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Оформление заказа</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 style={sectionTitleStyle}>Контактные данные</h3>
            <div className="form-row">
              <div className="form-group"><label>ФИО *</label><input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label>Телефон *</label><input type="tel" placeholder="+7 (___) ___-__-__" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>

          <div className="form-section">
            <h3 style={sectionTitleStyle}>Способ доставки</h3>
            <div className="delivery-options">
              <label><input type="radio" name="delivery" value="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} /> Доставка курьером</label>
              <label><input type="radio" name="delivery" value="pickup" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} /> Самовывоз (бесплатно)</label>
            </div>
            {deliveryType === 'delivery' && (
              <div className="form-group"><label>Адрес доставки *</label><input type="text" placeholder="Улица, дом, квартира" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            )}
          </div>

          <div className="form-section">
            <h3 style={sectionTitleStyle}>Способ оплаты</h3>
            <div className="payment-options">
              <label><input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Онлайн-картой</label>
              <label><input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Наличными курьеру</label>
              <label><input type="radio" name="payment" value="invoice" checked={paymentMethod === 'invoice'} onChange={() => setPaymentMethod('invoice')} /> По счету (для юрлиц)</label>
            </div>
          </div>

          <div className="form-section" style={{ borderBottom: 'none' }}>
            <h3 style={sectionTitleStyle}>Комментарий к заказу</h3>
            <div className="form-group"><textarea rows="3" placeholder="Пожелания по доставке, времени и т.д." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} /></div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }} disabled={submitting}>
            {submitting ? 'Оформление...' : 'Подтвердить заказ'}
          </button>
        </form>
      </div>

      <div className="checkout-summary">
        <h3>Ваш заказ</h3>
        <div className="order-items">
          {cartItems.length === 0 ? <p>Корзина пуста</p> : (
            cartItems.map(item => (
              <div className="order-item" key={item.id}>
                <span>{item.name} x {item.quantity}</span>
                <span>{item.price * item.quantity} ₽</span>
              </div>
            ))
          )}
        </div>
        <div className="summary-row"><span>Промежуточная сумма:</span><span>{subtotal} ₽</span></div>
        <div className="summary-row"><span>Доставка:</span><span>{actualDeliveryCost === 0 ? 'Бесплатно' : `${actualDeliveryCost} ₽`}</span></div>
        <div className="summary-total"><span>Итого к оплате:</span><span>{actualTotal} ₽</span></div>
      </div>
    </div>
  );
}

const sectionTitleStyle = { marginBottom: '20px', color: '#d45a2b' };

export default Checkout;
