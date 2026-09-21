import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import type { ChatMessage, ChatConversation } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import employerService from '../services/employerService';
import workerService from '../services/workerService';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [displayConversations, setDisplayConversations] = useState<{
    otherUserId: string;
    displayName: string;
    lastMessageContent: string;
    lastMessageAt: string | Date;
    otherUserType?: 'worker' | 'employer' | 'pending';
  }[]>([]);
  const [query, setQuery] = useState('');

  // Cargar conversaciones del usuario
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const list = await chatService.getConversations();
        setConversations(list);

        // Construir nombres a mostrar, sustituyendo empleadores por nombre de empresa
        const enriched = await Promise.all(
          list.map(async (c) => {
            if (c.otherUserType === 'employer') {
              try {
                const emp = await employerService.getEmployerByUserId(c.otherUserId);
                const companyName = emp?.company?.company_name;
                return {
                  otherUserId: c.otherUserId,
                  displayName: companyName || c.otherUserName || c.otherUserEmail || c.otherUserId,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              } catch {
                return {
                  otherUserId: c.otherUserId,
                  displayName: c.otherUserName || c.otherUserEmail || c.otherUserId,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              }
            }
            if (c.otherUserType === 'worker') {
              try {
                const worker = await workerService.getWorkerByUserId(c.otherUserId);
                const fullName = [worker?.user?.first_name, worker?.user?.last_name]
                  .filter(Boolean)
                  .join(' ');
                return {
                  otherUserId: c.otherUserId,
                  displayName: fullName || worker?.user?.email || c.otherUserName || c.otherUserEmail || c.otherUserId,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              } catch {
                return {
                  otherUserId: c.otherUserId,
                  displayName: c.otherUserName || c.otherUserEmail || c.otherUserId,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              }
            }
            // Tipo desconocido: intentar resolver empresa y luego trabajador
            try {
              const emp = await employerService.getEmployerByUserId(c.otherUserId);
              const companyName = emp?.company?.company_name;
              if (companyName) {
                return {
                  otherUserId: c.otherUserId,
                  displayName: companyName,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              }
            } catch {}
            try {
              const worker = await workerService.getWorkerByUserId(c.otherUserId);
              const fullName = [worker?.user?.first_name, worker?.user?.last_name].filter(Boolean).join(' ');
              if (fullName || worker?.user?.email) {
                return {
                  otherUserId: c.otherUserId,
                  displayName: fullName || worker?.user?.email || c.otherUserName || c.otherUserEmail || c.otherUserId,
                  lastMessageContent: c.lastMessageContent,
                  lastMessageAt: c.lastMessageAt,
                  otherUserType: c.otherUserType,
                };
              }
            } catch {}
            return {
              otherUserId: c.otherUserId,
              displayName: c.otherUserName || c.otherUserEmail || c.otherUserId,
              lastMessageContent: c.lastMessageContent,
              lastMessageAt: c.lastMessageAt,
              otherUserType: c.otherUserType,
            };
          })
        );
        setDisplayConversations(enriched);
      } catch (error) {
        console.error('Error loading conversations', error);
      }
    };
    loadConversations();
  }, []);

  return (
    <div className="login-page">
      <div className="login-page-container" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="login-form chat-card" style={{ maxWidth: 900, margin: '16px auto', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          {/* Encabezado sticky con búsqueda */}
          <div style={{ position: 'sticky', top: 0, background: '#ffffff', padding: '12px 16px', margin: '0 -16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Tus chats</h2>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o mensaje..."
                className="form-input"
                style={{ width: 280, height: 36 }}
              />
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="chat-list" style={{ maxHeight: 560, overflowY: 'auto', padding: 8 }}>
            {displayConversations.length === 0 ? (
              <p className="form-hint" style={{ padding: 12 }}>No tienes conversaciones aún.</p>
            ) : (
              displayConversations
                .filter((c) => {
                  if (!query.trim()) return true;
                  const q = query.toLowerCase();
                  return (
                    (c.displayName || '').toLowerCase().includes(q) ||
                    (c.lastMessageContent || '').toLowerCase().includes(q)
                  );
                })
                .map((c) => (
                  <button
                    key={c.otherUserId}
                    onClick={() => navigate(`/interviews/${c.otherUserId}?type=${c.otherUserType ?? ''}`)}
                    className="chat-item"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      background: '#fff',
                      cursor: 'pointer',
                      marginBottom: 10,
                      boxShadow: '0 4px 10px rgba(15,23,42,0.06)',
                      transition: 'background 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(15,23,42,0.06)';
                    }}
                    aria-label={`Abrir chat con ${c.displayName}`}
                  >
                    {/* Avatar con inicial */}
                    <div
                      aria-hidden
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: c.otherUserType === 'employer' ? 'var(--brand)' : c.otherUserType === 'worker' ? '#3b82f6' : '#64748b',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {(c.displayName?.trim()?.[0] || 'U').toUpperCase()}
                    </div>

                    {/* Datos de conversación */}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.displayName}</div>
                        {c.otherUserType && (
                          <span className="form-hint" style={{ fontSize: 12 }}>
                            {c.otherUserType === 'employer' ? 'Empresa' : c.otherUserType === 'worker' ? 'Trabajador' : 'Usuario'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.lastMessageContent}
                      </div>
                    </div>

                    {/* Fecha del último mensaje */}
                    {(() => {
                      const dt = new Date(c.lastMessageAt);
                      const now = new Date();
                      const sameDay = dt.toDateString() === now.toDateString();
                      const formatted = sameDay ? dt.toLocaleTimeString() : dt.toLocaleDateString();
                      const recent = (now.getTime() - dt.getTime()) < 24 * 60 * 60 * 1000;
                      return (
                        <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatted}
                          {recent && <span style={{ marginLeft: 6, color: '#10b981' }}>•</span>}
                        </div>
                      );
                    })()}
                  </button>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;