var unitToggle = document.getElementById("unit-toggle");
var themeToggle = document.getElementById("theme-toggle");
var weatherAPIKey = "PPBWQVX6NDHXD76VNQLDDW3TA";
var searchButton = document.getElementById("search-button");

document.addEventListener("DOMContentLoaded", () =>{
    if(!sessionStorage.getItem("city")){
        //gets coordinates of user
        navigator.geolocation.getCurrentPosition(position => {
            let xhr = new XMLHttpRequest();
            let lat = position.coords.latitude;
            let long = position.coords.longitude;

            //get city location based off lat and long
            xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.02913a526689198095cd52798b3bc086&lat=" +
                lat + "&lon=" + long + "&format=json", true);
            xhr.send();

            //parse JSON response and update city
            xhr.onreadystatechange = e => {
                if(xhr.readyState == 4 && xhr.status == 200){
                    let response = JSON.parse(xhr.responseText);
                    sessionStorage.setItem("city", response.address.city);
                    sessionStorage.setItem("state", response.address.state);
                    sessionStorage.setItem("country", response.address.country);
                    console.log(sessionStorage.getItem("city"));
                }
            }
        }, error => {
            console.log(error);
        }, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    }else{
        console.log(sessionStorage.getItem("city"));
        console.log(sessionStorage.getItem("state"));
        console.log(sessionStorage.getItem("country"));
    }

    //Load user settings
    if(!sessionStorage.getItem("units")){ //if units is not set, set to imperial
        sessionStorage.setItem("units", "imperial");
        unitToggle.checked = false;
        console.log(sessionStorage.getItem("units"));
    }else{ //if units is set, load user settings
        if(sessionStorage.getItem("units") == "imperial"){
            unitToggle.checked = false;
        }else if (sessionStorage.getItem("units") == "metric"){
            unitToggle.checked = true;
        }
        console.log(sessionStorage.getItem("units"));
    }

    if(!sessionStorage.getItem("theme")){ //if theme is not set, set to light
        sessionStorage.setItem("theme", "light");
        themeToggle.checked = false;
        console.log(sessionStorage.getItem("theme"));
    }else{ //if units is set, load user settings
        if(sessionStorage.getItem("theme") == "light"){
            themeToggle.checked = false;
        }else if (sessionStorage.getItem("theme") == "dark"){
            themeToggle.checked = true;
        }
        console.log(sessionStorage.getItem("theme"));
    }
    getWeather();
    changeTheme();
    changeTemp();
});

unitToggle.addEventListener("click", () => { //update units
    if (unitToggle.checked){ //if checked, set to metric
        sessionStorage.setItem("units", "metric");
        console.log(sessionStorage.getItem("units"));
    }else{ //if not checked, set to imperial
        sessionStorage.setItem("units", "imperial");
        console.log(sessionStorage.getItem("units"));
    }
    changeTemp();
});

themeToggle.addEventListener("click", () => {
    if (themeToggle.checked){
        sessionStorage.setItem("theme", "dark");
        console.log(sessionStorage.getItem("theme"));
    }else{
        sessionStorage.setItem("theme", "light");
        console.log(sessionStorage.getItem("theme"));
    }
    changeTheme();
});

function changeTheme(){
    if(sessionStorage.getItem("theme") == "dark"){
        document.getElementById("body").style.backgroundColor = "#4c566a";
        document.getElementById("body").style.color = "#d8dee9";
        var siteTitle = document.getElementById("site-title");
        siteTitle.getElementsByTagName("a")[0].style.color = "#d8dee9";
    }else{
        document.getElementById("body").style.backgroundColor = "#d8dee9";
        document.getElementById("body").style.color = "#4c566a";
        var siteTitle = document.getElementById("site-title");
        siteTitle.getElementsByTagName("a")[0].style.color = "#4c566a";
    }
}

function changeTemp(){
    if(sessionStorage.getItem("units") == "metric"){
        document.getElementById("temp").innerHTML = Math.round((sessionStorage.getItem("currentTemp") - 32) * (5/9)) + " °C";
    }else{
        document.getElementById("temp").innerHTML = Math.round(sessionStorage.getItem("currentTemp")) + " °F";
    }
}

async function getWeather(){
    let currentEpoch = Math.round((new Date()).getTime() / 1000.0);
    let forecastEpoch = currentEpoch + 259200;
    let currentEpochHour = currentEpoch - (currentEpoch % 3600);
    console.log("getWeather() called");
    let city = sessionStorage.getItem("city");
    let state = sessionStorage.getItem("state");
    let country = sessionStorage.getItem("country");
    //Remove all spaces from location
    while(city.includes(" ")){
        city = city.replace(" ", "");
    }
    while(state.includes(" ")){
        state = state.replace(" ", "");
    }
    while(country.includes(" ")){
        country = country.replace(" ", "");
    }

    var apiFetch = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"+ city + "," + state + "," + country + "/" + currentEpoch + "/" + forecastEpoch + "?&key=" + weatherAPIKey;
    console.log(apiFetch);

    try{
        let res = await fetch(apiFetch);
        let data = await res.json();

        sessionStorage.setItem("weatherData", JSON.stringify(data));
        console.log(JSON.parse(sessionStorage.weatherData));
    }catch{
        throw new Error("Error fetching from weather API");
    }
    
    //Parse response for current temperature of the current hour
    for(var i = 0; i < 24; i++){
        if(JSON.parse(sessionStorage.weatherData).days[0].hours[i].datetimeEpoch == currentEpochHour){
            sessionStorage.setItem("currentTemp", JSON.parse(sessionStorage.weatherData).days[0].hours[i].temp); //Stored in F
        }
    }

    console.log(sessionStorage.getItem("currentTemp"));
    changeTemp();
}

searchButton.addEventListener("click", () => {
    getWeather();
});