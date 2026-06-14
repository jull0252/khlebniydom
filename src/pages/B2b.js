import React, { useState, useEffect } from 'react';
import { apiB2bRequest } from '../utils/api';
import { loadFromStorage, saveToStorage, showNotification } from '../utils/storage';

function B2b() {
  const [calcWeight, setCalcWeight] = useState('');
  const [calcProduct, setCalcProduct] = useState('85');
  const [calcResult, setCalcResult] = useState({ total: 0, discount: 0, discountAmount: 0 });
  const [request, setRequest] = useState({ company: '', inn: '', name: '', phone: '', email: '', volume: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCalculate = () => {
    const weight = parseFloat(calcWeight) || 0;
    const pricePerKg = parseFloat(calcProduct);
    let discount = 0;
    if (weight >= 50) discount = 0.15;
    else if (weight >= 20) discount = 0.10;
    else if (weight >= 10) discount = 0.05;
    const subtotal = weight * pricePerKg;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;
    setCalcResult({ total, discount, discountAmount });
  };

  useEffect(() => { handleCalculate(); }, [calcWeight, calcProduct]); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiB2bRequest(request);
      showNotification('Заявка отправлена! Наш менеджер свяжется с вами.', 'success');
      setRequest({ company: '', inn: '', name: '', phone: '', email: '', volume: '', comment: '' });
    } catch {
      // Fallback: localStorage
      const requests = loadFromStorage('b2b_requests', []);
      requests.push({ ...request, date: new Date().toISOString() });
      saveToStorage('b2b_requests', requests);
      showNotification('Заявка отправлена (офлайн-режим).', 'success');
      setRequest({ company: '', inn: '', name: '', phone: '', email: '', volume: '', comment: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="b2b-container">
      <div className="b2b-hero">
        <h1>Оптовым клиентам</h1>
        <p>Свежая выпечка для вашего бизнеса — кафе, ресторанов, магазинов и офисов</p>
        <a href="#request" className="btn btn-primary" style={{ background: 'white', color: '#d45a2b' }}>Оставить заявку</a>
      </div>

      <div className="b2b-benefits">
        <div className="benefit-card"><h3>Собственное производство</h3><p>Контроль качества на всех этапах</p></div>
        <div className="benefit-card"><h3>Бесплатная доставка</h3><p>При заказе от 10 000 ₽</p></div>
        <div className="benefit-card"><h3>Гибкая система скидок</h3><p>До 15% в зависимости от объема</p></div>
      </div>

      <div className="price-table">
        <h3 style={{ padding: '20px 20px 0' }}>Прайс-лист (оптовые цены)</h3>
        <table>
          <thead><tr><th>Товар</th><th>Розничная цена</th><th>Опт (от 10 кг)</th><th>Опт (от 50 кг)</th></tr></thead>
          <tbody>
            <tr><td>Хлеб бородинский</td><td>85 ₽/шт</td><td>75 ₽/шт <span className="discount-badge">-12%</span></td><td>68 ₽/шт <span className="discount-badge">-20%</span></td></tr>
            <tr><td>Батон нарезной</td><td>55 ₽/шт</td><td>48 ₽/шт <span className="discount-badge">-13%</span></td><td>44 ₽/шт <span className="discount-badge">-20%</span></td></tr>
            <tr><td>Круассан с шоколадом</td><td>120 ₽/шт</td><td>105 ₽/шт <span className="discount-badge">-12.5%</span></td><td>96 ₽/шт <span className="discount-badge">-20%</span></td></tr>
            <tr><td>Пирог с яблоком</td><td>350 ₽/шт</td><td>310 ₽/шт <span className="discount-badge">-11%</span></td><td>280 ₽/шт <span className="discount-badge">-20%</span></td></tr>
            <tr><td>Хлеб с отрубями</td><td>90 ₽/шт</td><td>80 ₽/шт <span className="discount-badge">-11%</span></td><td>72 ₽/шт <span className="discount-badge">-20%</span></td></tr>
          </tbody>
        </table>
      </div>

      <div className="wholesale-calculator">
        <h3>Калькулятор оптового заказа</h3>
        <div className="calc-row">
          <div className="form-group"><label>Вес заказа (кг)</label><input type="number" placeholder="Введите вес в кг" step="1" min="1" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} /></div>
          <div className="form-group"><label>Тип продукции</label><select value={calcProduct} onChange={e => setCalcProduct(e.target.value)}>
            <option value="85">Хлеб бородинский (85 ₽/кг)</option>
            <option value="55">Батон нарезной (55 ₽/кг)</option>
            <option value="120">Круассан (120 ₽/кг)</option>
            <option value="350">Пирог (350 ₽/кг)</option>
            <option value="90">Хлеб с отрубями (90 ₽/кг)</option>
          </select></div>
        </div>
        <div className="calc-result">
          <h3>Стоимость заказа</h3>
          <div className="calc-total">{calcResult.total.toLocaleString()} ₽</div>
          {calcResult.discount > 0 ? (
            <div style={{ color: '#4caf50', marginTop: '10px' }}>Скидка: {(calcResult.discount * 100)}% ({calcResult.discountAmount.toLocaleString()} ₽)</div>
          ) : (
            <div style={{ marginTop: '10px' }}>Для получения скидки закажите от 10 кг</div>
          )}
        </div>
      </div>

      <div id="request" className="request-form">
        <h3>Оставить заявку на оптовую поставку</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Название организации *</label><input type="text" required value={request.company} onChange={e => setRequest(s => ({ ...s, company: e.target.value }))} /></div>
            <div className="form-group"><label>ИНН</label><input type="text" value={request.inn} onChange={e => setRequest(s => ({ ...s, inn: e.target.value }))} /></div>
            <div className="form-group"><label>Контактное лицо *</label><input type="text" required value={request.name} onChange={e => setRequest(s => ({ ...s, name: e.target.value }))} /></div>
            <div className="form-group"><label>Телефон *</label><input type="tel" placeholder="+7 (___) ___-__-__" required value={request.phone} onChange={e => setRequest(s => ({ ...s, phone: e.target.value }))} /></div>
            <div className="form-group"><label>Email *</label><input type="email" required value={request.email} onChange={e => setRequest(s => ({ ...s, email: e.target.value }))} /></div>
            <div className="form-group"><label>Желаемый объем (кг/мес)</label><input type="number" placeholder="Например: 100" value={request.volume} onChange={e => setRequest(s => ({ ...s, volume: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label>Комментарий</label><textarea rows="3" placeholder="Дополнительная информация..." value={request.comment} onChange={e => setRequest(s => ({ ...s, comment: e.target.value }))} /></div>
          <button type="submit" className="btn-primary" style={{ padding: '12px 30px' }} disabled={submitting}>
            {submitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default B2b;
