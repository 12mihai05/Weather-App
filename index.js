const apikey = "9deff1d524ac6a36ba6eaef1ee940751";

const weatherDataEl = document.getElementById("weather-data")

const cityInputEl = document.getElementById("city-input")

const formEl = document.querySelector ("form")

const containerEl = document.querySelector(".container")

const forecastContainerEl = weatherDataEl.querySelector(".forecast-container");

const forecastSlideEl = weatherDataEl.querySelector(".forecast-slide");

let slideIndex = 0;

formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cityValue = cityInputEl.value;
    
    await addAnimations()

    await getWeatherData(cityValue);
  
    setTimeout(() => {
        removeAnimations()
    }, 500); 

    setTimeout(() => {
        cityInputEl.value = ''
    }, 500);
});

function showSlides() {
    const forecastHourEl = weatherDataEl.querySelector(".forecast-hour");
    forecastHourEl.style.transition = "transform 0.5s ease-in-out";

    const totalHours = 6; // replace 6 with the actual total number of forecast hours
    const containerWidth = forecastHourEl.parentElement.clientWidth; // replace parentElement with the actual container element
    
    forecastHourEl.style.transform = `translateX(${-slideIndex * (containerWidth / 10) + (containerWidth / (2 * 10))}px)`;
    
    // Remove transition after the animation ends
    setTimeout(() => {
        forecastHourEl.style.transition = "";
    }, 500);
}


function nextSlides() {
    slideIndex += 5;
    if (slideIndex >= 9) {
        slideIndex = 5;
    }
    showSlides();
}

function prevSlides() {
    slideIndex -= 5;
    if (slideIndex < 0) {
        slideIndex = 0; // Set to the last index in this case
    }
    showSlides();
}

function createForecastSlide(forecastIconHour, forecastTemperatureHour, hours) {
    return `<div class="hour">
                <div class="hour-icon"><img src="http://openweathermap.org/img/wn/${forecastIconHour}.png" alt="Weather Icon"></div>
                <div class="hour-temperature">${forecastTemperatureHour}°C</div>
                <div class="hour-time">${hours}<b>:</b>00</div>
            </div>`;
}





async function getWeatherData(cityValue){
    try {

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${apikey}&units=metric`);

        if(!response.ok){
            throw new Error("Network response was not ok")
        }

        const data = await response.json();

        console.log(data)

        const response2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityValue}&appid=${apikey}&units=metric`)


        if(!response2.ok){
            throw new Error("Network response was not ok")
        }

        const forecastData = await response2.json();

        console.log(forecastData)

        
        const cityName = forecastData.city.name

        const temperature = Math.round(data.main.temp)

        const description = data.weather[0].description

        const icon = data.weather[0].icon;

        const details = [
            `Feels like: ${Math.round(data.main.feels_like)}°C`,
            `Humidity: ${Math.round(data.main.humidity)}%`,
            `Wind speed: ${Math.round(data.wind.speed)} m/s`,
        ]

        const country = forecastData.city.country

        containerEl.querySelector(".title").innerHTML = `${cityName} - ${country}`

        weatherDataEl.querySelector(".icon").innerHTML = `<img src="http://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">`;

        weatherDataEl.querySelector(".temperature").textContent = `${temperature}°C`;

        weatherDataEl.querySelector(".description").textContent = `${description}`;

        weatherDataEl.querySelector(".details").innerHTML = details.map((detail)=> `<div>${detail}</div>`).join("");

        //Forecast for the next hours
        forecastSlideEl.style.display = "block"
        
        const forecastHourEl = weatherDataEl.querySelector(".forecast-hour");

        forecastHourEl.innerHTML = ""; // Clear the previous content

        for (let i = 0; i < 9; i++) {
            const forecastIconHour = forecastData.list[i].weather[0].icon;
            const forecastTemperatureHour = Math.round(forecastData.list[i].main.temp);

            const forecastTimeHour = forecastData.list[i].dt;
            const dates = new Date(forecastTimeHour * 1000);
            const hours = dates.getHours();
            const minutes = dates.getMinutes();

            // Check if the timestamp corresponds to the beginning of the hour
            if (minutes === 0) {
                forecastHourEl.innerHTML += createForecastSlide(forecastIconHour, forecastTemperatureHour, hours);
            }
        }

        showSlides();

        weatherDataEl.querySelector(".forecast-slide #prevButton").innerHTML = "&#8592;";
        weatherDataEl.querySelector(".forecast-slide #nextButton").innerHTML = "&#8594;";
        weatherDataEl.querySelector(".forecast-slide #prevButton").style.display = "block"
        weatherDataEl.querySelector(".forecast-slide #nextButton").style.display = "block"

        //Forecast of the next 5 days

        forecastContainerEl.style.display = 'flex';
        
        let mySet = new Set();

        const sumTemp = {};
        const count = {};

        for (let j = 0; j < 40; j++) {
            const forecastIcon = forecastData.list[j].weather[0].icon;
            const forecastTemperature = Math.round(forecastData.list[j].main.temp);

            const timestamp = forecastData.list[j].dt;
            const date = new Date(timestamp * 1000);
            const dayOfWeek = date.getDay();
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = daysOfWeek[dayOfWeek];

            if (!(mySet.has(dayName))) {
                mySet.add(dayName);
                if (!sumTemp[dayName]) {
                    sumTemp[dayName] = 0;
                    count[dayName] = 0;
                }
                sumTemp[dayName] += forecastTemperature;
                count[dayName]++;

                const averageTemperature = Math.round(sumTemp[dayName] / count[dayName]);

                const i = mySet.size;

                if (i < 6) {
                    forecastContainerEl.querySelector(`.forecast-${i}`).querySelector(`.forecastIcon-${i}`).innerHTML = `<img src="http://openweathermap.org/img/wn/${forecastIcon}.png" alt="Weather Icon">`;
                    forecastContainerEl.querySelector(`.forecast-${i}`).querySelector(`.forecastTemperature-${i}`).innerHTML = `${averageTemperature}°C`;
                    forecastContainerEl.querySelector(`.forecast-${i}`).querySelector(`.forecastDay-${i}`).innerHTML = `${dayName}`;
                } else {
                    break;
                }
            }
        }

        //Change the background depending on the weather

       await checkBackground()

       


    } catch (error) {
        containerEl.querySelector(".title").innerHTML = "Weather App"

        weatherDataEl.querySelector(".icon").innerHTML = "";

        weatherDataEl.querySelector(".temperature").textContent = "";

        weatherDataEl.querySelector(".description").textContent = "An error happend, try again later";

        weatherDataEl.querySelector(".details").innerHTML = "";
        
        forecastContainerEl.style.display = "none";
        
        forecastSlideEl.style.display = "none"
    }

}

async function checkBackground(){
    try{
    const cityValue = cityInputEl.value;

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${apikey}&units=metric`);

        if(!response.ok){
            throw new Error("Network response was not ok")
        }

        const data = await response.json();

        const id = data.weather[0].id;

        console.log(id)
        console.log("City Value:", cityValue);
        console.log("Response Status:", response.status);


        switch(firstDigit(id)){
            case 2:
                document.body.style.background = 'url(GIFs/Thunderstorm.gif) no-repeat center center fixed'
                document.body.style.backgroundSize = 'cover'
                break
            case 3:
                document.body.style.background = 'url(GIFs/Drizzle.gif) no-repeat center center fixed'
                document.body.style.backgroundSize = 'cover'
                break
            case 5:
                document.body.style.background = 'url(GIFs/Rain.gif) no-repeat center center fixed'
                document.body.style.backgroundSize = 'cover'
                break
            case 7:
                document.body.style.background = 'url(GIFs/Fog.gif) no-repeat center center fixed';
                document.body.style.backgroundSize = 'cover';
                break
            case 6:
                document.body.style.background = 'url(GIFs/Snow.gif) no-repeat center center fixed';
                document.body.style.backgroundSize = 'cover';
                break
        }

        if(id == 800){
            document.body.style.background = 'url(GIFs/ClearSky.gif) no-repeat center center fixed'
            document.body.style.backgroundSize = 'cover'
        }else if(id%10 != 0 && firstDigit(id) == 8){
            document.body.style.background = 'url(GIFs/Clouds.gif) no-repeat center center fixed'
            document.body.style.backgroundSize = 'cover'
        }

    }catch (error){
        document.body.style.backgroundColor = 'white'
    }
}

function firstDigit(num) {
   
    const matches = String(num).match(/\d/);

    const digit = Number(matches[0]);
    
    return (num < 0) ? -digit : digit;
}

function addAnimations(){    
    weatherDataEl.classList.add("animate");
    containerEl.querySelector(".title").classList.add("animate")
}

function removeAnimations(){
    weatherDataEl.classList.remove("animate");
    containerEl.querySelector(".title").classList.remove("animate")
}

document.getElementById("nextButton").addEventListener("click", nextSlides);
document.getElementById("prevButton").addEventListener("click", prevSlides);