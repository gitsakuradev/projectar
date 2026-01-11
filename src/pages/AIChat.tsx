import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Типы сообщений
interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: number
}

// Конфигурация предметов
const SUBJECTS = {
  geometry: { name: 'Геометрия', emoji: '📐', color: '#667eea', prompt: 'Ты учитель геометрии. Объясняй теоремы, фигуры и формулы. Используй наглядные примеры.' },
  biology: { name: 'Биология', emoji: '🧬', color: '#22c55e', prompt: 'Ты учитель биологии. Рассказывай о живых организмах, клетках и эволюции. Будь увлекательным.' },
  chemistry: { name: 'Химия', emoji: '⚗️', color: '#f59e0b', prompt: 'Ты учитель химии. Объясняй реакции, элементы и молекулы. Предупреждай о безопасности.' },
  physics: { name: 'Физика', emoji: '⚡', color: '#ec4899', prompt: 'Ты учитель физики. Объясняй законы природы, электричество и механику. Приводи примеры из жизни.' },
  general: { name: 'Общий', emoji: '🎓', color: '#6366f1', prompt: 'Ты эрудированный помощник в учебе. Отвечай на любые школьные вопросы.' }
}

type SubjectKey = keyof typeof SUBJECTS

function AIChat() {
  // Состояния
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('general')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Привет! Я твой AI-репетитор. Выбери предмет сверху, и задай мне любой вопрос!', timestamp: Date.now() }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Инициализация Gemini
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const genAI = new GoogleGenerativeAI(apiKey || '')

  // Авто-скролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Отправка сообщения
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!apiKey) {
      alert('ОШИБКА: Не найден API ключ! Создайте файл .env с переменной VITE_GEMINI_API_KEY')
      return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: Date.now()
    }

    // Добавляем сообщение пользователя в UI
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      // ИСПРАВЛЕНИЕ: Используем 'gemini-pro' вместо 'gemini-1.5-flash', так как она стабильнее
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      
      const systemPrompt = `
        ${SUBJECTS[activeSubject].prompt}
        Отвечай на русском языке. Используй эмодзи.
        Форматируй ответ красиво (используй списки, жирный шрифт).
        Отвечай кратко и понятно для школьника.
      `

      // Фильтруем историю (убираем приветствие модели, так как Google требует начинать с user)
      const apiHistory = messages
        .filter(m => m.id !== '1') 
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))

      const chat = model.startChat({
        history: apiHistory
      })

      const result = await chat.sendMessage(systemPrompt + "\nВопрос студента: " + userMsg.text)
      const response = result.response.text()

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error: any) {
      console.error("AI Error:", error)
      
      let errorText = 'Произошла ошибка связи.'
      if (error.message && error.message.includes('404')) errorText = 'Модель временно недоступна (попробуйте VPN).'
      if (error.message && error.message.includes('fetch')) errorText = 'Нет интернета или Google заблокирован (включи VPN).'
      if (!apiKey) errorText = 'Отсутствует API ключ.'

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `⚠️ ${errorText}\n(Техническая ошибка: ${error.message.slice(0, 50)}...)`,
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', 
      background: '#0f172a', color: 'white', overflow: 'hidden' 
    }}>
      
      {/* Шапка */}
      <div style={{ 
        padding: '16px', background: 'rgba(30, 41, 59, 0.8)', 
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none', fontSize: '1.2rem', padding: '8px', 
          background: 'rgba(255,255,255,0.1)', borderRadius: '12px' 
        }}>🏠</Link>
        <div style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {(Object.keys(SUBJECTS) as SubjectKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSubject(key)}
              style={{
                background: activeSubject === key ? SUBJECTS[key].color : 'rgba(255,255,255,0.05)',
                border: activeSubject === key ? '1px solid white' : '1px solid transparent',
                color: 'white', padding: '8px 16px', borderRadius: '20px',
                whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '0.9rem', fontWeight: 500
              }}
            >
              {SUBJECTS[key].emoji} {SUBJECTS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Список сообщений */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ 
              fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px',
              textAlign: msg.role === 'user' ? 'right' : 'left',
              marginLeft: '12px', marginRight: '12px'
            }}>
              {msg.role === 'user' ? 'Вы' : `🤖 AI ${SUBJECTS[activeSubject].name}`}
            </div>
            <div style={{
              background: msg.role === 'user' ? '#3b82f6' : '#1e293b',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              lineHeight: '1.5',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-wrap',
              border: msg.role === 'model' ? `1px solid ${SUBJECTS[activeSubject].color}40` : 'none'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', background: '#1e293b', padding: '12px 20px', borderRadius: '20px', display: 'flex', gap: '6px' }}>
            <span style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0s' }}></span>
            <span style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></span>
            <span style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div style={{ padding: '16px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ 
          display: 'flex', gap: '10px', maxWidth: '800px', margin: '0 auto',
          background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Спроси что-нибудь про ${SUBJECTS[activeSubject].name.toLowerCase()}...`}
            style={{
              flex: 1, background: 'transparent', border: 'none', padding: '12px 16px',
              color: 'white', fontSize: '1rem', outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            style={{
              width: '46px', height: '46px', borderRadius: '50%', border: 'none',
              background: inputValue.trim() ? SUBJECTS[activeSubject].color : '#475569',
              color: 'white', fontSize: '1.2rem', cursor: inputValue.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  )
}

export default AIChat
