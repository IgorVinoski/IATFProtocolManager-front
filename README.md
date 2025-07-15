# 🐄 IATFProtocolManager 📊

Este projeto foi desenvolvido como parte da disciplina de Programação Web do curso de Ciência da Computação do [IFSul Campus Passo Fundo](https://inf.passofundo.ifsul.edu.br/cursos/ciencia-da-computacao-matriz-2023/sobre-o-curso), sendo atingida a nota 10.

## 🌟 O Projeto

O IATFProtocolManager é uma aplicação web de gerenciamento para o protocolo de Inseminação Artificial em Tempo Fixo (IATF), um método amplamente utilizado na pecuária que visa alta eficiência e baixo custo quando bem administrado. Você pode encontrar mais informações sobre o protocolo IATF neste [documento](https://www.unirv.edu.br/conteudos/fckfiles/files/MEYCI%20KANANDA%20SOUZA%20ARA%C3%9AJO.pdf).

A proposta do projeto é oferecer uma ferramenta para otimizar a administração desse protocolo, permitindo o registro e acompanhamento de animais, protocolos de inseminação e monitoramento.

## 🚀 Arquitetura e Tecnologias

O front-end foi inicialmente prototipado utilizando o serviço de inteligência artificial [Mocha](https://getmocha.com/), que gerou o design inicial e os componentes. O desenvolvimento prosseguiu a partir dessas bases.

### 💻 Tecnologias Utilizadas:

* **TypeScript**: Um superset de JavaScript que adiciona tipagem estática.
* **React**: Biblioteca JavaScript para construção de interfaces de usuário.
* **Vite**: Um bundler moderno e rápido para desenvolvimento front-end.
* **Tailwind CSS**: Um framework CSS utilitário para estilização rápida e responsiva.
* **Lucide React**: Biblioteca de ícones (`lucide-react`).
* **Recharts**: Biblioteca de gráficos para React (`recharts`).
* **React Router DOM**: Para roteamento declarativo dentro da aplicação (`react-router-dom`).
* **Axios**: Cliente HTTP para fazer requisições à API do backend (`axios`).
* **Dotenv**: Para carregar variáveis de ambiente (`dotenv`).
* **React Hook Form**: Para gerenciamento de formulários (`react-hook-form`).
* **React Big Calendar**: Componente de calendário de eventos (`react-big-calendar`).
* **React Calendar**: Componente de calendário (`react-calendar`).
* **React Datepicker**: Componente para seleção de datas (`react-datepicker`).

### 📁 Estrutura de Pastas:

A estrutura do projeto segue a seguinte organização:

    src/
    ├── assets/
    ├── components/
    │   ├── Header.tsx
    │   ├── Layout.tsx
    │   ├── ProtectedRoute.tsx
    │   └── Sidebar.tsx
    ├── context/
    │   ├── AnimalContext.tsx
    │   └── AuthContext.tsx
    ├── pages/
    │   ├── AnimalRegistration.tsx 
    │   ├── Dashboard.tsx       
    │   ├── Login.tsx           
    │   ├── Monitoring.tsx      
    │   ├── ProfilePage.tsx      
    │   ├── ProtocolRegistration.tsx
    │   └── Register.tsx         
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    └── vite-env.d.ts
    .env
    .gitignore


### 🔷 Rotas (Front-end)
As rotas da aplicação são gerenciadas pelo react-router-dom e correspondem às páginas listadas na estrutura de pastas. As principais rotas incluem:

- /login: Página de login.
<img width="1361" height="645" alt="image" src="https://github.com/user-attachments/assets/63ee573c-26f9-4330-b9e4-dec11d5412a7" />

- /register: Página de registro de novo usuário.
<img width="1351" height="643" alt="image" src="https://github.com/user-attachments/assets/8b7849ff-fe5f-4538-94d6-50f53fb98a09" />

- /dashboard: Painel principal da aplicação (requer autenticação).
<img width="1365" height="641" alt="image" src="https://github.com/user-attachments/assets/ec1f7887-68e0-449f-8907-6e1da5941cab" />

- /animal-registration: Página de registro de animais (requer autenticação).
<img width="1355" height="636" alt="image" src="https://github.com/user-attachments/assets/24a85e9e-d1a3-4b5f-bfb9-8a81e188c6e4" />

- /protocol-registration: Página de registro de protocolos (requer autenticação).
<img width="1353" height="643" alt="image" src="https://github.com/user-attachments/assets/fd5ae3ef-f6eb-429a-a939-3ecb85900a32" />

- /monitoring: Página de monitoramento (requer autenticação).
<img width="1347" height="644" alt="image" src="https://github.com/user-attachments/assets/57e0d83a-df4b-4984-a4f4-ac0d2bc3838e" />


- /profile: Página de perfil do usuário (requer autenticação).
<img width="1355" height="646" alt="image" src="https://github.com/user-attachments/assets/76c6b238-336d-4ff7-a6b1-2227b5ee52e9" />

As rotas protegidas são gerenciadas pelo componente ProtectedRoute.tsx.



## ☁️ Deploy

A aplicação está hospedada nos seguintes serviços:

* **Front-end**: [Vercel](https://iatf-protocol-manager-front.vercel.app/) 
* **Back-end**: Os detalhes do back-end podem ser encontrados em [IATFProtocolManager-api](https://github.com/IgorVinoski/IATFProtocolManager-api).

## ⚙️ Execução da Aplicação (Local)

Para executar a aplicação front-end localmente, certifique-se de ter o [Node.js](https://nodejs.org/en/download/) instalado.

1.  Clone este repositório:
    ```bash
    git clone https://github.com/IgorVinoski/IATFProtocolManager-front
    cd IATFProtocolManager
    ```
2.  Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).





