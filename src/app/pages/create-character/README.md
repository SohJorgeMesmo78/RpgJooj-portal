# 🧙‍♂️ Criar Personagem (Create Character)

Esta página permite que o usuário crie um novo personagem do zero, escolhendo sua raça, classe, alinhamento, atributos e retrato personalizado, integrando com a API para persistência.

## Rota Relativa
`/criar-personagem` (inserida antes de `:name` para evitar conflito de rotas)

## Propósito
Fornecer um formulário interativo de criação de personagem de D&D 5e de maneira medieval e amigável. Suporta rolagens automáticas de atributos (D&D 4d6 drop lowest), Standard Array, cálculo automático de PV (HP) inicial baseado na constituição e classe, e upload de avatar codificado em Base64.

## Estrutura Técnica
- **Componente**: `CreateCharacterComponent`
- **Arquivos**:
  - [create-character.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/create-character/create-character.component.ts)
  - [create-character.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/create-character/create-character.component.html)
  - [create-character.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/create-character/create-character.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Dropdowns Dinâmicos**: 
  - `GET /api/racas` via `CharacterService.getRacas()`
  - `GET /api/classes` via `CharacterService.getClasses()` (obtendo classes e suas respectivas subclasses)
- **Persistência**:
  - `POST /api/personagens` via `CharacterService.createCharacter(dto)`
  - O DTO inclui informações básicas, atributos, HP e o campo opcional `subclasseEscolha` para escolhas da subclasse (ex: Djinni do Bruxo "O Gênio").

## Regras de Negócio e Lógica Principal
- **Slug Automático**: Ao digitar o Nome, a aplicação gera automaticamente o código identificador (Slug) a ser usado como chave na URL (ex: `gandalf-o-cinzento`).
- **Standard Array**: Preenche automaticamente os atributos com os valores padrão de D&D `[15, 14, 13, 12, 10, 8]`.
- **Rolagem 4d6**: Rola quatro dados de 6 faces para cada atributo, descarta o menor valor e soma os outros três. Organiza os valores em ordem decrescente para atribuição direta.
- **Cálculo de HP**: Estima a vida máxima a partir do dado de vida padrão da classe (d8 = 8) somado ao modificador de Constituição do personagem. Multiplicado pelo nível se maior que 1. Permite customização manual.
- **Imagem em Base64**: Lê e processa a imagem carregada convertendo-a para string Base64 limpa (sem cabeçalho mime-type) para envio direto à API.
