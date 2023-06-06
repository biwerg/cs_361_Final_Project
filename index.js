var unitToggle = document.getElementById("unit-toggle");
var themeToggle = document.getElementById("theme-toggle");
var weatherAPIKey = "PPBWQVX6NDHXD76VNQLDDW3TA";
var searchButton = document.getElementById("search-button");
var currentLocation = document.getElementById("location");
var searchInput = document.getElementById("search-bar");
var icon = document.getElementById("icon");
var weatherDescription = document.getElementById("weather");

document.addEventListener("DOMContentLoaded", () =>{
    

    if(!localStorage.getItem("location")){
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
                    localStorage.setItem("location", response.address.city + ", " + response.address.state + ", " + response.address.country);
                    console.log(localStorage.getItem("location"));
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
        console.log(localStorage.getItem("location"));
        getWeather();
    }

    //Load user settings
    if(!localStorage.getItem("units")){ //if units is not set, set to imperial
        localStorage.setItem("units", "imperial");
        unitToggle.checked = false;
        changeTemp();
    }else{ //if units is set, load user settings
        if(localStorage.getItem("units") == "imperial"){
            unitToggle.checked = false;
        }else if (localStorage.getItem("units") == "metric"){
            unitToggle.checked = true;
        }
        changeTemp();
    }

    if(!localStorage.getItem("theme")){ //if theme is not set, set to light
        localStorage.setItem("theme", "light");
        themeToggle.checked = false;
        changeTheme();
    }else{ //if units is set, load user settings
        if(localStorage.getItem("theme") == "light"){
            themeToggle.checked = false;
        }else if (localStorage.getItem("theme") == "dark"){
            themeToggle.checked = true;
        }
        changeTheme();
    }
});

document.addEventListener("keyup", e => {
    if(e.key == "Enter"){
        let tempOverride = document.getElementById("temp-box");
        if(tempOverride.value != ""){
            localStorage.setItem("currentTemp", tempOverride.value);
            tempOverride.value = "";
            changeTemp();
        }else{
            searchButton.click();
        }
    }
});


unitToggle.addEventListener("click", () => { //update units
    if (unitToggle.checked){ //if checked, set to metric
        localStorage.setItem("units", "metric");
    }else{ //if not checked, set to imperial
        localStorage.setItem("units", "imperial");
    }
    changeTemp();
});

themeToggle.addEventListener("click", () => {
    if (themeToggle.checked){
        localStorage.setItem("theme", "dark");
    }else{
        localStorage.setItem("theme", "light");
    }
    changeTheme();
});

function changeTheme(){
    if(localStorage.getItem("theme") == "dark"){
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
    if(localStorage.getItem("units") == "metric"){
        document.getElementById("temp").innerHTML = Math.round((localStorage.getItem("currentTemp") - 32) * (5/9)) + " °C";
        document.getElementById("day1-temp").innerHTML = Math.round((localStorage.getItem("day1Temp") - 32) * (5/9)) + " °C";
        document.getElementById("day2-temp").innerHTML = Math.round((localStorage.getItem("day2Temp") - 32) * (5/9)) + " °C";
        document.getElementById("day3-temp").innerHTML = Math.round((localStorage.getItem("day3Temp") - 32) * (5/9)) + " °C";
    }else{
        document.getElementById("temp").innerHTML = Math.round(localStorage.getItem("currentTemp")) + " °F";
        document.getElementById("day1-temp").innerHTML = Math.round(localStorage.getItem("day1Temp")) + " °F";
        document.getElementById("day2-temp").innerHTML = Math.round(localStorage.getItem("day2Temp")) + " °F";
        document.getElementById("day3-temp").innerHTML = Math.round(localStorage.getItem("day3Temp")) + " °F";
    }
    changeIcon();
}

async function getWeather(){
    let currentEpoch = Math.round((new Date()).getTime() / 1000.0);
    let forecastEpoch = currentEpoch + 259200;
    let currentEpochHour = currentEpoch - (currentEpoch % 3600);
    let location = localStorage.getItem("location");
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

        localStorage.setItem("weatherData", JSON.stringify(data));
        console.log(JSON.parse(localStorage.weatherData));
        locationFound = true;
    }catch{
        alert("Location not found");
        return;
    }
    
    //Parse response for current temperature of the current hour
    for(var i = 0; i < 24; i++){
        if(JSON.parse(localStorage.weatherData).days[0].hours[i].datetimeEpoch == currentEpochHour){
            localStorage.setItem("currentTemp", JSON.parse(localStorage.weatherData).days[0].hours[i].temp); //Stored in F
        }
    }

    //Parse response for temperature of the next 3 days
    localStorage.setItem("day1Temp", JSON.parse(localStorage.weatherData).days[1].hours[12].temp); //Stored in F
    localStorage.setItem("day2Temp", JSON.parse(localStorage.weatherData).days[2].hours[12].temp); //Stored in F
    localStorage.setItem("day3Temp", JSON.parse(localStorage.weatherData).days[3].hours[12].temp); //Stored in F

    //Update location to resolved location
    localStorage.setItem("location", JSON.parse(localStorage.weatherData).resolvedAddress);
    console.log(localStorage.getItem("currentTemp"));
    changeTemp();
    changeLocation();
}

