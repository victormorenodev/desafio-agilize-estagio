import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensagem, setMensagem] = useState(null) // para o popup
  
  const [contaSelecionada, setContaSelecionada] = useState('')
  const [valorSaque, setValorSaque] = useState('')

  // busca contas
  const carregarContas = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/contas/list/')
      if (response.ok) {
        const data = await response.json()
        setContas(data)
      }
    } catch (error) {
      exibirPopup('error', 'erro ao buscar contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarContas()
  }, [])

  // função utilitária para o popup sumir sozinho
  const exibirPopup = (tipo, texto) => {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem(null), 3000)
  }

  // função para sacar
  const handleSaque = async (e) => {
    e.preventDefault()
    
    if (!contaSelecionada) {
      exibirPopup('error', 'selecione uma conta clicando nela')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contas/withdraw/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: contaSelecionada,
          amount: parseFloat(valorSaque)
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        exibirPopup('success', 'saque realizado com sucesso!')
        setValorSaque('')
        carregarContas()
      } else {
        exibirPopup('error', data.error || 'erro ao realizar saque')
      }
    } catch (error) {
      exibirPopup('error', 'erro de conexão com a api')
    }
  }

  return (
    <div className="app-container">
      {/* popup flutuante */}
      {mensagem && (
        <div className={`popup ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      <header>
        <div className="brand">
          <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M17.4789 34.4762H17.4153C7.80423 34.4762 0 26.7513 0 17.2381C0 7.72484 7.80423 0 17.4153 0C27.0263 0 34.8305 7.72484 34.8305 17.2381V31.8211C34.8305 33.2865 33.6286 34.4801 32.1442 34.4801C30.8229 34.4801 29.7484 33.4165 29.7484 32.1087V17.242C29.7484 10.5099 24.2246 5.04616 17.4192 5.04616C10.6139 5.04616 5.09006 10.5099 5.09006 17.242C5.09006 23.9742 10.6139 29.4379 17.4192 29.4379H17.4869C18.6609 29.4418 19.6121 30.3872 19.6121 31.5493V32.3687C19.6121 33.5347 18.6569 34.4801 17.4789 34.4801V34.4762ZM27.2253 17.2381V31.8093C27.2253 33.2826 26.0154 34.4801 24.527 34.4801C23.1978 34.4801 22.1193 33.4126 22.1193 32.0969V17.2381C22.1193 14.6736 20.0657 12.5898 17.475 12.5898C14.8842 12.5898 12.7789 14.6736 12.7789 17.2381C12.7789 19.8025 14.8842 21.8864 17.475 21.8864H17.4948C18.6649 21.8982 19.6081 22.8397 19.6081 24.0018V24.8251C19.6081 25.9911 18.6529 26.9365 17.475 26.9365H17.4192C12.0068 26.9365 7.61718 22.5954 7.61718 17.246C7.61718 11.8965 12.0108 7.55545 17.4192 7.55545C22.8277 7.55545 27.2173 11.8925 27.2213 17.2381H27.2253Z" fill="#7537AE"></path>
          </svg>
          <h1>agilize bank</h1>
        </div>
        <p>desafio técnico - gestão de contas</p>
      </header>

      <main className="simple-panel">
        <section>
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            selecione sua conta
          </h2>
          
          {loading ? (
            <p>carregando...</p>
          ) : (
            <div className="accounts-grid">
              {contas.map(conta => (
                <div 
                  key={conta.account_number}
                  className={`account-card simple-panel ${contaSelecionada === conta.account_number ? 'selected' : ''}`}
                  onClick={() => setContaSelecionada(conta.account_number)}
                >
                  <h3>{conta.account_type}</h3>
                  <p>{conta.account_number}</p>
                  <p className="balance">
                    R$ {parseFloat(conta.balance).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="actions-panel">
          <h2 style={{ marginBottom: '8px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            realizar saque
          </h2>
          
          <form onSubmit={handleSaque} className="input-group">
            <div className="input-group">
              <label>valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                placeholder="ex: 50.00"
                value={valorSaque}
                onChange={(e) => setValorSaque(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              sacar
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
