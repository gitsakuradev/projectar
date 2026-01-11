import { useState, useRef, useEffect } from 'react'

// Типы сообщений
interface Message {
  id: string
  role: 'user' | 'assistant'
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

// Доступные модели OpenRouter (бесплатные, работают без VPN)
const MODELS = [
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B' }
]

type SubjectKey = keyof typeof SUBJECTS

function AIChat() {
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('general')
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Привет! Я твой AI-репетитор на базе OpenRouter. Выбери предмет и модель сверху, затем задай любой вопрос! 🚀', timestamp: Date.now() }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiInput, setShowApiInput] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!apiKey) {
      alert('⚠️ Введите API ключ OpenRouter!\n\n1. Зайдите на https://openrouter.ai/keys\n2. Создайте бесплатный аккаунт\n3. Скопируйте ключ и вставьте в поле выше')
      return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsLoading(true)

    try {
      const systemPrompt = `${SUBJECTS[activeSubject].prompt}\n\nОтвечай на русском языке. Используй эмодзи для наглядности. Форматируй ответ красиво. Отвечай кратко и понятно для школьника.`

      // Формируем историю для API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter(m => m.id !== '1')
          .map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: userMsg.text }
      ]

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/yourusername/ai-tutor',
          'X-Title': 'AI School Tutor',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || 'Ошибка: пустой ответ'

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: aiResponse,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error: any) {
      console.error('OpenRouter Error:', error)
      
      let errorText = 'Произошла ошибка связи с OpenRouter.'
      if (error.message.includes('401')) errorText = '❌ Неверный API ключ! Проверьте ключ на openrouter.ai/keys'
      if (error.message.includes('402')) errorText = '💳 Недостаточно кредитов. Пополните баланс на openrouter.ai'
      if (error.message.includes('429')) errorText = '⏳ Превышен лимит запросов. Подождите немного.'
      if (error.message.includes('fetch')) errorText = '🌐 Проблема с интернетом. Проверьте соединение.'

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `⚠️ ${errorText}\n\n(Техническая ошибка: ${error.message})`,
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
        padding: '12px 16px', background: 'rgba(30, 41, 59, 0.95)', 
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        {/* API Key Input */}
        {showApiInput && (
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Вставьте OpenRouter API ключ (https://openrouter.ai/keys)"
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 14px', borderRadius: '12px', color: 'white', fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => setShowApiInput(false)}
              style={{
                padding: '10px 16px', background: apiKey ? '#22c55e' : '#475569',
                border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 500
              }}
            >
              {apiKey ? '✓ Сохранить' : 'Скрыть'}
            </button>
          </div>
        )}

        {!showApiInput && (
          <button
            onClick={() => setShowApiInput(true)}
            style={{
              marginBottom: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white',
              cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            🔑 Изменить API ключ
          </button>
        )}

        {/* Выбор модели */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              style={{
                background: selectedModel === model.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                border: selectedModel === model.id ? '1px solid white' : '1px solid transparent',
                color: 'white', padding: '6px 12px', borderRadius: '16px',
                whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
              }}
            >
              🤖 {model.name}
            </button>
          ))}
        </div>

        {/* Выбор предмета */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {(Object.keys(SUBJECTS) as SubjectKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSubject(key)}
              style={{
                background: activeSubject === key ? SUBJECTS[key].color : 'rgba(255,255,255,0.05)',
                border: activeSubject === key ? '1px solid white' : '1px solid transparent',
                color: 'white', padding: '8px 16px', borderRadius: '20px',
                whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
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
              lineHeight: '1.6',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-wrap',
              border: msg.role === 'assistant' ? `1px solid ${SUBJECTS[activeSubject].color}40` : 'none'
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