function changeLocation(){
    document.getElementById("location").innerHTML = "Weather in " + localStorage.getItem("location");
}

searchButton.addEventListener("click", () => {
    if (!(searchInput.value == "")){
        localStorage.setItem("location", searchInput.value);
        searchInput.value = "";
    }
    getWeather();
});

function changeIcon(){
    let description = JSON.parse(localStorage.weatherData).days[0].icon;
    while(description.includes("-")){
        description = description.replace("-", " ");
    }
    weatherDescription.innerHTML = description;
    icon.src = "icons/" + JSON.parse(localStorage.weatherData).days[0].icon + ".png";

    let day1Description = JSON.parse(localStorage.weatherData).days[1].icon;
    while(day1Description.includes("-")){
        day1Description = day1Description.replace("-", " ");
    }
    document.getElementById("day1-weather").innerHTML = day1Description;
    document.getElementById("day1-icon").src = "icons/" + JSON.parse(localStorage.weatherData).days[1].icon + ".png";

    let day2Description = JSON.parse(localStorage.weatherData).days[2].icon;
    while(day2Description.includes("-")){
        day2Description = day2Description.replace("-", " ");
    }
    document.getElementById("day2-weather").innerHTML = day2Description;
    document.getElementById("day2-icon").src = "icons/" + JSON.parse(localStorage.weatherData).days[2].icon + ".png";

    let day3Description = JSON.parse(localStorage.weatherData).days[3].icon;
    while(day3Description.includes("-")){
        day3Description = day3Description.replace("-", " ");
    }
    document.getElementById("day3-weather").innerHTML = day3Description;
    document.getElementById("day3-icon").src = "icons/" + JSON.parse(localStorage.weatherData).days[3].icon + ".png";

    changeDay();
    changeAdvisory();
}

function changeDay(){
    let day = new Date().getDay();
    console.log(day);
    let day1 = document.getElementById("day1-day");
    let day2 = document.getElementById("day2-day");
    let day3 = document.getElementById("day3-day");

    switch(day){
        case 0:
            day1.innerHTML = "Monday";
            day2.innerHTML = "Tuesday";
            day3.innerHTML = "Wednesday";
            break;
        case 1:
            day1.innerHTML = "Tuesday";
            day2.innerHTML = "Wednesday";
            day3.innerHTML = "Thursday";
            break;
        case 2:
            day1.innerHTML = "Wednesday";
            day2.innerHTML = "Thursday";
            day3.innerHTML = "Friday";
            break;
        case 3:
            day1.innerHTML = "Thursday";
            day2.innerHTML = "Friday";
            day3.innerHTML = "Saturday";
            break;
        case 4:
            day1.innerHTML = "Friday";
            day2.innerHTML = "Saturday";
            day3.innerHTML = "Sunday";
            break;
        case 5:
            day1.innerHTML = "Saturday";
            day2.innerHTML = "Sunday";
            day3.innerHTML = "Monday";
            break;
        case 6:
            day1.innerHTML = "Sunday";
            day2.innerHTML = "Monday";
            day3.innerHTML = "Tuesday";
            break;
    }
}

function changeAdvisory(){
    let advisory = document.getElementById("advisory");
    let advisoryIcon = document.getElementById("advisory-icon");

    if(localStorage.getItem("currentTemp") > 90){
        advisory.innerHTML = "Heat Advisory";
        advisoryIcon.src = "advisory/heat.jpg";
    }
    else if(localStorage.getItem("currentTemp") < 32){
        advisory.innerHTML = "Freeze Advisory";
        advisoryIcon.src = "advisory/freeze.jpg";
    }
    else{
        advisory.innerHTML = "No Advisory";
        advisoryIcon.src = "advisory/temp.jpg";
    }
}