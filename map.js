var groups = {};
var groups2 = {};

var layers = {};

var markers = new L.MarkerClusterGroup();

var geo = L.geoJson(data, {
  onEachFeature: function(feature, layer) {
    // Fix lat/lng
    var tmp = layer._latlng.lat;
    layer._latlng.lat = layer._latlng.lng;
    layer._latlng.lng = tmp;

    var props = feature.properties;

    for (ac in props.area_clinica) {
      var area = props.area_clinica[ac];

      // Popup HTML
      var html = props.data.institucion.standard;
        // 'Descripción: ' + props.data.proyecto.descripcion;
      layer.bindPopup(html);
      layer.bindLabel(props.data.institucion.standard, {noHide: true});

      // Add to the correct area layer group
      if (!groups2.hasOwnProperty(area)) {
        groups2[area] = [];
      }

      groups2[area].push(layer);
    }
  }
});

// Sort layers alphabetically (ignore lowercase)
keys = Object.keys(groups2)
keys.sort(function(a,b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});

// Prepare groups
for (var i=0; i<keys.length; i++) {
  var label = keys[i] + " (" + groups2[keys[i]].length + ")";
  groups[label] = L.layerGroup();
}

var map = L.map('map', {
  center: [40.47, -3.59],
  zoom: 6
});


var sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);

// new L.Control.GeoSearch({
//   provider: new L.GeoSearch.Provider.Google(),
//   zoomLevel: 12,
//   searchLabel: "buscar..."
// }).addTo(map);

var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
  // attribution: 'Developed by <a href="http://marzeelabs.org" target="_blank">Marzee Labs</a>. Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
  attribution: '<b>Developed by <a href="http://openconsortium.eu/" target="_blank" class="oc-logo">Open Consortium</a>.</b> Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
  key: 'BC9A493B41014CAABB98F0471D759707',
  styleId: 22677
}).addTo(map);

map.addLayer(markers);

// Add empty layers to the map
L.control.layers([],groups, {collapsed: false}).addTo(map);

map.on('overlayremove', function(layer) {
  var name = getNameFromLayerGroup(layer.name);
  delete layers[name];
  drawTable();
  drawCluster();
});

map.on('overlayadd', function(layer) {
  var name = getNameFromLayerGroup(layer.name);
  layers[name] = 1;
  drawTable();
  drawCluster();
  sidebar.show();
});

function drawCluster() {
  markers.clearLayers();
  for (l in layers) {
    markers.addLayers(groups2[l]);
  }
}

function getNameFromLayerGroup(name) {
  return name.replace(/ *\([^)]*\) */g, "");
}

function drawTable() {
  var table = $('<table></table>').attr('id', 'table').addClass('table table-striped table-hover table-condensed');
  var thead = $('<thead></thead');
  var tr = $('<tr></tr>');

  columns = ['Institución', 'Número de Proyectos']
  columns.forEach(function(k) {
    var th = $('<th></th>').text(k);
    tr.append(th);
  });

  thead.append(tr);
  table.append(thead);

  var tbody = $('<tbody></tbody>');
  for (l in layers) {

    for (i = 0, len = groups2[l].length; i < len; i++) {
      l2 = groups2[l][i];

      data = l2.feature.properties.data;

      var row = $('<tr></tr>');

      var col1 = $('<td></td>').text(data.institucion.original);
      var col2 = $('<td></td>').text(l2.feature.properties.data.numero_proyectos);

      row.append(col1);
      row.append(col2);

      tbody.append(row);
    };
  }

  table.append(tbody);

  $('#table-wrapper').empty().append(table);
  $('#table').tablesorter({
    // this will apply the bootstrap theme if "uitheme" widget is included
    // the widgetOptions.uitheme is no longer required to be set
    theme : "bootstrap",
    widthFixed: true,
    headerTemplate : '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!

    // widget code contained in the jquery.tablesorter.widgets.js file
    // use the zebra stripe widget if you plan on hiding any rows (filter widget)
    widgets : [ "uitheme", "filter", "zebra" ],
    widgetOptions : {
      // using the default zebra striping class name, so it actually isn't included in the theme variable above
      // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
      zebra : ["even", "odd"],
      // reset filters button
      filter_reset : ".reset"
      // set the uitheme widget to use the bootstrap theme class names
      // this is no longer required, if theme is set
      // ,uitheme : "bootstrap"
    }

  });
}

$.extend($.tablesorter.themes.bootstrap, {
  // these classes are added to the table. To see other table classes available,
  // look here: http://twitter.github.com/bootstrap/base-css.html#tables
  table      : 'table table-bordered',
  header     : 'bootstrap-header', // give the header a gradient background
  footerRow  : '',
  footerCells: '',
  icons      : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
  sortNone   : 'bootstrap-icon-unsorted',
  sortAsc    : 'icon-chevron-up glyphicon glyphicon-chevron-up',     // includes classes for Bootstrap v2 & v3
  sortDesc   : 'icon-chevron-down glyphicon glyphicon-chevron-down', // includes classes for Bootstrap v2 & v3
  active     : '', // applied when column is sorted
  hover      : '', // use custom css here - bootstrap class may not override it
  filterRow  : '', // filter row class
  even       : '', // odd row zebra striping
  odd        : ''  // even row zebra striping
});

drawTable();
