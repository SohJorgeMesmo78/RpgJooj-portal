# 🏠 Home - Seleção de Personagem

Esta é a página inicial da aplicação RPGJooj, onde o usuário visualiza todos os personagens disponíveis e pode selecionar um para gerenciar ou visualizar os detalhes.

## Rota Relativa
`/`

## Propósito
Permitir a navegação inicial pelo grimório de personagens, exibindo cards resumidos com o nome, classe, nível e imagem de cada herói cadastrado.

## Estrutura Técnica
- **Componente**: `HomeComponent`
- **Arquivos**:
  - [home.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/home/home.component.ts)
  - [home.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/home/home.component.html)
  - [home.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/home/home.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens` via `CharacterService.getCharacters()`
- **Dados consumidos**: Retorna um array de objetos `Character` contendo as informações básicas de cada personagem cadastrado (ID, nome, raça, classe, nível e imagem de capa).

## Regras de Negócio e Lógica Principal
- **Listagem Reativa**: Utiliza o pipe `async` do Angular para se inscrever no Observable retornado pelo serviço, garantindo renderização e gerenciamento de ciclo de vida limpos.
- **Navegação**: Cada card possui um link dinâmico (`routerLink`) apontando para a página de detalhes do personagem correspondente, usando o ID/nome amigável dele na rota.
