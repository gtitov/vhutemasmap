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
    


map.on('load', function () {
    // Add points
    // load icons
    addSVG = function(name, url) {
        let img = new Image(20,20)
        img.onload = () => map.addImage(name, img)
        img.src = url
    }
    addSVG('tree-15', 'icons/flag.svg')
    addSVG('globe', 'icons/globe.svg')
    addSVG('placeholder', 'icons/placeholder.svg')
    
    // load points
    map.addSource('places-points', {
        type: 'vector',
        url: 'mapbox://ghermant.ckhry3x4y0tnv23o4m82j7f3t-7jg6k'
    });
    // draw points
    map.addLayer({
        'id': 'points-data1',
        'source': 'places-points',
        'source-layer': 'test',
        'type': 'symbol',
        'layout': {
            'icon-image': ['get', 'icon'],
            'icon-size': 1,
            'icon-allow-overlap': true,
        },
        'paint': {
            'icon-color': '#FFFF00',
        },
        'filter': ['==', 'icon', 'tree-15']
    });
    map.addLayer({
        'id': 'points-data2',
        'source': 'places-points',
        'source-layer': 'test',
        'type': 'symbol',
        'layout': {
            'icon-image': ['get', 'icon'],
            'icon-size': 1,
            'icon-allow-overlap': true,
        },
        'paint': {
            'icon-color': '#FFFF00',
        },
        'filter': ['==', 'icon', 'park-15']
    });

    // Activate modals
    var elem = document.querySelector('#modal1');
    var modal = M.Modal.init(elem, { endingTop: '100%' });


    // Set popups
    map.on('click', 'points-data1', function (e) {
        var clicked = e.features[0].properties

        document.getElementById("title").innerHTML = clicked.title
        document.getElementById("address").innerHTML = clicked.address
        document.getElementById("image").src = clicked.image
        document.getElementById("caption").innerHTML = clicked.caption
        document.getElementById("description").innerHTML = clicked.description
        document.getElementById("audio").innerHTML = clicked.audio

        modal.open()
    });

    // change the cursor to a pointer when the mouse is over the places layer
    map.on('mouseenter', 'points-data1', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // change it back to a pointer when it leaves
    map.on('mouseleave', 'points-data1', function () {
        map.getCanvas().style.cursor = '';
    });
});


