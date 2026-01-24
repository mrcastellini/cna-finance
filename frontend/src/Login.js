import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, AlertCircle } from 'lucide-react';

<<<<<<< HEAD
// Substitua pela URL que o Render te fornecer
const API_BASE = "https://cna-finance-api.onrender.com/api";

function Login({ onLogin }) {
=======
const API_BASE = "https://cna-finance-api.onrender.com/api";

function Login({ onLogin, onSwitch }) {
>>>>>>> bf97fc9 (Atualização)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username,
        password
      });
<<<<<<< HEAD
      
      // Passa os dados do usuário para o App.js
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao conectar com o servidor');
=======
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Usuário ou senha inválidos');
>>>>>>> bf97fc9 (Atualização)
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
<<<<<<< HEAD
          <p style={styles.subtitle}>Acesse sua conta para gerenciar seus CNA$</p>
=======
          <p style={styles.subtitle}>Faça login para continuar</p>
>>>>>>> bf97fc9 (Atualização)
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
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
<<<<<<< HEAD
              placeholder="Usuário"
=======
              placeholder="Seu usuário"
>>>>>>> bf97fc9 (Atualização)
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <input
              type="password"
<<<<<<< HEAD
              placeholder="Senha"
=======
              placeholder="Sua senha"
>>>>>>> bf97fc9 (Atualização)
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
          >
<<<<<<< HEAD
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
=======
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.switchContainer}>
          <p style={styles.switchText}>Não tem uma conta?</p>
          <button onClick={onSwitch} style={styles.switchButton}>
            Criar conta agora
          </button>
        </div>
>>>>>>> bf97fc9 (Atualização)
      </div>
      <footer style={styles.footer}>
        CNA Finance by Grupo Gambarini &copy; 2026
      </footer>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' },
  card: { width: '100%', maxWidth: '400px', backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', textAlign: 'center' },
  logoSection: { marginBottom: '30px' },
  iconC: { backgroundColor: '#0f172a', color: '#E50136', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', border: '2px solid #E50136', margin: '0 auto 15px' },
<<<<<<< HEAD
  logoText: { color: 'white', fontSize: '24px', margin: '0 0 10px 0' },
=======
  logoText: { color: 'white', fontSize: '24px', margin: '0 0 10px 0', fontWeight: '800' },
>>>>>>> bf97fc9 (Atualização)
  subtitle: { color: '#94a3b8', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  errorBadge: { backgroundColor: 'rgba(229, 1, 54, 0.1)', color: '#E50136', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', border: '1px solid #E50136' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '15px' },
<<<<<<< HEAD
  input: { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '16px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' },
  button: { width: '100%', backgroundColor: '#E50136', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'transform 0.1s' },
  footer: { marginTop: '20px', color: '#475569', fontSize: '12px' }
=======
  input: { width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', backgroundColor: '#E50136', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  switchContainer: { marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #334155' },
  switchText: { color: '#94a3b8', fontSize: '14px', marginBottom: '5px' },
  switchButton: { background: 'none', border: 'none', color: '#E50136', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' },
  footer: { marginTop: '20px', color: '#475569', fontSize: '11px' }
>>>>>>> bf97fc9 (Atualização)
};

export default Login;
