import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, RefreshCw, AlertCircle, Database } from 'lucide-react';

const API_BASE = "https://cna-finance-api.onrender.com/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para buscar todos os usuários do banco
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/admin/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar lista de usuários. Verifique o servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleGroup}>
          <ShieldCheck color="#E50136" size={24} />
          <h2 style={styles.title}>Painel Administrativo</h2>
        </div>
        <button onClick={fetchUsers} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </header>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <Users size={20} color="#94a3b8" />
          <div>
            <p style={styles.statLabel}>Total de Usuários</p>
            <p style={styles.statValue}>{users.length}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <Database size={20} color="#94a3b8" />
          <div>
            <p style={styles.statLabel}>Volume Total</p>
            <p style={styles.statValue}>
              CNA$ {users.reduce((acc, u) => acc + (u.balance || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Papel</th>
              <th style={styles.th}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>#{u.id}</td>
                <td style={{...styles.td, fontWeight: 'bold'}}>{u.username}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge, 
                    backgroundColor: u.role === 'admin' ? '#E50136' : '#334155'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{...styles.td, color: '#10b981', fontWeight: 'bold'}}>
                  CNA$ {u.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p style={styles.emptyMsg}>Nenhum usuário cadastrado no sistema.</p>
        )}
      </div>
    </div>
  );
}

// Ícone importado localmente para o exemplo
const ShieldCheck = ({color, size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const styles = {
  container: { marginTop: '10px', animation: 'fadeIn 0.5s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '18px', margin: 0, color: 'white' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  errorBox: { backgroundColor: 'rgba(229, 1, 54, 0.1)', color: '#E50136', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', border: '1px solid #E50136' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  statCard: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px' },
  statLabel: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  statValue: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#334155', color: '#cbd5e1', fontWeight: '600' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '15px', color: '#f8fafc' },
  badge: { padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  emptyMsg: { textAlign: 'center', padding: '30px', color: '#475569' }
};

export default AdminDashboard;