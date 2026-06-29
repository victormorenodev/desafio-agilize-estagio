# Minha Solução — Agilize Bank

## Stack
- **Backend:** Python 3 (Django + Django REST Framework)
- **Frontend:** React (Vite) + CSS Puro

## Pré-requisitos / dependências
- Python 3 instalado
- Node.js e npm instalados

---

## Como executar

### 1. Backend (API)
Abra um terminal na raiz do projeto e execute:

```bash
cd backend

# Cria e ativa o ambiente virtual (Linux/Mac)
python -m venv venv
source venv/bin/activate

# Instala as dependências
pip install -r requirements.txt

# Entra na pasta do projeto Django
cd agilebank_api

# Cria o banco de dados local
python manage.py migrate

# Popula o banco com 3 contas para testes (CC: 12345-6, CP: 78901-2 e CC: 34567-8)
python manage.py loaddata contas_seed.json

# Inicia o servidor
python manage.py runserver
```
A API estará rodando em: `http://127.0.0.1:8000`

> **Nota:** Para rodar os testes unitários automatizados, execute `python manage.py test` dentro da pasta `backend/agilebank_api/`.

### 2. Frontend
Abra um **novo terminal** na raiz do projeto e execute:

```bash
cd frontend

# Instala as dependências do React
npm install

# Inicia o servidor de desenvolvimento
npm run dev
```
O Frontend estará acessível no seu navegador em: `http://localhost:5173`

---

## Exemplo de uso
1. Acesse o Frontend no navegador. A tela exibirá as contas cadastradas.
2. **Saque**: Clique em um dos cartões de conta. Digite um valor (ex: `50.00`) e clique em "sacar dinheiro". Um popup confirmará o sucesso. Note que se a conta for Corrente, será descontado R$ 1,00 a mais devido à taxa.
3. **Transferência**: Clique na aba "transferência". 
   - Clique na conta que enviará o dinheiro (ficará vermelha indicando Origem).
   - Clique na conta que receberá o dinheiro (ficará verde indicando Destino).
   - Digite o valor e clique em "enviar transferência".
   - O saldo nas duas contas será atualizado em tempo real na tela.

## Observações
- **Testes Unitários:** Foram construídos 5 testes unitários nativos para garantir a validação rigorosa das regras de negócio (taxa da conta corrente, limites de cheque especial da CC de R$ -500.00, limite da Poupança de R$ 0.00).
- **UX UI:** A interface foi construída seguindo a identidade visual clean e minimalista da marca Agilize, focando em feedbacks visuais intuitivos.
- **Isolamento e Atomicidade:** No backend, as regras de transferência estão em uma camada de `services.py` dedicada e utilizam `@transaction.atomic` para garantir que erros não deixem o dinheiro no "limbo" se algo falhar entre a dedução e a adição nas duas contas.
