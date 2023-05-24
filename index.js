let city;

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
            city = response.address.city;
            console.log(city);
        }
    }
}, error => {
    console.log(error);
}, {
    enableHighAccuracy: true,
    timeout: 10000
});