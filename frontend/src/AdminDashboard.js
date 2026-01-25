import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, RefreshCw, AlertCircle, Database, ShieldCheck, Plus, Minus, Search } from 'lucide-react';

const API_BASE = "https://cna-finance-api.onrender.com/api";
// ESSENCIAL: Mesma chave que você colocou no app.py
const ADMIN_SECRET_KEY = "CNA_KEY_2026_SEGURA";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [amounts, setAmounts] = useState({});

  // Configuração padrão dos headers para não precisar repetir toda vez
  const adminConfig = {
    headers: { 'X-Admin-Token': ADMIN_SECRET_KEY }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/admin/users`, adminConfig);
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    } catch (err) {
      setError('Acesso negado ou erro no servidor. Verifique a chave de Admin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (userId, value) => {
    setAmounts({ ...amounts, [userId]: value });
  };

  const handleUpdateBalance = async (userId, type) => {
    const value = parseFloat(amounts[userId]);
    if (!value || value <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const finalAmount = type === 'add' ? value : -value;

    try {
      // Enviando a chave secreta no POST também
      await axios.post(`${API_BASE}/admin/update-balance`, {
        user_id: userId,
        amount: finalAmount
      }, adminConfig);
      
      handleInputChange(userId, ''); // Limpa o campo
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      alert("Erro ao atualizar saldo. Verifique as permissões.");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleGroup}>
          <ShieldCheck color="#E50136" size={24} />
          <h2 style={styles.title}>Painel Administrativo</h2>
        </div>
        <button onClick={fetchUsers} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Atualizando...' : 'Sincronizar'}
        </button>
      </header>

      <div style={styles.searchContainer}>
        <Search size={18} color="#94a3b8" style={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Buscar investidor..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <Users size={20} color="#94a3b8" />
          <div>
            <p style={styles.statLabel}>Contas</p>
            <p style={styles.statValue}>{users.length}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <Database size={20} color="#94a3b8" />
          <div>
            <p style={styles.statLabel}>Liquidez Total</p>
            <p style={styles.statValue}>
              CNA$ {users.reduce((acc, u) => acc + (u.balance || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Patrimônio</th>
              <th style={{...styles.th, textAlign: 'center'}}>Ajuste Manual</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{fontWeight: 'bold', color: 'white'}}>{u.username}</div>
                  <div style={{fontSize: '10px', color: '#64748b'}}>{u.role.toUpperCase()}</div>
                </td>
                <td style={{...styles.td, color: '#10b981', fontWeight: '800'}}>
                  CNA$ {(u.balance || 0).toFixed(2)}
                </td>
                <td style={{...styles.td, textAlign: 'center'}}>
                  <div style={styles.actionGroup}>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={amounts[u.id] || ''}
                      onChange={(e) => handleInputChange(u.id, e.target.value)}
                      style={styles.inputAmount}
                    />
                    <button onClick={() => handleUpdateBalance(u.id, 'rem')} style={styles.btnMinus}><Minus size={14} /></button>
                    <button onClick={() => handleUpdateBalance(u.id, 'add')} style={styles.btnPlus}><Plus size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { marginTop: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '18px', margin: 0, color: 'white', fontWeight: '800' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  searchContainer: { position: 'relative', marginBottom: '20px', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '15px' },
  searchInput: { width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px 12px 12px 45px', borderRadius: '12px', outline: 'none' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  statCard: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #334155' },
  statLabel: { color: '#94a3b8', fontSize: '10px', margin: 0, textTransform: 'uppercase' },
  statValue: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  errorBox: { backgroundColor: 'rgba(229, 1, 54, 0.1)', color: '#E50136', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', border: '1px solid #E50136' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '11px' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '15px' },
  actionGroup: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  inputAmount: { width: '60px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', padding: '6px', borderRadius: '6px', textAlign: 'center' },
  btnPlus: { backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' },
  btnMinus: { backgroundColor: '#E50136', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }
};

export default AdminDashboard;