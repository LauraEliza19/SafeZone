# SafeZone

Aplicativo mobile desenvolvido com Expo/React Native para registro e consulta colaborativa de ocorrências de risco, com autenticação de usuários e persistência remota no Firebase.

## Especificações do Projeto

- **Tela de Autenticação de usuários**
  - Login com e-mail e senha usando Firebase Authentication.

- **Tela de cadastro de usuários**
  - Criação de conta com validação básica (nome, e-mail, senha e confirmação).
  - Persistência inicial do usuario no Firestore.

- **Tela de perfil de usuario com CRUD (pos-Autenticação)**
  - **Create**: criar perfil do usuário.
  - **Read**: visualizar dados do perfil salvo.
  - **Update**: editar nome, telefone, cidade e avatar.
  - **Delete**: excluir perfil e conta.

- **Tela de cadastro com CRUD (pos-Autenticação)**
  - Implementada como **tela de Ocorrencias de perigo** (Roubo, Acidente, Incendio, Alagamento, etc.), com:
    - **Create**: cadastrar nova ocorrência.
    - **Read**: listar ocorrências cadastradas.
    - **Update**: editar ocorrência existente.
    - **Delete**: excluir ocorrência.
  - Inclui tipo de perigo, nivel de risco, descrição, validade e localização por mapa (coordenadas).

- **Persistencia remota no Firebase**
  - Todos os dados sao manipulados remotamente:
    - Firebase Authentication (login/cadastro/logout).
    - Cloud Firestore (colecoes `usuarios` e `ocorrencias`).

## Funcionalidades Implementadas

- Autenticação (entrar/cadastrar/sair).
- Perfil completo com CRUD.
- Ocorrências completas com CRUD.
- Seleção de local no mapa para ocorrências (latitude/longitude).
- Mapa principal com marcadores de ocorrências proximas.
- Menu de navegação no cabecalho com opcoes de acesso rapido.
- Interface padronizada com tema visual do projeto.

## Stack Tecnologica

- Expo
- React Native
- React Native Paper
- Firebase Authentication
- Cloud Firestore
- React Native Maps
- Expo Location

## Estrutura de Dados (Firestore)

### Coleção `usuarios`

Campos utilizados:

- `nome`
- `email`
- `telefone`
- `cidade`
- `foto` (avatar selecionado por icone, ex.: `icon:person-circle-outline`)
- `criadoEm`
- `atualizadoEm` (quando aplicavel)

### Coleção `ocorrencias`

Campos utilizados:

- `uid` (usuário dono da ocorrencia)
- `tipo`
- `descrição`
- `local`
- `latitude`
- `longitude`
- `risco`
- `validadeHoras`
- `criadoEm`
- `atualizadoEm` (quando aplicavel)

## Execução do Projeto

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar o app:

```bash
npx expo start
```

3. Abrir no Expo Go (Android/iOS) ou emulador.

## Observação

As operacoes de leitura e escrita de perfil e ocorrências sao realizadas diretamente no Firebase (persistencia remota), atendendo ao requisito central da disciplina.
