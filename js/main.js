// Initialization
// map
mapboxgl.accessToken = 'pk.eyJ1IjoibW9zbXVzZXVtIiwiYSI6ImNrZ295NDM0NjA2b3kzMGw4MWc3ZWI1amcifQ.gPzaXJpxBGq0trqSAmNoPg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mosmuseum/cki4dqhn100pl19o95m64ghqi',
    center: [37.6, 55.77],  // starting position
    zoom: 11,  // starting zoom
    attributionControl: false,
    maxBounds: [
        [37.1, 55.3], // Southwest coordinates
        [38.2, 56.2] // Northeast coordinates
    ]
});
map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));  // zoom controls
map.addControl(new mapboxgl.AttributionControl({
    compact: true
}));



map.on('load', function () {
    // load points
    map.addSource('poi', {
        type: 'vector',
        url: 'mapbox://ghermant.cki31gmg33abi2arpmvfufpyv-8rm1a'
    });

    // load icons
    addSVG = function (name, url) {
        let img = new Image(15, 15)
        img.onload = () => map.addImage(name, img)  // use color from svg file
        // img.onload = () => map.addImage(name, img, {sdf: true})  // if want to set color on mapbox side
        img.src = url

        const icon = {
            'id': name,
            'image': img
        }
        return(icon)
    }
    var projectIcon = addSVG('project', 'icons/project.svg')
    var peopleIcon = addSVG('people', 'icons/people.svg')
    var placeIcon = addSVG('place', 'icons/place.svg')

    // activate modals
    var elem = document.querySelector('#modal1');
    var modal = M.Modal.init(elem, {
        // get modal back to start after scroll when closing to open it at start next time 
        onCloseStart: (element) => element.scrollTop = 0
    });

    // add points layer with popups on map
    mapPoints = function (layerId, layerName, source, sourceLayer, icon) {
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
                'icon-anchor': 'bottom',
                'visibility': 'visible'  // for legend work
            },
            'filter': ['==', 'icon', icon.id]
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
            document.getElementById('caption').innerHTML = clicked.caption
            document.getElementById('description').innerHTML = clicked.description
            document.getElementById('audios').innerHTML = clicked.audio_embed

            addImage = function(name, divToAppend) {
                url = `images/${name}`
                image = new Image
                image.src = url
                image.className = 'responsive-img'
                divToAppend.appendChild(image)
            }
            imagesDiv = document.getElementById('images')
            while(imagesDiv.firstChild){
                imagesDiv.removeChild(imagesDiv.firstChild);
            }
            if(clicked.image) {
                imagesNames = clicked.image.split("\n")
                imagesNames.map(imageName => addImage(imageName, imagesDiv))
            }


            modal.open()
        });

        // constuct legend
        var image = icon.image
        // НАВЕРНОЕ, ПРИДЁТСЯ МЕНЯТЬ, КОГДА СТАНЕТ ПОНЯТНО, КАК НАЗЫВАЮТСЯ ИКОНКИ
        image.alt = 'icon';
        image.width = '24';
        image.height = '24';

        var icon = document.createElement('span');
        icon.className = 'secondary-content';
        icon.appendChild(image);

        var layer = document.createElement('a');
        layer.href = '#';
        layer.value = layerId;
        layer.className = 'collection-item teal lighten-3 active';
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
                this.className = 'collection-item teal lighten-3 active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
            }
        };

        var layers = document.getElementById('legend');
        layers.appendChild(layer);
    }

    mapPoints('projects', 'Проекты', 'poi', 'vhutemas1', projectIcon)
    mapPoints('people', 'Адреса', 'poi', 'vhutemas1', peopleIcon)
    mapPoints('places', 'Актуальные адреса', 'poi', 'vhutemas1', placeIcon)
});


