export const departureCities = [
  'Paris',
  'Philadelphia',
  'Boston',
  'Portland',
  'San Diego',
  'Mexico City',
  'São Paolo',
];

export const destinationCities = [
  'Buenos Aires',
  'Rome',
  'London',
  'Berlin',
  'New York',
  'Dublin',
  'Cairo',
];

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

export function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}
