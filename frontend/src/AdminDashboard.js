import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, RefreshCw, AlertCircle, Database, ShieldCheck } from 'lucide-react';

const API_BASE = "https://cna-finance-api.onrender.com/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Usando useCallback para evitar loops de renderização
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/admin/users`);
      // Garante que o que recebemos é um array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setError('O servidor retornou um formato de dado inválido.');
      }
    } catch (err) {
      console.error("Erro na API Admin:", err);
      setError('Não foi possível conectar à API. Verifique se a rota /api/admin/users existe no app.py');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleGroup}>
          <ShieldCheck color="#E50136" size={24} />
          <h2 style={styles.title}>Painel Administrativo</h2>
        </div>
        <button onClick={fetchUsers} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Sincronizando...' : 'Atualizar Dados'}
        </button>
      </header>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={20} />
          <p style={{ margin: 0 }}>{error}</p>
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
            <p style={styles.statLabel}>Capital em Giro</p>
            <p style={styles.statValue}>
              CNA$ {users.reduce((acc, u) => acc + (u.balance || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuário</th>
                <th style={styles.th}>Papel</th>
                <th style={styles.th}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={{...styles.td, fontWeight: 'bold'}}>{u.username}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge, 
                      backgroundColor: u.role === 'admin' ? '#E50136' : '#334155'
                    }}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  <td style={{...styles.td, color: '#10b981', fontWeight: 'bold'}}>
                    CNA$ {(u.balance || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && !error && (
          <p style={styles.emptyMsg}>Nenhum usuário encontrado no banco SQLAlchemy.</p>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: { marginTop: '10px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '18px', margin: 0, color: 'white', fontWeight: '800' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' },
  errorBox: { backgroundColor: 'rgba(229, 1, 54, 0.1)', color: '#E50136', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', border: '1px solid #E50136', fontSize: '13px' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  statCard: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #334155' },
  statLabel: { color: '#94a3b8', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: 'white', fontSize: '16px', fontWeight: 'bold', margin: 0 },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '15px', backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #334155', transition: 'background 0.2s' },
  td: { padding: '15px', color: '#f8fafc' },
  badge: { padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '900', color: 'white' },
  emptyMsg: { textAlign: 'center', padding: '30px', color: '#475569', fontSize: '14px' }
};

export default AdminDashboard;