var unitToggle = document.getElementById("unit-toggle");
var themeToggle = document.getElementById("theme-toggle");
var weatherAPIKey = "PPBWQVX6NDHXD76VNQLDDW3TA";
var searchButton = document.getElementById("search-button");
var currentLocation = document.getElementById("location");
var searchInput = document.getElementById("search-bar");
var icon = document.getElementById("icon");
var weatherDescription = document.getElementById("weather");

document.addEventListener("DOMContentLoaded", () =>{
    //Load user settings
    if(!sessionStorage.getItem("units")){ //if units is not set, set to imperial
        sessionStorage.setItem("units", "imperial");
        unitToggle.checked = false;
        changeTemp();
    }else{ //if units is set, load user settings
        if(sessionStorage.getItem("units") == "imperial"){
            unitToggle.checked = false;
        }else if (sessionStorage.getItem("units") == "metric"){
            unitToggle.checked = true;
        }
        changeTemp();
    }

    if(!sessionStorage.getItem("location")){
        //gets coordinates of user
        navigator.geolocation.getCurrentPosition(position => {
            let xhr = new XMLHttpRequest();
            let lat = position.coords.latitude;
            let long = position.coords.longitude;

            //get city location based off lat and long
            xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.02913a526689198095cd52798b3bc086&lat=" +
                lat + "&lon=" + long + "&format=json", true);
            xhr.send();

            //parse JSON response and update location
            xhr.onreadystatechange = e => {
                if(xhr.readyState == 4 && xhr.status == 200){
                    let response = JSON.parse(xhr.responseText);
                    sessionStorage.setItem("location", response.address.city + ", " + response.address.state + ", " + response.address.country);
                    console.log(sessionStorage.getItem("location"));
                    getWeather();
                }
            }
        }, error => {
            console.log(error);
        }, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    }else{
        console.log(sessionStorage.getItem("location"));
        getWeather();
    }

    

    if(!sessionStorage.getItem("theme")){ //if theme is not set, set to light
        sessionStorage.setItem("theme", "light");
        themeToggle.checked = false;
        changeTheme();
    }else{ //if units is set, load user settings
        if(sessionStorage.getItem("theme") == "light"){
            themeToggle.checked = false;
        }else if (sessionStorage.getItem("theme") == "dark"){
            themeToggle.checked = true;
        }
        changeTheme();
    }
});

unitToggle.addEventListener("click", () => { //update units
    if (unitToggle.checked){ //if checked, set to metric
        sessionStorage.setItem("units", "metric");
    }else{ //if not checked, set to imperial
        sessionStorage.setItem("units", "imperial");
    }
    changeTemp();
});

themeToggle.addEventListener("click", () => {
    if (themeToggle.checked){
        sessionStorage.setItem("theme", "dark");
    }else{
        sessionStorage.setItem("theme", "light");
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
        document.getElementById("day1-temp").innerHTML = Math.round((sessionStorage.getItem("day1Temp") - 32) * (5/9)) + " °C";
        document.getElementById("day2-temp").innerHTML = Math.round((sessionStorage.getItem("day2Temp") - 32) * (5/9)) + " °C";
        document.getElementById("day3-temp").innerHTML = Math.round((sessionStorage.getItem("day3Temp") - 32) * (5/9)) + " °C";
    }else{
        document.getElementById("temp").innerHTML = Math.round(sessionStorage.getItem("currentTemp")) + " °F";
        document.getElementById("day1-temp").innerHTML = Math.round(sessionStorage.getItem("day1Temp")) + " °F";
        document.getElementById("day2-temp").innerHTML = Math.round(sessionStorage.getItem("day2Temp")) + " °F";
        document.getElementById("day3-temp").innerHTML = Math.round(sessionStorage.getItem("day3Temp")) + " °F";
    }
}

async function getWeather(){
    let currentEpoch = Math.round((new Date()).getTime() / 1000.0);
    let forecastEpoch = currentEpoch + 259200;
    let currentEpochHour = currentEpoch - (currentEpoch % 3600);
    let location = sessionStorage.getItem("location");
    let locationFound = false;
    //Remove all spaces from location
    while(location.includes(" ")){
        location = location.replace(" ", "");
    }

    var apiFetch = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"+ location + "/" + currentEpoch + "/" + forecastEpoch + "?&key=" + weatherAPIKey;
    console.log(apiFetch);

    try{
        let res = await fetch(apiFetch);
        let data = await res.json();

        sessionStorage.setItem("weatherData", JSON.stringify(data));
        console.log(JSON.parse(sessionStorage.weatherData));
        locationFound = true;
    }catch{
        alert("Location not found");
        return;
    }
    
    //Parse response for current temperature of the current hour
    for(var i = 0; i < 24; i++){
        if(JSON.parse(sessionStorage.weatherData).days[0].hours[i].datetimeEpoch == currentEpochHour){
            sessionStorage.setItem("currentTemp", JSON.parse(sessionStorage.weatherData).days[0].hours[i].temp); //Stored in F
        }
    }

    //Update location to resolved location
    sessionStorage.setItem("location", JSON.parse(sessionStorage.weatherData).resolvedAddress);
    console.log(sessionStorage.getItem("currentTemp"));
    changeTemp();
    changeLocation();
    changeIcon();
}

function changeLocation(){
    document.getElementById("location").innerHTML = "Weather in " + sessionStorage.getItem("location");
}

searchButton.addEventListener("click", () => {
    if (!(searchInput.value == "")){
        sessionStorage.setItem("location", searchInput.value);
    }
    getWeather();
});

function changeIcon(){
    let description = JSON.parse(sessionStorage.weatherData).days[0].icon;
    while(description.includes("-")){
        description = description.replace("-", " ");
    }
    weatherDescription.innerHTML = description;
    icon.src = "icons/" + JSON.parse(sessionStorage.weatherData).days[0].icon + ".png";
}