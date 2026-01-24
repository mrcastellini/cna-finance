import React, { useState } from 'react';
import axios from 'axios';
import { Search, Plus, Minus, UserCheck, XCircle } from 'lucide-react';

const API_BASE = "http://127.0.0.1:5000/api";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca usuários por nome (Correspondência Parcial)
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/search-users?name=${searchTerm}`);
      setSearchResults(response.data);
      setSelectedUser(null); // Reseta seleção ao buscar novamente
      if (response.data.length === 0) alert("Nenhum usuário encontrado.");
    } catch (error) {
      alert("Erro ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  };

  // Atualiza saldo do usuário selecionado
  const updateBalance = async (type) => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      alert("Selecione um usuário e insira um valor válido.");
      return;
    }

    const value = type === 'add' ? parseFloat(amount) : -parseFloat(amount);
    
    try {
      const response = await axios.post(`${API_BASE}/admin/update-balance`, {
        user_id: selectedUser.id,
        amount: value
      });
      
      // Atualiza o estado local para refletir o novo saldo imediatamente
      setSelectedUser({ ...selectedUser, balance: response.data.new_balance });
      setAmount('');
      alert(`Sucesso! Novo saldo de ${selectedUser.username}: CNA$ ${response.data.new_balance.toFixed(2)}`);
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao atualizar saldo.");
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Painel de Controle Admin</h3>
      
      {/* Barra de Busca */}
      <div style={styles.searchBox}>
        <input 
          placeholder="Digite o nome do usuário..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.searchBtn} disabled={loading}>
          <Search size={18}/>
        </button>
      </div>

      {/* Lista de Resultados (Aparece apenas se houver busca e nenhum selecionado) */}
      {searchResults.length > 0 && !selectedUser && (
        <div style={styles.resultsList}>
          <p style={styles.helperText}>Resultados encontrados:</p>
          {searchResults.map(u => (
            <div key={u.id} onClick={() => setSelectedUser(u)} style={styles.resultItem}>
              <div>
                <span style={styles.resName}>{u.username}</span>
                <span style={styles.resId}> (ID: {u.id})</span>
              </div>
              <UserCheck size={18} color="var(--secondary)"/>
            </div>
          ))}
        </div>
      )}

      {/* Painel de Ajuste (Só aparece quando um usuário é clicado) */}
      {selectedUser && (
        <div style={styles.controlCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.userName}>{selectedUser.username}</h4>
            <button onClick={() => setSelectedUser(null)} style={styles.closeBtn}>
              <XCircle size={20} />
            </button>
          </div>
          
          <div style={styles.balanceInfo}>
            <span style={styles.label}>Saldo Atual:</span>
            <span style={styles.value}>CNA$ {selectedUser.balance.toFixed(2)}</span>
          </div>

          <div style={styles.actionGroup}>
            <input 
              type="number" 
              placeholder="0,00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              style={styles.amountInput}
            />
            <div style={styles.btnRow}>
              <button onClick={() => updateBalance('add')} style={styles.addBtn}>
                <Plus size={16}/> Adicionar
              </button>
              <button onClick={() => updateBalance('remove')} style={styles.remBtn}>
                <Minus size={16}/> Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  title: { color: 'var(--secondary)', marginBottom: '20px', fontSize: '18px' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', outline: 'none' },
  searchBtn: { backgroundColor: 'var(--secondary)', border: 'none', borderRadius: '12px', padding: '0 15px', color: 'white', cursor: 'pointer' },
  helperText: { fontSize: '12px', color: 'var(--neutral)', marginBottom: '10px' },
  resultsList: { backgroundColor: '#0f172a', borderRadius: '12px', overflow: 'hidden' },
  resultItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #1e293b', cursor: 'pointer', transition: '0.2s', ':hover': { backgroundColor: '#1e293b' } },
  resName: { color: 'white', fontWeight: 'bold' },
  resId: { color: 'var(--neutral)', fontSize: '12px' },
  controlCard: { padding: '20px', borderRadius: '16px', border: '1px solid var(--secondary)', backgroundColor: '#1e293b', marginTop: '10px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  userName: { color: 'white', margin: 0, fontSize: '20px' },
  closeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
  balanceInfo: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  label: { color: 'var(--neutral)', fontSize: '12px' },
  value: { color: '#22c55e', fontSize: '24px', fontWeight: '800' },
  amountInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginBottom: '15px', fontSize: '18px', textAlign: 'center', boxSizing: 'border-box' },
  btnRow: { display: 'flex', gap: '10px' },
  addBtn: { flex: 1, padding: '12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' },
  remBtn: { flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontWeight: 'bold' }
};

export default AdminDashboard;