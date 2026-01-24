import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Wallet, Send, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import Login from './Login';

const API_BASE = "https://cna-finance-api.onrender.com/api"; 

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('user');
  const [paymentValue, setPaymentValue] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Função de atualização com "Escudo de Segurança"
  const refreshUserData = useCallback(async () => {
    // Se o usuário deslogou, encerra a função NA HORA para não travar o React
    if (!user || !user.id) return; 

    try {
      const response = await axios.get(`${API_BASE}/user/${user.id}`);
      // Só atualiza se o usuário ainda estiver logado no momento que a resposta chegar
      if (user && user.id) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Erro ao sincronizar saldo.");
    }
  }, [user]);

  // Atualiza saldo quando muda para a aba do usuário
  useEffect(() => {
    if (user && activeTab === 'user') {
      refreshUserData();
    }
  }, [activeTab, refreshUserData]);

  // 2. Logout Blindado (Limpa o estado e força o recarregamento)
  const handleLogout = () => {
    setUser(null);
    setActiveTab('user');
    
    // Pequeno delay para o React processar o 'null' antes do refresh
    setTimeout(() => {
      window.location.reload();
    }, 10);
  };

  const handlePayment = async () => {
    const valueToPay = parseFloat(paymentValue);
    if (isNaN(valueToPay) || valueToPay <= 0) {
      alert("Valor inválido.");
      return;
    }
    if (valueToPay > user.balance) {
      alert("Saldo insuficiente.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/user/pay`, { 
        user_id: user.id, 
        value: valueToPay 
      });
      await refreshUserData(); 
      setPaymentValue('');
      alert(`CNA$ ${valueToPay.toFixed(2)} pagos com sucesso!`);
    } catch (error) {
      alert("Erro na transação");
    } finally {
      setLoading(false);
    }
  };

  // 3. Renderização Condicional (Login sempre em primeiro lugar)
  if (!user) {
    return <Login onLogin={(userData) => {
      setUser(userData);
      setActiveTab('user');
    }} />;
  }

  return (
    <div style={styles.container}>
      {/* Navegação Admin */}
      {user.role === 'admin' && (
        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab('user')} 
            style={{...styles.tab, borderBottom: activeTab === 'user' ? '3px solid #E50136' : 'none'}}
          >
            <UserIcon size={18} /> Minha Conta
          </button>
          <button 
            onClick={() => setActiveTab('admin')} 
            style={{...styles.tab, borderBottom: activeTab === 'admin' ? '3px solid #E50136' : 'none'}}
          >
            <ShieldCheck size={18} /> Painel Admin
          </button>
        </nav>
      )}

      {/* Header com o "C" Vermelho */}
      <div style={styles.topBar}>
        <div style={styles.logoContainer}>
          <div style={styles.iconC}>C</div>
          <h1 style={styles.logoText}>NA <span style={{color: '#E50136'}}>Finance</span></h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Sair
        </button>
      </div>

      {activeTab === 'user' ? (
        <main style={styles.mainContent}>
          <div style={styles.headerInfo}>
            <span style={styles.welcome}>Olá, {user.username}</span>
            <span style={styles.badge}>{user.role.toUpperCase()}</span>
          </div>

          <div style={styles.balanceCard}>
            <p style={styles.label}>Saldo disponível</p>
            <div style={styles.balanceRow}>
              <Wallet color="#E50136" size={32} />
              <h2 style={styles.balanceValue}>CNA$ {(user.balance || 0).toFixed(2)}</h2>
            </div>
          </div>

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
        <AdminDashboard />
      )}
      
      <footer style={styles.footer}>
        CNA Finance by Grupo Gambarini &copy; 2026 • Logado como: <strong>{user.username}</strong>
      </footer>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '450px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', color: 'white' },
  nav: { display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' },
  tab: { backgroundColor: 'transparent', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  iconC: { backgroundColor: '#0f172a', color: '#E50136', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', border: '2px solid #E50136' },
  logoText: { color: 'white', margin: 0, fontSize: '20px', fontWeight: '800' },
  logoutBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  headerInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  welcome: { color: '#f8fafc', fontSize: '18px', fontWeight: '500' },
  badge: { backgroundColor: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', color: '#cbd5e1' },
  balanceCard: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '24px', borderLeft: '6px solid #E50136', boxShadow: '0 10px 15px rgba(0,0,0,0.3)' },
  label: { color: '#94a3b8', fontSize: '13px', marginBottom: '8px' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  balanceValue: { fontSize: '36px', margin: 0, fontWeight: '800', color: 'white' },
  actions: { marginTop: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px' },
  paymentInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' },
  payButton: { width: '100%', backgroundColor: '#E50136', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  footer: { marginTop: 'auto', padding: '20px 0', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }
};

export default App;
