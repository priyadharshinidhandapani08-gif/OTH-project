const tempElem = document.getElementById("temp");
const descElem = document.getElementById("desc");
const detailsElem = document.getElementById("details");
const weatherIconElem = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecast");

function getWeatherIconUrl(code) {
  const iconMap = {
    0: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-day-sunny.svg",
    1: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-day-sunny-overcast.svg",
    2: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-day-cloudy.svg",
    3: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-cloudy.svg",
    45: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-fog.svg",
    48: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-fog.svg",
    51: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-sprinkle.svg",
    53: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-sprinkle.svg",
    55: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-rain.svg",
    61: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-rain.svg",
    63: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-rain.svg",
    65: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-rain.svg",
    71: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-snow.svg",
    73: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-snow.svg",
    75: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-snow.svg",
    95: "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-thunderstorm.svg"
  };
  return iconMap[code] || "https://cdn.jsdelivr.net/gh/erikflowers/weather-icons@master/svg/wi-na.svg";
}

function weatherDesc(code) {
  const map = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Light snow", 73: "Moderate snow", 75: "Heavy snow",
    95: "Thunderstorm"
  };
  return map[code] || "Unknown";
}

async function getCoords(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, country: data.results[0].country };
  }
  return null;
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const res = await fetch(url);
  return await res.json();
}

function displayWeather(cityName, country, data) {
  if (!data || !data.current_weather) {
    tempElem.textContent = "--°C";
    descElem.textContent = "Weather data unavailable";
    detailsElem.innerHTML = "";
    weatherIconElem.src = "";
    return;
  }

  const current = data.current_weather;
  tempElem.textContent = `${current.temperature}°C`;
  descElem.textContent = `${cityName}, ${country} — ${weatherDesc(current.weathercode)}`;
  weatherIconElem.src = getWeatherIconUrl(current.weathercode);
  weatherIconElem.alt = weatherDesc(current.weathercode);
  detailsElem.innerHTML = `<div class="chip">💨 Wind: ${current.windspeed} km/h</div>`;

  forecastContainer.innerHTML = "";
  for (let i = 0; i < data.daily.time.length && i < 5; i++) {
    const date = data.daily.time[i];
    const min = data.daily.temperature_2m_min[i];
    const max = data.daily.temperature_2m_max[i];
    const desc = weatherDesc(data.daily.weathercode[i]);

    const card = document.createElement("div");
    card.className = "forecast-item";
    card.innerHTML = `
      <span>${date}</span>
      <span>${desc}</span>
      <span>🌡️ ${min}°C - ${max}°C</span>
    `;
    forecastContainer.appendChild(card);
  }
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  const coords = await getCoords(city);
  if (!coords) {
    tempElem.textContent = "--°C";
    descElem.textContent = "City not found";
    detailsElem.innerHTML = "";
    weatherIconElem.src = "";
    forecastContainer.innerHTML = "";
    return;
  }
  const data = await getWeather(coords.lat, coords.lon);
  displayWeather(coords.name, coords.country, data);
});

document.getElementById("locBtn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const data = await getWeather(lat, lon);
    displayWeather("Your Location", "", data);
  }, () => {
    tempElem.textContent = "--°C";
    descElem.textContent = "Location denied or unavailable";
    detailsElem.innerHTML = "";
    weatherIconElem.src = "";
    forecastContainer.innerHTML = "";
  });
});
