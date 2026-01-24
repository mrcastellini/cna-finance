import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, Send, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import Login from './Login';

const API_BASE = "http://127.0.0.1:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('user');
  const [paymentValue, setPaymentValue] = useState(''); // Novo: valor dinâmico
  const [loading, setLoading] = useState(false);

  // Sincroniza dados com o servidor
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE}/user/${user.id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao sincronizar dados.");
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'user') {
      refreshUserData();
    }
  }, [activeTab, refreshUserData]);

    const handleLogout = () => {
    setUser(null);          // Remove o usuário do estado
    setActiveTab('user');   // Reseta a aba para o padrão
    setPaymentValue('');    // Limpa campos pendentes
    // Se usar localStorage no futuro, limpe aqui: localStorage.clear();
  };
  
  // Função de Pagamento Dinâmico
  const handlePayment = async () => {
    const valueToPay = parseFloat(paymentValue);
    
    if (isNaN(valueToPay) || valueToPay <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }

    if (valueToPay > user.balance) {
      alert("Saldo insuficiente para esta transação.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/user/pay`, { 
        user_id: user.id, 
        value: valueToPay 
      });
      await refreshUserData(); 
      setPaymentValue(''); // Limpa o campo após sucesso
      alert(`Pagamento de CNA$ ${valueToPay.toFixed(2)} realizado com sucesso!`);
    } catch (error) {
      alert(error.response?.data?.error || "Erro na transação");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div style={styles.container}>
      {/* Navegação Admin */}
      {user.role === 'admin' && (
        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab('user')} 
            style={{...styles.tab, borderBottom: activeTab === 'user' ? '3px solid var(--secondary)' : 'none'}}
          >
            <UserIcon size={18} /> Minha Conta
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            style={{...styles.tab, borderBottom: activeTab === 'admin' ? '3px solid var(--primary)' : 'none'}}
          >
            <ShieldCheck size={18} /> Painel Admin
          </button>
        </nav>
      )}

      {/* Top Bar */}
      <div style={styles.topBar}>
        <h1 style={styles.logo}>CNA <span>Finance</span></h1>
        <button onClick={() => setUser(null)} style={styles.logoutBtn}>
          <LogOut size={16} /> Sair
        </button>
      </div>

      {activeTab === 'user' ? (
        <main style={styles.mainContent}>
          <div style={styles.headerInfo}>
            <span style={styles.welcome}>Olá, {user.username}</span>
            <span style={styles.badge}>{user.role.toUpperCase()}</span>
          </div>

          {/* Card de Saldo */}
          <div style={styles.balanceCard}>
            <p style={styles.label}>Saldo disponível</p>
            <div style={styles.balanceRow}>
              <Wallet color="var(--secondary)" size={32} />
              <h2 style={styles.balanceValue}>CNA$ {user.balance.toFixed(2)}</h2>
            </div>
          </div>

          {/* Área de Pagamento Dinâmico */}
          <div style={styles.actions}>
            <p style={styles.label}>Quanto deseja pagar?</p>
            <input 
              type="number" 
              placeholder="0,00" 
              value={paymentValue}
              onChange={(e) => setPaymentValue(e.target.value)}
              style={styles.paymentInput}
            />
            <button 
              onClick={handlePayment} 
              disabled={loading}
              style={{...styles.payButton, opacity: loading ? 0.7 : 1}}
            >
              <Send size={20} /> 
              {loading ? 'Processando...' : `Confirmar CNA$ ${paymentValue || '0,00'}`}
            </button>
          </div>
        </main>
      ) : (
        user.role === 'admin' && <AdminDashboard />
      )}
      
      <footer style={styles.footer}>
        CNA Finance by Grupo Gambarini &copy; 2026 • Logado como: <strong>{user.username}</strong>
      </footer>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '450px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  nav: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' },
  tab: { backgroundColor: 'transparent', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  logo: { color: 'var(--primary)', margin: 0, fontSize: '24px', fontWeight: '900' },
  logoutBtn: { background: 'none', border: 'none', color: 'var(--neutral)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  headerInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  welcome: { color: '#f8fafc', fontSize: '18px', fontWeight: '500' },
  badge: { backgroundColor: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#cbd5e1' },
  balanceCard: { backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '24px', borderLeft: '6px solid var(--secondary)', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' },
  label: { color: 'var(--neutral)', fontSize: '13px', marginBottom: '8px' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  balanceValue: { fontSize: '36px', margin: 0, fontWeight: '800', color: 'white' },
  actions: { marginTop: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px' },
  paymentInput: { 
    width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', 
    backgroundColor: '#0f172a', color: 'white', fontSize: '22px', fontWeight: '700', 
    textAlign: 'center', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' 
  },
  payButton: { width: '100%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  footer: { marginTop: 'auto', padding: '20px 0', textAlign: 'center', fontSize: '11px', color: 'var(--neutral)' }
};

export default App;
