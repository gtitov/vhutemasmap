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
    addSVG('flag', 'icons/flag.svg')
    addSVG('globe', 'icons/globe.svg')
    addSVG('placeholder', 'icons/placeholder.svg')

    // activate modals
    var elem = document.querySelector('#modal1');
    var modal = M.Modal.init(elem, {
        // get modal back to start after scroll when closing to open it at start next time 
        onCloseStart: (element) => element.scrollTop = 0
    });

    // add points layer with popups on map
    mapPoints = function (layerId, layerName, source, sourceLayer, iconName) {
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
                'visibility': 'visible'  // for legend work
            },
            'filter': ['==', 'icon', iconName]
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

            document.getElementById('title').innerHTML = clicked.title
            document.getElementById('address').innerHTML = clicked.address
            document.getElementById('image').src = clicked.image
            document.getElementById('caption').innerHTML = clicked.caption
            document.getElementById('description').innerHTML = clicked.description
            document.getElementById('audio').innerHTML = clicked.audio

            modal.open()
        });

        // constuct legend
        var image = document.createElement('img');
        // НАВЕРНОЕ, ПРИДЁТСЯ МЕНЯТЬ, КОГДА СТАНЕТ ПОНЯТНО, КАК НАЗЫВАЮТСЯ ИКОНКИ
        image.src = `icons/${iconName}.svg`;
        image.alt = 'icon';
        image.width = '24';
        image.height = '24';

        var icon = document.createElement('span');
        icon.className = 'secondary-content';
        icon.appendChild(image);

        var layer = document.createElement('a');
        layer.href = '#';
        layer.value = layerId;
        layer.className = 'collection-item active';
        layer.textContent = layerName;
        layer.appendChild(icon);

        layer.onclick = function (e) {
            var clickedLayer = this.value;
            e.preventDefault();
            e.stopPropagation();
            var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

            // toggle layer visibility by changing the layout object's visibility property
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = 'collection-item';
            } else {
                this.className = 'collection-item active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
            }
        };

        var layers = document.getElementById('legend');
        layers.appendChild(layer);
    }

    mapPoints('points-data1', 'Слой 1', 'places-points', 'test', 'flag')
    mapPoints('points-data2', 'Слой 2', 'places-points', 'test', 'globe')
    mapPoints('points-data3', 'Слой 3', 'places-points', 'test', 'placeholder')
});


