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
        url: 'mapbox://mosmuseum.9vr042qb'
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
    var modalElement = document.querySelector('#modal1');
    var modal = M.Modal.init(modalElement, {
        // get modal back to start after scroll when closing to open it at start next time 
        onCloseStart: (element) => element.scrollTop = 0
    });

    // activate sidenav
    var sidenavElement = document.querySelectorAll('.sidenav');
    var sidenav = M.Sidenav.init(sidenavElement, {});
    

    // add points layer with popups on map
    mapPoints = function (layerId, layerName, layerFeatureName, source, sourceLayer, icon) {
        // Draw points
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


        // Points interactivity
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

            document.getElementById('title').textContent = clicked.title
            document.getElementById('address').textContent = clicked.address
            document.getElementById('layer-feature-name').textContent = clicked.done ? 'Реализованный архитектурный проект студентов ВХУТЕМАСа' : layerFeatureName
            document.getElementById('caption').textContent = clicked.caption
            document.getElementById('description').textContent = clicked.description
            document.getElementById('audios').innerHTML = clicked.audio_embed

            addImage = function(name, divToAppend) {
                url = `images/${name}`
                image = new Image
                image.src = url
                image.className = 'responsive-img'
                divToAppend.appendChild(image)
            }
            imagesDiv = document.getElementById('images')
            while(imagesDiv.firstChild) {
                imagesDiv.removeChild(imagesDiv.firstChild);
            }
            if(clicked.image) {
                imagesNames = clicked.image.split("\n")
                imagesNames.map(imageName => addImage(imageName, imagesDiv))
            }


            modal.open()
        });


        // Constuct legend
        var image = icon.image;
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


        // Construct list
        var layerTitle = document.createElement('a')
        layerTitle.className = 'subheader'
        layerTitle.textContent = layerName

        var layerTitleLi = document.createElement('li')
        layerTitleLi.id = `${layerId}-list-title`
        layerTitleLi.appendChild(layerTitle)
        var layerFeaturesLi = document.createElement('div')
        layerFeaturesLi.id = `${layerId}-list-features`

        var layerList = document.createElement('div')
        layerList.id = `${layerId}-list`
        layerList.appendChild(layerTitleLi)
        layerList.appendChild(layerFeaturesLi)

        var locationsList = document.getElementById('locations-list')
        locationsList.appendChild(layerList)

        map.on('render', function() {

            var layerFeaturesList = document.getElementById(`${layerId}-list-features`)
            while(layerFeaturesList.firstChild){
                layerFeaturesList.removeChild(layerFeaturesList.firstChild);
            }

            var renderedFeatures = map.queryRenderedFeatures({ layers: [layerId] })
                .map(feature => {
                    var featureLite = {title: feature.properties.title}
                    var featureTitle = document.createElement('a')
                    featureTitle.id = `link-${feature.properties.id}`
                    featureTitle.href = '#'
                    featureTitle.className = 'waves-effect a-in-list'
                    featureTitle.textContent = featureLite.title
                    featureTitle.addEventListener('click', function(event) {
                        // In this case [clickedFeature] == clickedFeature[0]
                        var [clickedFeature] = map.queryRenderedFeatures({
                            layers: [layerId],
                            filter: ['==', 'id', parseInt(this.id.substring(5))]
                        })
                        map.flyTo({
                            center: clickedFeature.geometry.coordinates,
                            zoom: 15
                        });
                    })
                    featureTitleLi = document.createElement('li')
                    featureTitleLi.appendChild(featureTitle)

                    layerFeaturesList.appendChild(featureTitleLi)
                })
            // console.log(renderedFeatures)
        })
        
    }

    mapPoints('projects', 'Проекты', 'Проект', 'poi', 'vhutemas_mapbox-7neq34', projectIcon)    
    mapPoints('addresses', 'Адреса', 'Адрес', 'poi', 'vhutemas_mapbox-7neq34', peopleIcon)
    mapPoints('events', 'События', 'Событие', 'poi', 'vhutemas_mapbox-7neq34', placeIcon)
});


