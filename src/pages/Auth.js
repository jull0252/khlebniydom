import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/storage';

function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', role: 'b2c',
    companyName: '', inn: '', password: '', confirm: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      showNotification('Вход выполнен!', 'success');
      navigate('/');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) {
      showNotification('Пароли не совпадают', 'error');
      return;
    }
    if (regForm.password.length < 6) {
      showNotification('Пароль должен быть не менее 6 символов', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(regForm);
      showNotification('Регистрация успешна!', 'success');
      navigate('/');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button className={`auth-tab${activeTab === 'login' ? ' active' : ''}`} onClick={() => setActiveTab('login')}>Вход</button>
        <button className={`auth-tab${activeTab === 'register' ? ' active' : ''}`} onClick={() => setActiveTab('register')}>Регистрация</button>
      </div>

      {activeTab === 'login' && (
        <form onSubmit={handleLogin}>
          <div className="form-group"><label>Email</label><input type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label>Пароль</label><input type="password" required value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} /></div>
          <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        </form>
      )}

      {activeTab === 'register' && (
        <form onSubmit={handleRegister}>
          <div className="form-group"><label>Имя / Название организации</label><input type="text" required value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label>Email</label><input type="email" required value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label>Телефон</label><input type="tel" placeholder="+7 (___) ___-__-__" required value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="form-group">
            <label>Тип клиента</label>
            <select value={regForm.role} onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}>
              <option value="b2c">Частный клиент</option>
              <option value="b2b">Юридическое лицо / ИП</option>
            </select>
          </div>
          {regForm.role === 'b2b' && (
            <div>
              <div className="form-group"><label>Название организации</label><input type="text" required value={regForm.companyName} onChange={e => setRegForm(f => ({ ...f, companyName: e.target.value }))} /></div>
              <div className="form-group"><label>ИНН</label><input type="text" required value={regForm.inn} onChange={e => setRegForm(f => ({ ...f, inn: e.target.value }))} /></div>
            </div>
          )}
          <div className="form-group"><label>Пароль</label><input type="password" required value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div className="form-group"><label>Подтверждение пароля</label><input type="password" required value={regForm.confirm} onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))} /></div>
          <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
        </form>
      )}
    </div>
  );
}

export default Auth;
