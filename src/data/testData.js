/**
 * Massa de dados do teste.
 *
 * Mantém os dados de entrada separados da lógica de execução, facilitando a
 * variação de cenários sem tocar no código dos fluxos.
 */

/** Cidades de origem disponíveis no formulário do BlazeDemo. */
export const departureCities = [
  'Paris',
  'Philadelphia',
  'Boston',
  'Portland',
  'San Diego',
  'Mexico City',
  'São Paolo',
];

/** Cidades de destino disponíveis no formulário do BlazeDemo. */
export const destinationCities = [
  'Buenos Aires',
  'Rome',
  'London',
  'Berlin',
  'New York',
  'Dublin',
  'Cairo',
];

/**
 * Dados de pagamento fictícios. O BlazeDemo é uma aplicação de demonstração e
 * não processa pagamentos reais; usamos valores de placeholder padronizados.
 */
export const paymentProfile = {
  inputName: 'QA Performance',
  address: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '00000',
  cardType: 'visa',
  creditCardNumber: '4111111111111111',
  creditCardMonth: '12',
  creditCardYear: '2030',
  nameOnCard: 'QA Performance',
  rememberMe: 'on',
};

/** Retorna um elemento aleatório de um array. */
export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}
