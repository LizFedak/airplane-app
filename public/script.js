async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
let map;
let markers = [];


function createMarkers(flightData) {

    console.log(flightData, 19)
    for (let i = 0; i < flightData.length; i++) {
        let flightInfo = flightData[i];
        let marker = new google.maps.Marker({
            position: { lat: flightInfo.lat, lng: flightInfo.lon },
            map: map,
            title: flightInfo.flight,
            visible: true,
        });
        markers.push(marker);
    }
}

function initMap(flights) {
    // Initialize your map and create markers as needed
    // Example:
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.0150, lng: -105.2705 },
        zoom: 8,
    });

    // Create markers for each flight
    createMarkers(flights.coordinateData);
}

let uniqueFlightIds;
async function init() {
    try {
        // Fetch uniqueFlightIds data
        const uniqueFlightIdsData = await fetchData('/api/uniqueFlightIds');
        uniqueFlightIds = uniqueFlightIdsData;
        console.log(uniqueFlightIdsData, 34)
        // Populate the dropdown
        const container = document.getElementById('container');
 

        uniqueFlightIdsData.forEach(item => {
            const radioDiv = document.createElement('div');
            radioDiv.className = 'radio-button-group visible';
            radioDiv.id = `group-${item}`;  
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'flightRadio';
            radioInput.value = item;
            radioInput.id = item; 
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = item;
            radioLabel.textContent = item;
            radioDiv.appendChild(radioInput);
            radioDiv.appendChild(radioLabel);
            container.appendChild(radioDiv);
        });

        // Fetch coordinateData
        const coordinateData = await fetchData('/api/coordinateData');

        // Now you can use the Google Maps API
        initMap(coordinateData);
    } catch (error) {
        // Handle errors
        console.error('Error in initialization:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);


document.getElementById('toggle').addEventListener('click', function() {
    let container  = document.getElementById('container');
    if (container.classList.contains("open")) {
        container.classList.remove('open')
    } else {
        container.classList.add('open')
    }
})






function filterFlightOptionsDOM() {
    const searchQuery = document.getElementById('search').value.toLowerCase();

    uniqueFlightIds.forEach(flight => {
    let id = `group-${flight}`
        const flightElement = document.getElementById(id);
        const isVisible = flight.toLowerCase().includes(searchQuery);
        flightElement.style.display = isVisible ? 'block' : 'none';
    });
}

// Helper function to add markers based on coordinate data
function addMarkersForFlight(flightData) {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = []; // Clear the markers array

    // Create markers for the new flight data
    flightData.forEach(flightInfo => {
        const marker = new google.maps.Marker({
            position: { lat: flightInfo.lat, lng: flightInfo.lon },
            map: map,
            title: flightInfo.flight,
            visible: true,
        });

        markers.push(marker);
        console.log(markers, 233)
    });
}



document.getElementById('search').addEventListener('input', filterFlightOptionsDOM);


// Modified handleRadioChange function
async function handleRadioChange(event) {
    const selectedFlight = event.target.value.trim();
    console.log(selectedFlight, 138)
    try {
        // Fetch coordinate data for the selected flight
        const response = await fetch(`/api/coordinateData/${selectedFlight}`);
        const coordinateData = await response.json();

        // Log the coordinate data for testing
        console.log(coordinateData);

        // Add markers for the selected flight
        addMarkersForFlight(coordinateData);
    } catch (error) {
        console.error('Error fetching coordinate data:', error);
    }
}

// Use a second selector to find radio buttons within the container
const radioButtons = container.querySelectorAll('input[type="radio"]');


container.addEventListener('change', (event) => {
    if (event.target.type === 'radio') {
        handleRadioChange(event);
    }
});