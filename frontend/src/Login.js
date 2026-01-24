import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:5000/api";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Lógica de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/login`, { username, password });
      onLogin(response.data);
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/register`, { username, password });
      alert("Conta criada com sucesso! Agora você pode entrar.");
      setIsRegistering(false); // Volta para o login após registrar
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.logo}><span>CNA Finance</span></h1>
        <h2 style={styles.subtitle}>
          {isRegistering ? "Crie sua conta" : "Sua carteira digital do CNA"}
        </h2>

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <input 
            type="text" 
            placeholder="Usuário" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          
          <button type="submit" style={styles.mainButton} disabled={loading}>
            {loading ? "Aguarde..." : (isRegistering ? "Registrar" : "Entrar")}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isRegistering ? "Já tem uma conta?" : "Ainda não tem conta?"}
          <span 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={styles.toggleLink}
          >
            {isRegistering ? " Faça Login" : " Cadastre-se"}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { 
    display: 'flex', justifyContent: 'center', alignItems: 'center', 
    height: '100vh', backgroundColor: '#0f172a' 
  },
  card: { 
    backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', 
    width: '320px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' 
  },
  logo: { color: '#E50136', margin: '0 0 10px 0', fontSize: '32px', fontWeight: '900' },
  subtitle: { color: '#f8fafc', fontSize: '16px', marginBottom: '30px', fontWeight: '400' },
  input: { 
    width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '10px', 
    border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', 
    boxSizing: 'border-box', outline: 'none' 
  },
  mainButton: { 
    width: '100%', padding: '14px', backgroundColor: '#E50136', color: 'white', 
    border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
    fontSize: '16px', transition: '0.2s'
  },
  toggleText: { color: '#8E8C8D', marginTop: '25px', fontSize: '14px' },
  toggleLink: { color: '#0B6BB5', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;