// Initialization
// map
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hlcm1hbnQiLCJhIjoiY2pncDUwcnRmNDQ4ZjJ4czdjZXMzaHZpNyJ9.3rFyYRRtvLUngHm027HZ7A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [37.6, 55.8],  // starting position
    zoom: 11,  // starting zoom
    attributionControl: false
});
map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));  // zoom controls
map.addControl(new mapboxgl.AttributionControl({
    compact: true
    }));



map.on('load', function () {
    // load points
    map.addSource('places-points', {
        type: 'vector',
        url: 'mapbox://ghermant.ckhry3x4y0tnv23o4m82j7f3t-7jg6k'
    });

    // load icons
    addSVG = function (name, url) {
        let img = new Image(30, 30)
        img.onload = () => map.addImage(name, img)
        img.src = url
    }
    addSVG('tree-15', 'icons/flag.svg')
    addSVG('globe', 'icons/globe.svg')
    addSVG('placeholder', 'icons/placeholder.svg')

    // activate modals
    var elem = document.querySelector('#modal1');
    var modal = M.Modal.init(elem, {
        // get modal back to start after scroll when closing to open it at start next time 
        onCloseStart: (element) => element.scrollTop = 0
    });

    // add points layer with popups on map
    mapPoints = function (layerId, source, sourceLayer, filterValue) {
        // draw points
        map.addLayer({
            'id': layerId,
            'source': source,
            'source-layer': sourceLayer,
            'type': 'symbol',
            'layout': {
                'icon-image': ['get', 'icon'],
                'icon-size': 1,
                'icon-allow-overlap': true,
            },
            'filter': ['==', 'icon', filterValue]
        });

        // change the cursor to a pointer when the mouse is over the layer
        map.on('mouseenter', layerId, function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // change it back to a pointer when it leaves
        map.on('mouseleave', layerId, function () {
            map.getCanvas().style.cursor = '';
        });

        // set popups
        map.on('click', layerId, function (e) {
            var clicked = e.features[0].properties

            document.getElementById("title").innerHTML = clicked.title
            document.getElementById("address").innerHTML = clicked.address
            document.getElementById("image").src = clicked.image
            document.getElementById("caption").innerHTML = clicked.caption
            document.getElementById("description").innerHTML = clicked.description
            document.getElementById("audio").innerHTML = clicked.audio
            
            modal.open()
        });
    }

    mapPoints('points-data1', 'places-points', 'test', 'tree-15')
    mapPoints('points-data2', 'places-points', 'test', 'park-15')
});


