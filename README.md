# CPM Barreiras: O Resgate Ambiental

Jogo educativo de plataforma 2D estilo retro, desenvolvido para conscientização ambiental no contexto do Colégio da Polícia Militar (CPM) de Barreiras - BA. O jogador controla um dos cinco heróis do Esquadrão Verde em uma missão para derrotar o Lorde Poluição e recuperar a Muda de Ouro.

![Phaser 3](https://img.shields.io/badge/Phaser-3.80-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## Sumário

- [Sobre o Jogo](#sobre-o-jogo)
- [Personagens](#personagens)
- [Fases](#fases)
- [Mecânicas de Jogo](#mecânicas-de-jogo)
- [Tecnologias](#tecnologias)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Como Executar](#como-executar)
- [Controles](#controles)
- [Estrutura de Arquivos](#estrutura-de-arquivos)

## Sobre o Jogo

O Lorde Poluição invadiu o colégio, espalhando lixo e resíduos tóxicos por todos os pavilhões! O jogador deve montar o Esquadrão Verde e percorrer quatro fases temáticas, coletando moedas de reciclagem, derrotando inimigos tóxicos e enfrentando o boss final para salvar a Muda de Ouro.

O jogo roda inteiramente no navegador, com todos os sprites gerados programaticamente via Canvas e toda a trilha sonora sintetizada em tempo real pela Web Audio API em estilo chiptune 8-bit.

## Personagens

| Personagem | Descrição | Frase de Vitória |
|---|---|---|
| **Angelina** | Determinada e corajosa | *"Ninguém para a Angelina!"* |
| **Anne** | Alegre e criativa | *"Criatividade vence a poluição!"* |
| **Lazaro** | Forte e estratégico | *"Força verde em ação!"* |
| **Pietro** | Ágil e inteligente | *"Inteligência é o melhor poder!"* |
| **Pinheiro** | Disciplinado e líder | *"Disciplina salva o meio ambiente!"* |

A escolha é puramente cosmética — todos os personagens possuem as mesmas mecânicas.

## Fases

| Mundo | Nome | Ambiente | Tempo |
|---|---|---|---|
| 1-1 | Pátio Contaminado | Céu aberto | 300s |
| 1-2 | Tubulações Entupidas | Subterrâneo | 350s |
| 1-3 | Bosque das Árvores Centenárias | Floresta escura | 360s |
| 1-4 | Quadra Poliesportiva | Arena do Boss | 300s |

Cada fase possui obstáculos únicos: gotas ácidas, barras de fogo rotativas, plataformas móveis e inimigos com comportamentos distintos.

## Mecânicas de Jogo

### Movimentação
- Aceleração gradual (1200 px/s² no chão, 800 px/s² no ar)
- Velocidade: 160 px/s (caminhando) / 240 px/s (correndo)
- **Coyote time** (80ms) e **jump buffer** (100ms) para controle responsivo
- Salto variável conforme duração do botão pressionado

### Power-ups
| Item | Efeito |
|---|---|
| Reciclagem (cogumelo verde) | Transforma de pequeno para grande |
| Ipê (flor) | Permite disparar projéteis de semente |
| Painel Solar (estrela) | Invencibilidade temporária (10s) |

### Combate
- **Stomp** em inimigos (com efeito de hitstop e camera shake)
- **Sistema de combo** — stomps consecutivos em menos de 1.5s multiplicam pontuação
- **Cascos de Koopa** — podem ser chutados para eliminar outros inimigos
- **Boss** com 3 fases progressivas, telegraph visual antes de cada ataque

### Outros
- Estrelas secretas escondidas em cada fase
- Recorde pessoal salvo localmente (localStorage)
- Texto flutuante de pontuação em todas as ações
- Transições suaves entre cenas com fade in/out

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **[Phaser 3](https://phaser.io/)** | Framework de jogo (física Arcade, cenas, câmera, input) |
| **TypeScript** | Linguagem principal, com tipagem estrita |
| **Vite** | Bundler e servidor de desenvolvimento |
| **Web Audio API** | Toda a trilha sonora e efeitos gerados proceduralmente |
| **Canvas API** | Todos os sprites gerados programaticamente (sem assets externos de arte) |

> O jogo **não utiliza nenhum arquivo de sprite ou áudio externo** (exceto as fotos dos personagens e cenários). Tudo é gerado em tempo de execução.

## Arquitetura do Projeto

```
src/
├── main.ts                     # Configuração do Phaser e inicialização
├── constants.ts                # Constantes globais de gameplay
├── types.ts                    # Tipos TypeScript (PowerState, TILE, etc.)
│
├── scenes/                     # Cenas do jogo (fluxo de telas)
│   ├── BootScene.ts            # Inicialização mínima
│   ├── PreloadScene.ts         # Carregamento de assets e geração de sprites
│   ├── TitleScene.ts           # Tela título com menu
│   ├── CharacterSelectScene.ts # Seleção de personagem
│   ├── InstructionsScene.ts    # Tela de instruções
│   ├── LevelTransitionScene.ts # Card de transição entre fases
│   ├── BaseLevelScene.ts       # Classe base abstrata para todas as fases
│   ├── Level1_1Scene.ts        # Pátio Contaminado
│   ├── Level1_2Scene.ts        # Tubulações Entupidas
│   ├── Level1_3Scene.ts        # Bosque das Árvores Centenárias
│   ├── Level1_4Scene.ts        # Quadra Poliesportiva (Boss)
│   ├── HUDScene.ts             # Interface de jogo (score, vidas, tempo)
│   ├── PauseScene.ts           # Menu de pausa
│   ├── GameOverScene.ts        # Tela de fim de jogo
│   └── VictoryScene.ts         # Tela de vitória com stats animados
│
├── entities/                   # Entidades com física e comportamento
│   ├── Player.ts               # Jogador (movimento, poder, dano, projéteis)
│   ├── Enemy.ts                # Classe base de inimigos
│   ├── GoombaLixo.ts           # Inimigo patrulheiro (lixo andante)
│   ├── KoopaToxica.ts          # Inimigo com casco (resíduo tóxico)
│   └── Boss.ts                 # Boss final (Monstro de Lata)
│
├── objects/                    # Objetos interativos do cenário
│   ├── Block.ts                # Blocos de interrogação e tijolos
│   ├── Coin.ts                 # Moedas de reciclagem
│   ├── PowerUp.ts              # Itens de poder
│   └── FlagPole.ts             # Mastro de bandeira (final de fase)
│
├── systems/                    # Sistemas auxiliares
│   ├── AudioManager.ts         # Geração procedural de áudio (singleton)
│   ├── SpriteGenerator.ts      # Geração de todos os sprites via Canvas
│   ├── InputManager.ts         # Teclado + gamepad virtual (mobile)
│   ├── AnimationHelper.ts      # Animações procedurais do jogador
│   ├── LevelBuilder.ts         # Construção de fases a partir de tile maps
│   ├── ParallaxBackground.ts   # Fundos com efeito parallax
│   └── GameStateUtils.ts       # Utilitários de estado do jogo
│
└── data/                       # Dados de configuração
    ├── characters.ts           # Definição dos 5 personagens
    └── levels.ts               # Tile maps e entidades das 4 fases
```

## Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm (incluído com o Node.js)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd jogo-cpm

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build de Produção

```bash
npm run build
npm run preview
```

Os arquivos de produção serão gerados na pasta `dist/`.

## Controles

### Teclado

| Ação | Teclas |
|---|---|
| Mover | `←` `→` ou `A` `D` |
| Pular | `Espaço` `↑` ou `W` |
| Correr | `Shift` |
| Atirar | `Z` ou `X` |
| Pausar | `P` ou `Esc` |
| Silenciar | `M` |

### Mobile (Tela sensível ao toque)

O jogo detecta automaticamente dispositivos móveis e exibe um gamepad virtual:

- **D-pad** (esquerda) — movimentação e pulo
- **Botão A** (direita) — pular
- **Botão B** (direita) — correr / atirar
- **Botão Pause** (canto superior direito)

> O jogo requer orientação **paisagem** (horizontal). Um aviso é exibido automaticamente em modo retrato.

## Estrutura de Arquivos

```
jogo-cpm/
├── index.html          # Página HTML com container do jogo
├── package.json        # Dependências e scripts npm
├── tsconfig.json       # Configuração do TypeScript
├── vite.config.ts      # Configuração do Vite
├── src/                # Código-fonte TypeScript
├── imagens/
│   ├── personagens/    # Fotos dos 5 personagens (PNG)
│   └── cenarios/       # Imagens de fundo dos cenários (PNG)
├── public/             # Assets estáticos
└── dist/               # Build de produção (gerado)
```

---

Desenvolvido como projeto educativo para o **Colégio da Polícia Militar de Barreiras - BA**.
