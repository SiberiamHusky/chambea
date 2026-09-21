import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import chatService from '../services/chatService';
import type { ChatMessage, ChatConversation } from '../services/chatService';
import employerService from '../services/employerService';
import workerService from '../services/workerService';

const InterviewMessagePage: React.FC = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userType = searchParams.get('type') as ('worker' | 'employer' | null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const canSend = Boolean(user?.id) && Boolean(userId) && content.trim().length > 0;
  const [displayName, setDisplayName] = useState<string>('');
  const [displayLabel, setDisplayLabel] = useState<string>('');
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id || !userId) return;
      try {
        const history = await chatService.getMessages(user.id, userId);
        setMessages(history);
      } catch (e) {
        console.error('Error cargando mensajes', e);
      }
    };
    load();
  }, [user?.id, userId]);

  // Cargar metadatos de la conversación para mostrar nombre en vez de UUID
  useEffect(() => {
    const loadMeta = async () => {
      if (!userId) return;
      try {
        const convs: ChatConversation[] = await chatService.getConversations();
        const target = convs.find((c) => c.otherUserId === userId);
        if (target) {
          // Si el otro usuario es employer, intentar mostrar nombre de la empresa
          if (target.otherUserType === 'employer') {
            try {
              const emp = await employerService.getEmployerByUserId(userId);
              const companyName = emp?.company?.company_name;
              setDisplayName(companyName || target.otherUserName || target.otherUserEmail || userId);
              setDisplayLabel('Empresa');
            } catch {
              setDisplayName(target.otherUserName || target.otherUserEmail || userId);
              setDisplayLabel('Employer');
            }
          } else if (target.otherUserType === 'worker') {
            try {
              const worker = await workerService.getWorkerByUserId(userId);
              const fullName = [worker?.user?.first_name, worker?.user?.last_name]
                .filter(Boolean)
                .join(' ');
              setDisplayName(fullName || worker?.user?.email || target.otherUserName || target.otherUserEmail || userId);
              setDisplayLabel('Trabajador');
            } catch {
              setDisplayName(target.otherUserName || target.otherUserEmail || userId);
              setDisplayLabel('Trabajador');
            }
          } else {
            // Tipo desconocido: intentar employer y luego worker
            try {
              const emp = await employerService.getEmployerByUserId(userId);
              const companyName = emp?.company?.company_name;
              if (companyName) {
                setDisplayName(companyName);
                setDisplayLabel('Empresa');
                return;
              }
            } catch {}
            try {
              const worker = await workerService.getWorkerByUserId(userId);
              const fullName = [worker?.user?.first_name, worker?.user?.last_name].filter(Boolean).join(' ');
              if (fullName || worker?.user?.email) {
                setDisplayName(fullName || worker?.user?.email || userId);
                setDisplayLabel('Trabajador');
                return;
              }
            } catch {}
            setDisplayName(target.otherUserName || target.otherUserEmail || userId);
            setDisplayLabel('Usuario');
          }
        } else {
          // Sin conversación previa: usar el parámetro ?type para resolver nombre
          if (userType === 'employer') {
            try {
              const emp = await employerService.getEmployerByUserId(userId);
              const companyName = emp?.company?.company_name;
              setDisplayName(companyName || userId);
              setDisplayLabel('Empresa');
              return;
            } catch {}
          }
          if (userType === 'worker') {
            try {
              const worker = await workerService.getWorkerByUserId(userId);
              const fullName = [worker?.user?.first_name, worker?.user?.last_name]
                .filter(Boolean)
                .join(' ');
              setDisplayName(fullName || worker?.user?.email || userId);
              setDisplayLabel('Trabajador');
              return;
            } catch {}
          }
          setDisplayName(userId);
          setDisplayLabel('Usuario');
        }
      } catch (e) {
        console.error('Error cargando conversaciones', e);
        setDisplayName(userId);
        setDisplayLabel('Usuario');
      }
    };
    loadMeta();
  }, [userId, userType]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    try {
      const msg = await chatService.sendMessage({ senderId: user!.id, receiverId: userId!, content: content.trim() });
      setMessages((prev) => [...prev, msg]);
      setContent('');
    } catch (e) {
      console.error('Error enviando mensaje', e);
    }
  };

  // Auto-scroll al último mensaje
  useEffect(() => {
    const el = threadRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="login-page">
      <div className="login-page-container" style={{ maxWidth: 960, margin: '0 auto', gridTemplateColumns: '1fr' }}>

        <div className="login-form" style={{ gridColumn: '1 / -1', maxWidth: 900, margin: '16px auto', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          <div className="form-section" style={{ marginBottom: 12 }}>
            <h3 style={{ marginBottom: 6 }}>Mensajes</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                ref={threadRef}
                className="chat-thread"
                style={{
                  width: 720,
                  maxWidth: '100%',
                  height: 560,
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 16,
                  background: '#f8fafc',
                }}
              >
              {/* Encabezado dentro del cuadro de chat con flecha de regreso, avatar, nombre y rol */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#ffffff',
                  padding: '10px 16px',
                  margin: '0 -16px 12px -16px',
                  borderBottom: '1px solid #e5e7eb',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link
                    to="/chat"
                    aria-label="Volver a chats"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#0f172a',
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
                      fontSize: 18,
                    }}
                    title="Volver a chats"
                  >
                    ←
                  </Link>
                  {/* Avatar con inicial del nombre */}
                  <div
                    aria-hidden
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {((displayName || 'U').trim()[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>{displayName || 'Usuario'}</div>
                    {displayLabel && (
                      <div className="form-hint" style={{ marginTop: 2, fontSize: 13 }}>{displayLabel}</div>
                    )}
                  </div>
                </div>
              </div>
              {messages.length === 0 ? (
                <p className="form-hint">Aún no hay mensajes.</p>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className="chat-row"
                      style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10 }}
                    >
                      <div
                        className="chat-bubble"
                        style={{
                          maxWidth: '70%',
                          background: isMine ? '#3b82f6' : '#e5e7eb',
                          color: isMine ? '#ffffff' : '#0f172a',
                          padding: '10px 14px',
                          borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6, textAlign: 'right' }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSend} noValidate style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="message" className="sr-only">Mensaje</label>
              <textarea
                id="message"
                className="form-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Enviar mensaje"
              title="Enviar"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid #e5e7eb',
                background: 'var(--brand)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(15,23,42,0.06)',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewMessagePage;