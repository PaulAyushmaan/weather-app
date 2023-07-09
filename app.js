const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');
const userInfoContainer = document.querySelector('.user-info-container');
const grantAccessContainer = document.querySelector(
	'.grant-location-container',
);
const searchForm = document.querySelector('[data-searchForm ]');
const searchInput = document.querySelector('[data-searchInput]');
const loadingScreen = document.querySelector('.loading-container');
const apiErrorContainer = document.querySelector('.api-error-container');
const apiErrorImg = document.querySelector('[data-notFoundImg]');
const apiErrorMessage = document.querySelector('[data-apiErrorText]');
const apiErrorBtn = document.querySelector('[data-apiErrorBtn]');

//Initially variables needed
let oldTab = userTab;
const API_KEY = '5c45add81eb98416818f4ce0941ffa01';
oldTab.classList.add('current-tab');
getfromSessionStorage();
function switchTab(newTab) {
	if (newTab !== oldTab) {
		oldTab.classList.remove('current-tab');
		oldTab = newTab;
		oldTab.classList.add('current-tab');
		if (!searchForm.classList.contains('active')) {
			userInfoContainer.classList.remove('active');
			grantAccessContainer.classList.remove('active');
			searchForm.classList.add('active');
		} else {
			searchForm.classList.remove('active');
			userInfoContainer.classList.remove('active');
			getfromSessionStorage();
		}
	}
}

userTab.addEventListener('click', () => {
	switchTab(userTab);
});
searchTab.addEventListener('click', () => {
	switchTab(searchTab);
});

function getfromSessionStorage() {
	const localCoordinates = sessionStorage.getItem('user-coordinates');
	if (!localCoordinates) {
		grantAccessContainer.classList.add('active');
	} else {
		const coordinates = JSON.parse(localCoordinates);
		fetchUserWeatherInfo(coordinates);
	}
}
async function fetchUserWeatherInfo(coordinates) {
	const { lat, lon } = coordinates;
	// make grant container invisible
	apiErrorContainer.classList.remove('active');
	grantAccessContainer.classList.remove('active');
	loadingScreen.classList.add('active');

	//API CALL
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
		);
		const data = await response.json();
		//console.log('User - Api Fetch Data', data);
		if (!data.sys) {
			throw data;
		}
		loadingScreen.classList.remove('active');
		userInfoContainer.classList.add('active');
		renderWeatherInfo(data);
	} catch (err) {
		loadingScreen.classList.remove('active');
		//console.log('User - Api Fetch Error', err.message);
		apiErrorContainer.classList.add('active');
		apiErrorImg.style.display = 'none';
		apiErrorMessage.innerText = `Error: ${err?.message}`;
		apiErrorBtn.addEventListener('click', fetchUserWeatherInfo);
	}
}

function renderWeatherInfo(weatherInfo) {
	const cityName = document.querySelector('[data-cityName]');
	const countryIcon = document.querySelector('[data-countryIcon]');
	const desc = document.querySelector('[data-weatherDesc]');
	const weatherIcon = document.querySelector('[data-weatherIcon]');
	const temp = document.querySelector('[data-temp]');
	const windSpeed = document.querySelector('[data-windspeed]');
	const humidity = document.querySelector('[data-humidity]');
	const cloudiness = document.querySelector('[data-cloudiness]');

	//fetch values from weather info object and put in UI element using optional chaining operator
	cityName.innerText = weatherInfo?.name;
	countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
	desc.innerText = weatherInfo?.weather?.[0]?.description;
	weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
	temp.innerText = `${weatherInfo?.main?.temp}°C`;
	windSpeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
	humidity.innerText = `${weatherInfo?.main?.humidity}%`;
	cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}
const grantAccessButton = document.querySelector('[data-grantAccess]');
const messageText = document.querySelector('[data-messageText]');
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		grantAccessButton.style.display = 'none';
		messageText.innerText = 'Geolocation is not supported by this browser.';
	}
}
function showPosition(position) {
	const userCoordinates = {
		lat: position.coords.latitude,
		lon: position.coords.longitude,
	};
	sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
	fetchUserWeatherInfo(userCoordinates);
}
grantAccessButton.addEventListener('click', getLocation);

searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	let cityName = searchInput.value;
	if (cityName === '') {
		return;
	} else {
		console.log(searchInput.value);
		fetchSearchWeatherInfo(cityName);
	}
});
async function fetchSearchWeatherInfo(city) {
	apiErrorContainer.classList.remove('active');
	loadingScreen.classList.add('active');
	userInfoContainer.classList.remove('active');
	grantAccessContainer.classList.remove('active');

	try {
		const res = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
		);
		const data = await res.json();
		//console.log('User - Api Fetch Data', data);
		if (!data.sys) {
			throw data;
		}
		loadingScreen.classList.remove('active');
		userInfoContainer.classList.add('active');
		renderWeatherInfo(data);
	} catch (err) {
		loadingScreen.classList.remove('active');
		//console.log('User - Api Fetch Error', err.message);
		apiErrorContainer.classList.add('active');
		apiErrorMessage.innerText = `${err?.message}`;
		apiErrorBtn.style.display = 'none';
	}
}
function showError(error) {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			messageText.innerHTML = 'User denied the request for Geolocation.';
			break;
		case error.POSITION_UNAVAILABLE:
			messageText.innerHTML = 'Location information is unavailable.';
			break;
		case error.TIMEOUT:
			messageText.innerHTML = 'The request to get user location timed out.';
			break;
		case error.UNKNOWN_ERROR:
			messageText.innerHTML = 'An unknown error occurred.';
			break;
	}
}
