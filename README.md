# AuraTrade — Frontend

Interface web do **AuraTrade**, uma aplicação de monitoramento de criptoativos que permite acompanhar cotações, criar alertas de compra ou venda e gerenciar os monitoramentos processados pelo backend.

Este repositório contém o frontend da plataforma. A API responsável pela persistência, verificação dos preços e envio das notificações está disponível em [auratrade-backend](https://github.com/hayax0/auratrade-backend).

## Funcionalidades

- Consulta de cotações de criptoativos pela API pública da Binance.
- Atualização automática dos preços exibidos na interface.
- Criação de alertas de **compra** e **venda** com preço-alvo.
- Listagem dos monitoramentos cadastrados no backend.
- Comparação entre o preço atual e o preço definido no alerta.
- Remoção de alertas existentes.
- Feedback visual para operações realizadas com sucesso ou erro.
- Registro das principais ações e falhas de comunicação no painel de logs.
- Acesso direto ao bot do AuraTrade no Telegram.
- Layout responsivo para desktop e dispositivos móveis.

## Ativos disponíveis

Atualmente, a interface permite monitorar os seguintes pares:

- Bitcoin — BTC/USDT
- Ethereum — ETH/USDT
- Solana — SOL/USDT
- BNB — BNB/USDT
- Cardano — ADA/USDT

## Tecnologias

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS 4**
- **Lucide React**
- **React Hot Toast**
- **Binance Data API**
- **API REST do AuraTrade**

## Como funciona

1. O frontend consulta a Binance para apresentar as cotações atuais.
2. O usuário seleciona o ativo, o tipo da operação e o preço-alvo.
3. O alerta é enviado para a API REST do AuraTrade.
4. O backend persiste e monitora o alerta.
5. Quando a condição definida é atingida, o backend envia a notificação pelo Telegram.
6. A interface permite acompanhar e remover os alertas cadastrados.

As cotações do painel são atualizadas periodicamente sem recarregar a página. A aplicação também sincroniza os monitoramentos com o backend e informa falhas de conexão no painel de logs.

## Backend e integrações

O frontend se comunica com o backend hospedado no Render para:

- consultar os alertas cadastrados;
- criar novos monitoramentos;
- remover alertas.

Além disso, a aplicação consome diretamente a API pública da Binance para exibir os preços atuais dos ativos.

- [Repositório do backend](https://github.com/hayax0/auratrade-backend)
- [Bot do AuraTrade no Telegram](https://t.me/AuraTradeHaya_Bot)

## Executando localmente

### Pré-requisitos

- Node.js 18 ou superior
- npm

### Instalação

```bash
git clone https://github.com/hayax0/auratrade-frontend.git
cd auratrade-frontend
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação será disponibilizada no endereço informado pelo Vite, normalmente `http://localhost:5173`.

### Build de produção

```bash
npm run build
```

### Verificação do código

```bash
npm run lint
```

## Estrutura da solução

O AuraTrade foi separado em dois projetos:

- **Frontend:** interface em React responsável pela experiência do usuário e visualização das cotações.
- **Backend:** API em Java e Spring Boot responsável pela persistência, regras de monitoramento, integração com a Binance e notificações pelo Telegram.

Essa separação permite desenvolver, testar e implantar cada camada de forma independente.

## Autor

Desenvolvido por [Caio Campos](https://github.com/hayax0).
