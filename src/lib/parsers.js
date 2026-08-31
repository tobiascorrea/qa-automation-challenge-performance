/**
 * Utilitários de parsing das respostas do BlazeDemo.
 *
 * O k6 não executa JavaScript de página nem mantém um DOM completo, então
 * extraímos os campos ocultos do formulário de voo diretamente do HTML. Isso
 * torna o fluxo fiel ao comportamento real do usuário (escolher um voo da
 * lista) em vez de enviar dados fixos.
 */

/**
 * Extrai os dados do primeiro voo disponível na página de reserva.
 *
 * A página lista vários `<form action="purchase.php">`, cada um com inputs
 * ocultos `flight`, `price` e `airline`. Capturamos o primeiro conjunto.
 *
 * @param {string} html Corpo HTML da resposta de /reserve.php
 * @returns {{flight: string, price: string, airline: string} | null}
 */
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

/**
 * Casa o valor de um input oculto pelo atributo `name`, tolerando a ordem dos
 * atributos `name`/`value` (o BlazeDemo usa ambas as ordens no HTML).
 *
 * @param {string} html
 * @param {string} name
 * @returns {string | null}
 */
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
