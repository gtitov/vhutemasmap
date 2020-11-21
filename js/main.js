// Initialization
// map
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [37.6, 55.8],  // starting position
    zoom: 11  // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());  // zoom and rotation controls
// modals
document.addEventListener('DOMContentLoaded', function () {
    var elem = document.querySelector('#modal1');
    var instance = M.Modal.init(elem, {endingTop: "100%"});
    map.on('click', function (e) {
        console.log(e)
        instance.open()
    });
});

// Interactivity

    // var coordinates = e.features[0].geometry.coordinates.slice();
    // var description = e.features[0].properties.description;

    // // Ensure that if the map is zoomed out such that multiple
    // // copies of the feature are visible, the popup appears
    // // over the copy being pointed to.
    // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    // coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    // }

    // new mapboxgl.Popup()
    // .setLngLat(coordinates)
    // .setHTML(description)
    // .addTo(map);


