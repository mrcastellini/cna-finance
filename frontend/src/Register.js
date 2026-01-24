import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, User, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const API_BASE = "https://cna-finance-api.onrender.com/api";

const Register = ({ onSwitch, onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/register`, { username, password });
      alert("Conta criada com sucesso! Agora faça seu login.");
      onRegisterSuccess(); // Chama a função que volta para o login no App.js
    } catch (error) {
      setError(error.response?.data?.error || "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.iconC}>C</div>
          <h1 style={styles.logoText}>CNA <span style={{color: '#E50136'}}>Finance</span></h1>
          <p style={styles.subtitle}>Crie sua conta gratuita</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          {error && (
            <div style={styles.errorBadge}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <User size={20} color="#94a3b8" style={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Escolha um usuário" 
              value={username}
              onChange={e => setUsername(e.target.value)} 
              style={styles.input} 
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="Crie uma senha" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              style={styles.input} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
          >
            <UserPlus size={18} /> {loading ? 'Registrando...' : 'Criar minha conta'}
          </button>

          <button type="button" onClick={onSwitch} style={styles.backBtn}>
            <ArrowLeft size={16} /> Já tenho uma conta
          </button>
        </form>
      </div>
      <footer style={styles.footer}>
        CNA Finance by Grupo Gambarini &copy; 2026
      </footer>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' },
  card: { width: '100%', maxWidth: '400px', backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', textAlign: 'center' },
  logoSection: { marginBottom: '30px' },
  iconC: { backgroundColor: '#0f172a', color: '#E50136', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', border: '2px solid #E50136', margin: '0 auto 15px' },
  logoText: { color: 'white', fontSize: '24px', margin: '0 0 10px 0', fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  errorBadge: { backgroundColor: 'rgba(229, 1, 54, 0.1)', color: '#E50136', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', border: '1px solid #E50136' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '15px' },
  input: { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', backgroundColor: '#E50136', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  footer: { marginTop: '20px', color: '#475569', fontSize: '11px' }
};

export default Register;