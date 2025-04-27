# Frota Leste 3

*Sincronizado automaticamente com as implantações [v0.dev](https://v0.dev)*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jaolucass-projects/v0-green-dashboard-with-map-1r)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/RaVUTJ4cINo)

[Acessar https://v0-frota-leste-3.vercel.app](https://v0-frota-leste-3.vercel.app)

# Frota Leste - Sistema de Monitoramento de Frota Hospitalar

Este é um sistema para monitoramento de frota hospitalar com cadastro de veículos, motoristas e informações como localização, consumo de combustível, manutenção de veículos, trajetos e rotas.

![Captura de tela 2025-04-26 092042](https://github.com/user-attachments/assets/23f44b50-8bce-4774-8efe-62b845f999de)


## Pré-requisitos

*   Node.js (v18 ou superior)
*   npm ou yarn
*   Chave da API do Firebase (configurar as variáveis de ambiente)

## Configuração

1.  Clone o repositório:

    ```bash
    git clone https://github.com/JaoLucass/Frota-Leste.git
    cd frota-leste    
    ```

2.  Instale as dependências:

    ```bash
    npm install
    # ou
    npm install --legacy-peer-deps
    # ou
    yarn install
    ```

3.  Configure as variáveis de ambiente:

    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Adicione as seguintes variáveis com suas respectivas chaves da API do Firebase:

        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_DATABASE_URL=SUA_DATABASE_URL
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID
        ```

## Execução

1.  Execute o projeto em modo de desenvolvimento:

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

2.  Abra o navegador e acesse `http://localhost:3000`.

## Observações

*   Certifique-se de que o Firebase Realtime Database esteja configurado corretamente e com as regras de segurança adequadas.
*   Este projeto utiliza a biblioteca `react-leaflet` para a exibição de mapas. É necessário configurar corretamente as dependências e os estilos do Leaflet.
*   Para simular o rastreamento em tempo real, os dados são gerados aleatoriamente. Em um ambiente de produção, seria necessário integrar com um sistema de rastreamento real.
