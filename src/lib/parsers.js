export function extractFirstFlight(html) {
  if (!html) {
    return null;
  }

  const flight = matchHiddenInput(html, 'flight');
  const price = matchHiddenInput(html, 'price');
  const airline = matchHiddenInput(html, 'airline');

  if (!flight || !price || !airline) {
    return null;
  }

  return { flight, price, airline };
}

function matchHiddenInput(html, name) {
  const valueThenName = new RegExp(
    `<input[^>]*value=["']([^"']*)["'][^>]*name=["']${name}["']`,
    'i',
  );
  const nameThenValue = new RegExp(
    `<input[^>]*name=["']${name}["'][^>]*value=["']([^"']*)["']`,
    'i',
  );

  const first = html.match(valueThenName);
  if (first) {
    return first[1];
  }

  const second = html.match(nameThenValue);
  return second ? second[1] : null;
}
