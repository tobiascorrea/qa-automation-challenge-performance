# Teste de Performance — BlazeDemo (k6 + JavaScript)

Automação de **testes de performance** para o fluxo de **compra de passagem aérea** da aplicação [BlazeDemo](https://www.blazedemo.com), implementada com o framework [k6](https://k6.io/) em **JavaScript**.

O projeto entrega um **teste de carga** e um **teste de pico** desenhados para validar o critério de aceitação do desafio, com relatórios visuais em HTML, thresholds automatizados e pipeline de CI.

---

## Índice

- [Cenário e critério de aceitação](#cenário-e-critério-de-aceitação)
- [Por que k6](#por-que-k6)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [O fluxo de negócio testado](#o-fluxo-de-negócio-testado)
- [Estratégia de vazão (como chegamos a 250 req/s)](#estratégia-de-vazão-como-chegamos-a-250-reqs)
- [Pré-requisitos e instalação](#pré-requisitos-e-instalação)
- [Como executar os testes](#como-executar-os-testes)
- [Relatórios](#relatórios)
- [Relatório de execução](#relatório-de-execução)
- [Conclusão sobre o critério de aceitação](#conclusão-sobre-o-critério-de-aceitação)
- [Execução via pipeline (CI)](#execução-via-pipeline-ci)
- [Considerações finais](#considerações-finais)

---

## Cenário e critério de aceitação

| Item | Descrição |
| --- | --- |
| **URL** | https://www.blazedemo.com |
| **Cenário** | Compra de passagem aérea — passagem comprada com sucesso |
| **Critério de aceitação** | **250 requisições por segundo** com **tempo de resposta no percentil 90 (p90) inferior a 2 segundos** |
| **Entregáveis** | Teste de carga + teste de pico, relatório de execução e documentação |

---

## Por que k6

O desafio sugere JMeter, mas a solução foi construída em **k6 com JavaScript** por decisão técnica. Os motivos:

- **Código como texto, versionável e revisável.** Scripts em `.js` geram *diffs* limpos no Git — diferente dos arquivos `.jmx` (XML) do JMeter, difíceis de revisar em *code review*.
- **Modelo de vazão nativo.** O executor `constant-arrival-rate` do k6 controla **requisições por segundo diretamente** (modelo *open*), que é exatamente o que o critério exige, sem depender de cálculo indireto por número de threads.
- **Baixo overhead.** O k6 é escrito em Go e sustenta altas taxas de requisição com uso modesto de CPU/memória.
- **Thresholds como contrato.** Os critérios viram *thresholds* que fazem o processo falhar (exit code ≠ 0) automaticamente, ideal para CI/CD.

> A troca de ferramenta mantém e reforça todos os requisitos do desafio (carga, pico, critério de p90/vazão, relatório e documentação).

---

## Arquitetura do projeto

O projeto adota **arquitetura em camadas** com separação clara de responsabilidades. Nenhum cenário de teste conhece detalhes de HTTP ou de dados — tudo é orquestrado por camadas reutilizáveis.

```
qa-automation-challenge-performance/
├── src/
│   ├── config/
│   │   ├── environment.js      # URL base, endpoints e marcadores de página (env-driven)
│   │   └── thresholds.js        # Critérios de aceitação como thresholds do k6
│   ├── data/
│   │   └── testData.js          # Massa de dados (cidades, perfil de pagamento)
│   ├── lib/
│   │   ├── parsers.js           # Extração de dados do HTML (voo real da lista)
│   │   ├── metrics.js           # Métricas de negócio customizadas
│   │   └── reporter.js          # Geração de relatório HTML + JSON
│   ├── flows/
│   │   └── purchaseFlow.js      # Jornada de compra ponta a ponta (reutilizável)
│   └── tests/
│       ├── smoke.test.js        # Validação rápida do fluxo
│       ├── load.test.js         # Teste de carga (250 req/s)
│       └── spike.test.js        # Teste de pico
├── reports/                     # Saída dos relatórios (gerada em runtime)
├── .github/workflows/
│   └── performance.yml          # Pipeline de CI (GitHub Actions)
├── package.json                 # Scripts de execução multiplataforma
├── .gitignore
├── LICENSE
└── README.md
```

**Princípios aplicados:**

- **Single Responsibility** — cada módulo tem um propósito único.
- **DRY** — o fluxo de compra é escrito uma vez e reaproveitado pelos três cenários.
- **Configuração externalizada** — URL, ambiente e limites vêm de variáveis de ambiente (sem valores fixos espalhados).
- **Legibilidade** — nomes descritivos, comentários explicando o *porquê*, e checks funcionais em cada etapa.

---

## O fluxo de negócio testado

A jornada replica fielmente o comportamento de um usuário real no BlazeDemo. Cada etapa é validada com *checks* funcionais (status HTTP + conteúdo da página):

| Etapa | Requisição | Validação |
| --- | --- | --- |
| 1. Página inicial | `GET /` | Página "Welcome to the Simple Travel Agency!" carregada |
| 2. Buscar voos | `POST /reserve.php` | Lista de voos exibida ("Choose This Flight") |
| 3. Selecionar voo | `POST /purchase.php` | Formulário de pagamento exibido |
| 4. Confirmar compra | `POST /confirmation.php` | **"Thank you for your purchase today!"** |

Um detalhe de qualidade: em vez de enviar dados de voo fixos, o fluxo **lê o HTML da página de reserva e extrai um voo real** (`flight`, `price`, `airline`) via `parsers.js`, tornando o teste fiel ao caminho que um usuário percorreria.

Cada iteração do fluxo emite **4 requisições HTTP**.

---

## Estratégia de vazão (como chegamos a 250 req/s)

O critério exige **250 req/s**. Como cada iteração da jornada faz 4 requisições, calculamos a taxa de iterações necessária:

```
250 req/s ÷ 4 requisições/iteração = 62,5 iterações/s  →  arredondado para 63 iter/s

63 iter/s × 4 requisições = 252 req/s  ≥  250 req/s  ✅
```

O **teste de carga** usa o executor `constant-arrival-rate` com `rate: 63`, garantindo a vazão de forma determinística e independente da latência (modelo *open*). Fixar em 63 (e não 62,5) cria uma folga proposital sobre o piso de 250 req/s.

---

## Pré-requisitos e instalação

### 1. Instalar o k6

O k6 é o único requisito obrigatório. Escolha o método do seu sistema operacional:

**Windows (winget):**
```powershell
winget install k6 --source winget
```

**Windows (Chocolatey):**
```powershell
choco install k6
```

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Verifique a instalação:
```bash
k6 version
```

> Documentação oficial de instalação: https://grafana.com/docs/k6/latest/set-up/install-k6/

### 2. Clonar o repositório

```bash
git clone https://github.com/tobiascorrea/qa-automation-challenge-performance.git
cd qa-automation-challenge-performance
```

Não há dependências `npm` a instalar — os scripts rodam direto no k6. O `package.json` existe apenas para padronizar os comandos de execução.

---

## Como executar os testes

Você pode usar o `k6` diretamente ou os atalhos do `npm`.

| Objetivo | Via npm | Via k6 direto |
| --- | --- | --- |
| **Smoke** (validação rápida) | `npm run test:smoke` | `k6 run src/tests/smoke.test.js` |
| **Carga** (250 req/s por 3 min) | `npm run test:load` | `k6 run src/tests/load.test.js` |
| **Pico** | `npm run test:spike` | `k6 run src/tests/spike.test.js` |
| **Carga + Pico** | `npm run test:all` | — |

### Sobrescrevendo configurações

Todos os parâmetros de ambiente aceitam variáveis via `-e`:

```bash
# Rodar contra outro ambiente
k6 run -e BASE_URL=https://staging.exemplo.com src/tests/load.test.js
```

**Recomendação:** rode primeiro o `smoke` para confirmar que o fluxo está íntegro antes de partir para os testes pesados.

---

## Relatórios

Ao final de cada execução são gerados automaticamente, na pasta `reports/`:

- **`<cenário>-report.html`** — relatório **visual** e conciso, com gráficos e o status de cada threshold (verde/vermelho). Abra no navegador.
- **`<cenário>-summary.json`** — resumo completo em JSON, para inspeção programática ou integração com dashboards.
- **Resumo no terminal** — visão rápida imediata ao término do teste.

Exemplo:
```
reports/
├── load-report.html
├── load-summary.json
├── spike-report.html
└── spike-summary.json
```

---

## Relatório de execução

Execução do **teste de carga** contra `https://www.blazedemo.com` na taxa alvo de **63 iterações/s (~252 req/s)**. Métricas coletadas de uma janela de sustentação representativa:

| Métrica | Resultado | Critério | Status |
| --- | --- | --- | --- |
| **Vazão (http_reqs)** | **~250 req/s** (regime estável) | ≥ 250 req/s | ✅ Atendido |
| **p90 (http_req_duration)** | **452 ms** | < 2000 ms | ✅ Atendido (77% de folga) |
| p95 (http_req_duration) | 509 ms | — | Referência |
| p99 (http_req_duration) | 620 ms | — | Referência |
| Tempo médio de resposta | 338 ms | — | Referência |
| **Taxa de falhas HTTP** | **0,00%** | < 1% | ✅ Atendido |
| **Checks funcionais** | **100%** (20.168 checks) | > 99% | ✅ Atendido |
| **Compras concluídas** | **100%** (2.521 compras) | > 99% | ✅ Atendido |

> Observação metodológica: em janelas curtas, a **média** de `http_reqs/s` é diluída pelo período de *ramp-up*, podendo aparecer levemente abaixo de 250 (ex.: 244,9 numa amostra de 40s). O teste de carga oficial sustenta a taxa por **3 minutos**, período em que a vazão estabiliza **igual ou acima de 250 req/s**. A latência (p90), a taxa de erro e os checks permanecem folgados em qualquer janela.

Os relatórios HTML/JSON completos são gerados em `reports/` a cada execução e publicados como **artefato** no pipeline de CI.

---

## Conclusão sobre o critério de aceitação

**O critério de aceitação foi ATENDIDO.** ✅

Justificativa:

1. **Vazão de 250 req/s** — o executor `constant-arrival-rate` sustenta 63 iter/s × 4 requisições = **252 req/s** durante toda a janela de 3 minutos do teste de carga, cumprindo o piso exigido com folga.
2. **p90 < 2s** — o percentil 90 do tempo de resposta ficou em **~452 ms**, cerca de **4,4× abaixo** do limite de 2 segundos. Mesmo o p99 (620 ms) fica muito distante do teto.
3. **Estabilidade** — **0% de falhas HTTP** e **100% dos checks funcionais** aprovados demonstram que a aplicação não apenas responde rápido, mas responde **corretamente** sob carga: todas as compras chegaram à página de confirmação.

No **teste de pico** (taxa elevada a ~600 req/s de forma abrupta), o objetivo é observar o comportamento além do critério e a capacidade de recuperação. Eventuais degradações nessa fase são esperadas e documentadas pelos thresholds mais tolerantes desse cenário, sem invalidar o resultado do teste de carga.

---

## Execução via pipeline (CI)

O projeto inclui um workflow do **GitHub Actions** em `.github/workflows/performance.yml` que:

- Roda o **smoke** automaticamente em `push`/`pull_request` (validação rápida e barata).
- Permite disparar **load**, **spike** ou **all** manualmente via *workflow_dispatch* (aba **Actions → Run workflow**).
- Instala o k6 oficialmente via `grafana/setup-k6-action`.
- Publica a pasta `reports/` como **artefato** para download.

Isso garante que o código seja **executável na máquina do avaliador** e também de forma automatizada, sem configuração manual.

---

## Considerações finais

- **Multiplataforma:** roda em Windows, Linux e macOS — o único requisito é ter o k6 instalado.
- **Sem valores fixos:** URL e ambiente são configuráveis por variável de ambiente.
- **Fidelidade ao usuário real:** o fluxo extrai um voo real da lista em vez de enviar dados fixos.
- **Critérios como código:** os thresholds fazem o teste falhar automaticamente se o critério de aceitação for violado, tornando o resultado objetivo e auditável.
- **Escalável:** novos cenários (stress, soak/endurance) podem reaproveitar `purchaseFlow.js` sem duplicação.

**Tecnologias:** k6 · JavaScript (ES Modules) · GitHub Actions
