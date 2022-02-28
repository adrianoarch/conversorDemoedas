const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

let internalExchangeRate = {}


const getUrl = currency => `https://v6.exchangerate-api.com/v6/e59db7bf43330f854181fe69/latest/${currency}`


const getErrormessage = (errorType) =>
  ({
    "unsupported-code": "A moeda não existe em nosso banco de dados.",
    "base-code-only-on-pro":
      "Informações de moedas que não sejam USD ou EUR só podem ser acessadas por outra plataforma",
    "malformed-request":
      "O endpoint do seu request precisa seguir a estrutura a seguir: https://v6.exchangerate-api.com",
    "invalid-key": "A chave da API não é válida",
    "quota-reached":
      "Esta conta alcançou o limite de requests permitidos neste plano",
    "not-available-on-plan": "Seu plano não permite este tipo de request",
  }[errorType] || "Não foi possível obter as informações.");

const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Sua conexão falhou. Não foi possível obter as informações."
      );
    }

    const exchangeRateData = await response.json();

    if (exchangeRateData.result === "error") {
      throw new Error(getErrormessage(exchangeRateData["error-type"]));
    }

    return exchangeRateData;
  } catch (err) {
    const div = document.createElement("div");
    const button = document.createElement("button");

    div.textContent = err.message;
    div.classList.add(
      "col-sm-3",
      "col-md-3",
      "offset-md-4",
      "col-xl-6",
      "offset-xl-3",
      "justify-content-center",
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show",
      "row"
    );
    div.setAttribute("role", "alert");
    button.classList.add("btn-close");
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", "Close");

    button.addEventListener("click", () => {
      div.remove();
    });

    div.appendChild(button);

    currenciesEl.insertAdjacentElement("afterend", div);
  }
};

const init = async () => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD')))}
  
  const getOptions = selectedCurrency => {
    return Object.keys(internalExchangeRate.conversion_rates)
      .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
      .join('');
  }

  currencyOneEl.innerHTML = getOptions('USD');
  currencyTwoEl.innerHTML = getOptions('BRL');

  convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(2)
  valuePrecisionEl.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL} BRL`
}

timesCurrencyOneEl.addEventListener('input', e => {
  convertedValueEl.textContent = (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyTwoEl.addEventListener('input', e => {
  const currencyTwoValue = (internalExchangeRate.conversion_rates[e.target.value])

  convertedValueEl.textContent = (timesCurrencyOneEl.value * currencyTwoValue).toFixed(2)
  valuePrecisionEl.textContent = `1 USD = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
})

currencyOneEl.addEventListener('input', async e => {
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl(e.target.value))) } 
})

init()

