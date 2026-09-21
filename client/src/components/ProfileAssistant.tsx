import React, { useState } from 'react';

// URL del API del bot Python
const AI_BOT_API_URL = "http://localhost:8001";

type ProfileAssistantProps = {
  currentProfile: {
    employer_type?: string;
    bio?: string;
    years_as_employer?: number | string;
    company_name?: string;
    company_description?: string;
    company_industry?: string;
    // Campos para workers
    years_of_experience?: number | string;
    skills?: string;
    rate_type?: string;
    rate_amount?: number | string;
    rate_currency?: string;
  };
  userRole: 'worker' | 'employer';
  onSuggestion: (field: string, suggestion: string) => void;
};

const ProfileAssistant: React.FC<ProfileAssistantProps> = ({ currentProfile, userRole, onSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [currentSuggestionType, setCurrentSuggestionType] = useState<string>('');

  // Llamar al API para generar sugerencias personalizadas
  const generateSuggestions = async (type: string) => {
    setLoading(true);
    setCurrentSuggestionType(type);
    
    try {
      const response = await fetch(`${AI_BOT_API_URL}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          context: { ...currentProfile, userRole }
        })
      });
      
      const data = await response.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error al generar sugerencias:', error);
      // Fallback en caso de error
      setSuggestions([
        "Lo siento, no pude generar sugerencias en este momento. Por favor, intenta nuevamente más tarde."
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje al chatbot
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    const newChat = [...chat, { role: 'user', content: userMessage }];
    setChat(newChat);
    setUserMessage('');
    setLoading(true);
    
    try {
      const response = await fetch(`${AI_BOT_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newChat,
          context: { ...currentProfile, userRole }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        setChat([...newChat, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Error en el chat:', error);
      setChat([
        ...newChat, 
        { 
          role: 'assistant', 
          content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta nuevamente.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[30rem] max-w-[calc(100vw-1.5rem)] mb-4 overflow-hidden">
          <div className="bg-primary text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Asistente de Perfil
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-primaryDark rounded-full"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {/* Indicador de estado del bot */}
            <p className="text-sm text-green-200 mt-1">• Asistente IA activo • Rol: {userRole === 'worker' ? 'Trabajador' : 'Empleador'}</p>
          </div>
          
          <div className="p-5 min-h-[24rem] max-h-[36rem] overflow-y-auto">
            {chat.length === 0 ? (
              <div className="space-y-3">
                <p className="text-base leading-7 text-gray-600">
                  {userRole === 'worker' 
                    ? "¡Hola! Soy tu asistente para mejorar tu perfil de trabajador. ¿En qué puedo ayudarte?"
                    : "¡Hola! Soy tu asistente para mejorar el perfil de empleador. ¿En qué puedo ayudarte?"
                  }
                </p>
                <div className="space-y-2">
                  {userRole === 'worker' ? (
                    <>
                      <button 
                        onClick={() => generateSuggestions('bio')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'bio' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Generar sugerencias para mi bio'}
                      </button>
                      <button 
                        onClick={() => generateSuggestions('skills')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'skills' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Ayúdame a describir mis habilidades'}
                      </button>
                      <button 
                        onClick={() => generateSuggestions('general')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'general' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Consejos para mejorar mi perfil'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => generateSuggestions('bio')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'bio' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Generar sugerencias para mi bio'}
                      </button>
                      <button 
                        onClick={() => generateSuggestions('company_description')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'company_description' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Ayúdame con la descripción de la empresa'}
                      </button>
                      <button 
                        onClick={() => generateSuggestions('general')} 
                        disabled={loading}
                        className={`w-full text-left p-4 rounded-lg text-sm leading-7 transition-all ${loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                      >
                        {loading && currentSuggestionType === 'general' ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Generando...
                          </span>
                        ) : 'Consejos para mejorar mi perfil'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[92%] px-4 py-4 rounded-2xl ${
                      msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 rounded-tl-sm'
                    }`}>
                      <p className="text-[15px] leading-7 whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-[15px] leading-7 text-gray-700 mb-2">{s}</p>
                      <button 
                        onClick={() => {
                          const field = currentSuggestionType === 'bio' ? 'bio' : 
                                        currentSuggestionType === 'company_description' ? 'company_description' : 
                                        currentSuggestionType === 'skills' ? 'skills' :
                                        'bio';
                          onSuggestion(field, s);
                        }} 
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Usar esta sugerencia
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 border border-gray-200 rounded-full px-5 py-3 text-base focus:outline-none focus:border-primary disabled:bg-gray-100"
              />
              <button 
                onClick={handleSendMessage}
                disabled={loading || !userMessage.trim()}
                className="bg-primary text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primaryDark"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primaryDark transition-colors"
      >
        {isOpen ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ProfileAssistant;
