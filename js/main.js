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
map.addControl(new mapboxgl.AttributionControl({ compact: true }));

fetch('vhutemas_mapbox.csv')
    .then(response => response.text())
    .then(
        csvString => csv2geojson.csv2geojson(csvString, {
            latfield: 'lat',
            lonfield: 'lon',
            delimiter: ','
        }, function (err, geojsondata) {
            if(err) console.log(err)
            // Draw map content
            map.on('load', function () {
                map.addSource('poi', {
                    type: 'geojson',
                    data: geojsondata
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
                    return (icon)
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
                // In this case [sidenav] == sidenav[0]
                var [sidenav] = M.Sidenav.init(sidenavElement, {});
            
            
                // add points layer with popups on map
                mapPoints = function (layerId, layerName, layerFeatureName, source, sourceData, icon) {
                    // Draw points
                    map.addLayer({
                        'id': layerId,
                        'source': source,
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
            
                        addImage = function (name, divToAppend) {
                            url = `images/${name}`
                            image = new Image
                            image.src = url
                            image.className = 'responsive-img'
                            divToAppend.appendChild(image)
                        }
                        imagesDiv = document.getElementById('images')
                        while (imagesDiv.firstChild) {
                            imagesDiv.removeChild(imagesDiv.firstChild);
                        }
                        if (clicked.image) {
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
            
                    var iconPicture = document.createElement('span');
                    iconPicture.className = 'secondary-content';
                    iconPicture.appendChild(image);
            
                    var layerControl = document.createElement('a');
                    layerControl.href = '#';
                    layerControl.value = layerId;
                    layerControl.className = 'collection-item teal lighten-3 active';
                    layerControl.textContent = layerName;
                    layerControl.appendChild(iconPicture);
            
                    layerControl.onclick = function (e) {
                        var clickedLayer = this.value;
                        e.preventDefault();
                        e.stopPropagation();
                        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
            
                        // toggle layer visibility by changing the layout object's visibility property
                        if (visibility === 'visible') {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                            this.className = 'collection-item';
                            var featuresList = document.getElementById(`${layerId}-list-features`)
                            featuresList.style.display = 'none'
                        } else {
                            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                            this.className = 'collection-item teal lighten-3 active';
                            var featuresList = document.getElementById(`${layerId}-list-features`)
                            featuresList.style.display = ''
                        }
                    };
            
                    var layerControls = document.getElementById('legend');
                    layerControls.appendChild(layerControl);
            
            
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
            
            
                    
                    var layerFeaturesList = document.getElementById(`${layerId}-list-features`)
                    var layerFeatures = sourceData.features
                        .filter(feature => feature.properties.icon == icon.id)
                    layerFeatures.map(
                        feature => {
                            var featureLite = { title: feature.properties.title }
                            var featureTitle = document.createElement('a')
                            featureTitle.id = `link-${feature.properties.id}`
                            featureTitle.href = '#'
                            featureTitle.className = 'waves-effect a-in-list'
                            featureTitle.textContent = featureLite.title
                            featureTitle.addEventListener('click', function (event) {
                                var clickedFeature = layerFeatures.find(feature => feature.properties.id == this.id.substring(5))
                                map.flyTo({
                                    center: clickedFeature.geometry.coordinates,
                                    zoom: 15
                                });
                            })
                            featureTitleLi = document.createElement('li')
                            featureTitleLi.appendChild(featureTitle)
        
                            layerFeaturesList.appendChild(featureTitleLi)
                        }
                    )
            
                }
            
                mapPoints('projects', 'Проекты', 'Проект', 'poi', geojsondata, projectIcon)
                mapPoints('addresses', 'Адреса', 'Адрес', 'poi', geojsondata, peopleIcon)
                mapPoints('events', 'События', 'Событие', 'poi', geojsondata, placeIcon)
            });
        })
    )






