import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:5000/api/register", { username, password });
      alert("Conta criada! Agora faça seu login.");
      onBack(); // Volta para a tela de login
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao registrar");
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleRegister} style={styles.card}>
        <h2 style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Criar Conta</h2>
        <input 
          type="text" placeholder="Escolha um usuário" 
          onChange={e => setUsername(e.target.value)} style={styles.input} required
        />
        <input 
          type="password" placeholder="Crie uma senha" 
          onChange={e => setPassword(e.target.value)} style={styles.input} required
        />
        <button type="submit" style={styles.button}>Registrar</button>
        <button type="button" onClick={onBack} style={styles.backBtn}>Voltar ao Login</button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '24px', width: '300px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #8E8C8D', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#0B6BB5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#8E8C8D', cursor: 'pointer', fontSize: '14px' }
};

export default Register;