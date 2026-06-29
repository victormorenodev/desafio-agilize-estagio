import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [contas, setContas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensagem, setMensagem] = useState(null)
  
  const [abaAtiva, setAbaAtiva] = useState('saque')
  const [contaSelecionada, setContaSelecionada] = useState('')
  const [contaDestino, setContaDestino] = useState('')
  const [valorOperacao, setValorOperacao] = useState('')

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

  const exibirPopup = (tipo, texto) => {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem(null), 3500)
  }

  const alternarAba = (aba) => {
    setAbaAtiva(aba)
    setValorOperacao('')
    setContaSelecionada('')
    setContaDestino('')
  }

  const handleCardClick = (numero) => {
    if (abaAtiva === 'saque') {
      setContaSelecionada(numero)
    } else {
      // lógica de seleção de dois cliques (origem e destino)
      if (contaSelecionada === numero) {
        setContaSelecionada('')
        setContaDestino('')
      } else if (!contaSelecionada) {
        setContaSelecionada(numero)
      } else if (contaDestino === numero) {
        setContaDestino('')
      } else {
        setContaDestino(numero)
      }
    }
  }

  const handleSaque = async (e) => {
    e.preventDefault()
    if (!contaSelecionada) return exibirPopup('error', 'selecione a conta de origem')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contas/withdraw/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: contaSelecionada,
          amount: parseFloat(valorOperacao)
        })
      })
      const data = await response.json()
      
      if (response.ok) {
        exibirPopup('success', 'saque realizado com sucesso!')
        setValorOperacao('')
        carregarContas()
      } else {
        exibirPopup('error', data.error || 'erro no saque')
      }
    } catch (error) {
      exibirPopup('error', 'erro de conexão')
    }
  }

  const handleTransferencia = async (e) => {
    e.preventDefault()
    if (!contaSelecionada) return exibirPopup('error', 'selecione a conta de origem')
    if (!contaDestino) return exibirPopup('error', 'selecione a conta de destino')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contas/transfer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_account_number: contaSelecionada,
          destination_account_number: contaDestino,
          amount: parseFloat(valorOperacao)
        })
      })
      const data = await response.json()
      
      if (response.ok) {
        exibirPopup('success', 'transferência realizada!')
        setValorOperacao('')
        setContaSelecionada('')
        setContaDestino('')
        carregarContas()
      } else {
        exibirPopup('error', data.error || 'erro na transferência')
      }
    } catch (error) {
      exibirPopup('error', 'erro de conexão')
    }
  }

  const renderTitulo = () => {
    if (abaAtiva === 'saque') {
      return <>selecione a conta para saque</>
    }
    if (!contaSelecionada) {
      return <>selecione a conta de <span style={{color: 'var(--danger)'}}>origem</span></>
    }
    return <>selecione a conta de <span style={{color: 'var(--success)'}}>destino</span></>
  }

  const getCardClass = (numero) => {
    let classes = 'account-card simple-panel'
    if (abaAtiva === 'saque') {
      if (contaSelecionada === numero) classes += ' selected'
    } else {
      if (contaSelecionada === numero) classes += ' selected-origin'
      if (contaDestino === numero) classes += ' selected-dest'
    }
    return classes
  }

  return (
    <div className="app-container">
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
        <div className="tabs">
          <button 
            className={`tab-btn ${abaAtiva === 'saque' ? 'active' : ''}`}
            onClick={() => alternarAba('saque')}
          >
            saque
          </button>
          <button 
            className={`tab-btn ${abaAtiva === 'transferencia' ? 'active' : ''}`}
            onClick={() => alternarAba('transferencia')}
          >
            transferência
          </button>
        </div>

        <section>
          <h2 style={{ marginBottom: '4px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            {renderTitulo()}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            clique novamente sobre uma conta para desmarcá-la
          </p>
          
          {loading ? (
            <p>carregando...</p>
          ) : (
            <div className="accounts-grid">
              {contas.map(conta => (
                <div 
                  key={conta.account_number}
                  className={getCardClass(conta.account_number)}
                  onClick={() => handleCardClick(conta.account_number)}
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

        <section className="actions-panel" style={{ marginTop: '24px' }}>
          <form onSubmit={abaAtiva === 'saque' ? handleSaque : handleTransferencia} className="input-group">
            <div className="input-group">
              <label>valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                placeholder="ex: 50.00"
                value={valorOperacao}
                onChange={(e) => setValorOperacao(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              {abaAtiva === 'saque' ? 'sacar dinheiro' : 'enviar transferência'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
