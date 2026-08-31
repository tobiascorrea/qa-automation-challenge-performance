/**
 * Configuração central de ambiente.
 *
 * Todos os valores podem ser sobrescritos em tempo de execução via variáveis
 * de ambiente (`-e CHAVE=valor` no k6), o que mantém os scripts livres de
 * valores fixos e prontos para rodar em qualquer máquina ou pipeline.
 */

/** Lê uma variável de ambiente do k6 com fallback para um valor padrão. */
function envOrDefault(key, fallback) {
  const value = __ENV[key];
  return value === undefined || value === '' ? fallback : value;
}

export const environment = {
  /** URL base da aplicação sob teste (BlazeDemo). */
  baseUrl: envOrDefault('BASE_URL', 'https://www.blazedemo.com'),

  /**
   * Nome lógico do ambiente. Útil para segmentar relatórios quando o mesmo
   * script roda contra diferentes alvos (local, staging, produção).
   */
  environmentName: envOrDefault('ENVIRONMENT', 'production'),
};

export const endpoints = {
  home: '/',
  reserve: '/reserve.php',
  purchase: '/purchase.php',
  confirmation: '/confirmation.php',
};

/**
 * Marcadores textuais usados para validar cada etapa do fluxo. Centralizá-los
 * evita "strings mágicas" espalhadas pelos checks.
 */
export const pageMarkers = {
  home: 'Welcome to the Simple Travel Agency!',
  reserve: 'Choose This Flight',
  purchase: 'Your flight from',
  confirmation: 'Thank you for your purchase today!',
};
