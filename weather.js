
// ========================================
// IDEA MATES - WEATHER APPLICATION
// Fetch API + Open-Meteo
// ========================================

// HTML Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

// Weather descriptions
function getWeatherDescription(code) {

    const conditions = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Heavy Drizzle",
        56: "Freezing Drizzle",
        57: "Heavy Freezing Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        66: "Freezing Rain",
        67: "Heavy Freezing Rain",
        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Rain Showers",
        81: "Moderate Rain Showers",
        82: "Heavy Rain Showers",
        85: "Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Heavy Thunderstorm"
    };

    return conditions[code] || "Unknown Weather";
}

// Weather icons
function getWeatherIcon(code, rain) {

    if (rain > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        return "🌧️";
    }

    if ([95, 96, 99].includes(code)) {
        return "⛈️";
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "❄️";
    }

    if ([45, 48].includes(code)) {
        return "🌫️";
    }

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    return "☁️";
}

// Loading state
function showLoading() {

    message.innerHTML =
        '<span class="spinner"></span> Fetching weather data...';

    weatherCard.classList.add("hidden");

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";
}

// Error state
function showError(errorMessage) {

    message.textContent = errorMessage;

    weatherCard.classList.add("hidden");
}

// Main weather function
async function getWeather() {

    const city = cityInput.value.trim();

    // Validate input
    if (!city) {

        showError("Please enter a city name.");

        return;
    }

    try {

        showLoading();

        // STEP 1: Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find the city. Please try again.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // STEP 2: Fetch weather information
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,rain&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather information.");
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather information is unavailable.");
        }

        // STEP 3: Display weather
        displayWeather(location, weatherData.current);

        message.textContent = "";

    } catch (error) {

        if (error instanceof TypeError) {
            showError("Network error. Please check your internet connection.");
        } else {
            showError(error.message);
        }

    } finally {

        // Restore search button
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

// Display weather information
function displayWeather(location, current) {

    // City and country
    document.getElementById("cityName").textContent =
        location.name;

    document.getElementById("countryName").textContent =
        location.country || "";

    // Temperature
    document.getElementById("temperature").textContent =
        `${current.temperature_2m}°C`;

    // Weather description
    let description = getWeatherDescription(current.weather_code);

    if (current.rain > 0 || current.precipitation > 0) {
        description = "Rain";
    }

    document.getElementById("weatherDescription").textContent =
        description;

    // Weather icon
    document.getElementById("weatherIcon").textContent =
        getWeatherIcon(current.weather_code, current.rain);

    // Humidity
    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    // Wind speed
    document.getElementById("windSpeed").textContent =
        `${current.wind_speed_10m} km/h`;

    // Precipitation
    document.getElementById("precipitation").textContent =
        `${current.precipitation} mm`;

    // Rainfall
    document.getElementById("rainfall").textContent =
        `${current.rain} mm`;

    // Last updated time (browser display time)
    document.getElementById("lastUpdated").textContent =
        "Retrieved at: " + new Date().toLocaleTimeString();

    // Show weather card
    weatherCard.classList.remove("hidden");
}

// Search button click event
searchBtn.addEventListener("click", getWeather);

// Search using Enter key
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        getWeather();
    }

});
