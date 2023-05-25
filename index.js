var unitToggle = document.getElementById("unit-toggle");
var themeToggle = document.getElementById("theme-toggle");

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
        changeTheme();
        console.log(sessionStorage.getItem("theme"));
    }else{ //if units is set, load user settings
        if(sessionStorage.getItem("theme") == "light"){
            themeToggle.checked = false;
            changeTheme();
        }else if (sessionStorage.getItem("theme") == "dark"){
            themeToggle.checked = true;
            changeTheme();
        }
        console.log(sessionStorage.getItem("theme"));
    }
});

unitToggle.addEventListener("click", () => { //update units
    if (unitToggle.checked){ //if checked, set to metric
        sessionStorage.setItem("units", "metric");
        console.log(sessionStorage.getItem("units"));
    }else{ //if not checked, set to imperial
        sessionStorage.setItem("units", "imperial");
        console.log(sessionStorage.getItem("units"));
    }
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