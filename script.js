let display = document.getElementById('display');
let currentValue = '0';
let exchangeRates = {};
const API_KEY = '487eb7b04e274b821a47c3e4cbdb814a'; // Replace with your actual API key

async function fetchExchangeRates() {
    try {
        const response = await fetch(`http://api.exchangeratesapi.io/v1/latest?access_key=${API_KEY}`);
        const data = await response.json();
        exchangeRates = data.rates;
        exchangeRates[data.base] = 1; // Add base currency (usually EUR) to the rates
        populateCurrencyDropdowns();
        updateLastUpdated(data.timestamp);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        display.textContent = 'Error fetching rates';
    }
}

function populateCurrencyDropdowns() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    for (let currency in exchangeRates) {
        let option = new Option(currency, currency);
        fromCurrency.add(option);
        
        option = new Option(currency, currency);
        toCurrency.add(option);
    }

    // Set default values
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
}

function updateLastUpdated(timestamp) {
    const date = new Date(timestamp * 1000);
    document.getElementById('lastUpdated').textContent = `Last updated: ${date.toLocaleString()}`;
}

function updateDisplay() {
    display.textContent = currentValue;
}

function appendNumber(num) {
    if (currentValue === '0') {
        currentValue = num.toString();
    } else {
        currentValue += num.toString();
    }
    updateDisplay();
}

function appendDecimal() {
    if (!currentValue.includes('.')) {
        currentValue += '.';
        updateDisplay();
    }
}

function clearDisplay() {
    currentValue = '0';
    updateDisplay();
}

function backspace() {
    currentValue = currentValue.slice(0, -1);
    if (currentValue === '') currentValue = '0';
    updateDisplay();
}

async function convert() {
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const amount = parseFloat(currentValue);

    if (isNaN(amount)) {
        display.textContent = 'Error';
        return;
    }

    try {
        // Convert to base currency (EUR) first, then to target currency
        const amountInEUR = amount / exchangeRates[fromCurrency];
        const result = (amountInEUR * exchangeRates[toCurrency]).toFixed(2);
        display.textContent = `${result} ${toCurrency}`;
    } catch (error) {
        console.error('Error during conversion:', error);
        display.textContent = 'Conversion error';
    }
}

document.getElementById('swapCurrencies').addEventListener('click', function() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
});

// Initialize
fetchExchangeRates();
updateDisplay();