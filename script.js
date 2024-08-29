let display = document.getElementById('display');
let currentValue = '0';
let exchangeRates = {};
const EXCHANGE_RATES_API_KEY = '487eb7b04e274b821a47c3e4cbdb814a'; // Replace with your actual API key

async function fetchExchangeRates() {
    try {
        const response = await fetch(`https://api.exchangeratesapi.io/v1/latest?access_key=${EXCHANGE_RATES_API_KEY}`);
        const data = await response.json();
        exchangeRates = data.rates;
        exchangeRates[data.base] = 1; // Add base currency (usually EUR) to the rates
        await getUserLocation();
        populateCurrencyDropdowns();
        updateLastUpdated(data.timestamp);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        display.textContent = 'Error fetching rates';
    }
}

async function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            await getCurrencyFromCoords(latitude, longitude);
        }, error => {
            console.error('Geolocation error:', error);
            getUserCurrencyByIP(); // Fallback to IP-based location if Geolocation fails
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        getUserCurrencyByIP(); // Fallback to IP-based location if Geolocation is not available
    }
}

async function getCurrencyFromCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const locationData = await response.json();
        const country = locationData.countryName;
        const userCurrency = countryToCurrency(country);
        
        if (userCurrency && exchangeRates[userCurrency]) {
            document.getElementById('fromCurrency').value = userCurrency;
        }
    } catch (error) {
        console.error('Error getting currency from coordinates:', error);
    }
}

function getUserCurrencyByIP() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(locationData => {
            const userCurrency = locationData.currency;
            if (userCurrency && exchangeRates[userCurrency]) {
                document.getElementById('fromCurrency').value = userCurrency;
            }
        })
        .catch(error => console.error('Error getting user location by IP:', error));
}

function countryToCurrency(country) {
    const countryCurrencyMap = {
        'United States': 'USD',
        'Canada': 'CAD',
        'United Kingdom': 'GBP',
        'European Union': 'EUR',
        // Add more mappings as needed
    };
    return countryCurrencyMap[country] || 'USD'; // Default to USD if the country is not mapped
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

    // Set default values if not already set
    if (!fromCurrency.value) fromCurrency.value = 'USD';
    if (!toCurrency.value) toCurrency.value = 'EUR';
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
