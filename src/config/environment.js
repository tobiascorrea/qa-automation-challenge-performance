function envOrDefault(key, fallback) {
  const value = __ENV[key];
  return value === undefined || value === '' ? fallback : value;
}

export const environment = {
  baseUrl: envOrDefault('BASE_URL', 'https://www.blazedemo.com'),
  environmentName: envOrDefault('ENVIRONMENT', 'production'),
};

export const endpoints = {
  home: '/',
  reserve: '/reserve.php',
  purchase: '/purchase.php',
  confirmation: '/confirmation.php',
};

export const pageMarkers = {
  home: 'Welcome to the Simple Travel Agency!',
  reserve: 'Choose This Flight',
  purchase: 'Your flight from',
  confirmation: 'Thank you for your purchase today!',
};
