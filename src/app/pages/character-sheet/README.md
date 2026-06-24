# 🛡️ Ficha de Personagem (Character Sheet)

Esta é a página mais complexa do sistema, contendo a ficha interativa e completa do personagem, dividida por abas temáticas.

## Rota Relativa
`/:name/ficha` (Exemplo: `/kairo/ficha`)

## Propósito
Permitir ao usuário visualizar e gerenciar todos os aspectos mecânicos do personagem na mesa de jogo, como pontos de vida (HP), atributos, perícias com proficiências, salvaguardas, ações de combate, habilidades de raça e grimório de magias com estatísticas de conjuração.

## Estrutura Técnica
- **Componente**: `CharacterSheetComponent`
- **Arquivos**:
  - [character-sheet.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-sheet/character-sheet.component.ts)
  - [character-sheet.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-sheet/character-sheet.component.html)
  - [character-sheet.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-sheet/character-sheet.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens/{id}` via `CharacterService.getCharacterById(charId)`
- **Dados consumidos**:
  - Informações básicas (nome, classe, nível, alinhamento).
  - Atributos e modificadores.
  - Coleções de `pericias`, `salvaguardas`, `proficiencias` (armas, armaduras, ferramentas), `idiomas`, `acoes` (soco, raio místico, etc.), `tracosRaciais` e `magias`.

## Regras de Negócio e Lógica Principal

### 1. Painel de Combate & Vida (HP)
- **Barra de Vida Dinâmica**: Exibe os Pontos de Vida Atuais, Máximos e Temporários (`tempHp`).
- **Controle de HP**: Permite inserir um valor numérico e aplicar **Dano** (`damage()`) ou **Cura** (`heal()`).
  - O dano consome primeiro a vida temporária, e o restante abate da vida atual.
  - A cura recupera a vida atual até o limite máximo (`vidaMaxima`), e o excedente acumula como vida temporária local.
- **Alternância de Deslocamento**: Suporta exibição em metros ou pés (`feet`), aplicando a conversão matemática `Feet = Math.round((metros / 1.5) * 5)`.

### 2. Abas Temáticas (`activeTab`)
- **Ficha**:
  - Exibe a tabela de **Atributos** e seus modificadores base.
  - Tabela de **Perícias**: Exibe o modificador calculado com base na proficiência (`getSkillModifier()`) e renderiza uma bolinha de estado (Vazio, Proficiente, Maestria).
  - **Salvaguardas**: Lista as defesas de atributos com bônus de proficiência calculados.
  - **Proficiências e Idiomas**: Exibe as armas, armaduras, ferramentas e idiomas que o personagem domina.
- **Ações**:
  - Agrupa os ataques e capacidades físicas por categoria: *Ação*, *Ação Bônus* e *Reação*.
  - **Tooltip Explicativo**: Ao passar o mouse sobre o acerto ou o dano, decodifica expressões dinâmicas (ex: `[CAR]` ou `[FOR]`) usando `parseTooltip()` para detalhar de onde vem a soma (ex: `+4(CAR)+2(Proficiência)`).
  - Suporta abertura de modal com a descrição completa da ação.
- **Traços Raciais**:
  - Exibe o resumo fisiológico da raça do personagem e suas habilidades ativas.
  - Modal com a lore detalhada de cada traço.
- **Magias**:
  - **Estatísticas de Conjuração**: Calcula em tempo real o Atributo de Conjuração, a CD de Salvação de Magia (`8 + Prof + Mod`) e o Bônus de Ataque de Magia (`Prof + Mod`).
  - **Espaços de Magia**: Exibe a contagem de slots disponíveis por classe.
  - **Grimório**: Separa os feitiços conhecidos em *Truques* (nível 0) e *Magias* (nível 1+).
  - Modal explicativo que formata a descrição da magia convertendo negritos do Markdown (`**texto**`) em tags HTML `<strong>`.
