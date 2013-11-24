//
// @file
// Script to manipulated data imported from CSV for red ITEMAS Spain
//
// @author Nuno Veloso (nuno@marzeelabs.org)
//


//
// Transforms "area_clinica" single string field into array of area clinicas
// @param [string]
// @return [array] with trimmed sub strings
//
function parse_area_clinica(area_clinica) {
  // var declaration
  var area_clinica_array = Array();

  // transform sting -> array
  area_clinica.replace(/\//, ',').split(",")
    // let's trim sub strings!
    .forEach(function(string) {
      area_clinica_array.push(string.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    }
  );

  // delete the repeated values
  area_clinica_array = area_clinica_array.filter(function (e, i, arr) {
    return arr.lastIndexOf(e) === i;
  });

  return area_clinica_array;
}


//
// BEGIN script
//

db = db.getSiblingDB('itemas');

var collection_in = db.itemas_es_in;
var collection_out = db.itemas_es_out;

var instituciones = {};


print("Starting data processing");


collection_in.find().sort({"_id" : 1}).forEach(function(doc){

  // this is a new institution
  if (!(doc.institucion_standard in instituciones)) {

    // building geoJson Feature array item
    var geoJsonFeature = {
      geometry: {
        type: "Point",
        coordinates: [
          doc.lat,
          doc.lon
        ]
      },
      type: "Feature",
      properties: {
        area_clinica: parse_area_clinica(doc.area_clinica),
        data: {
          responsable: doc.responsable,
          institucion: {
            original: doc.institucion_original,
            standard: doc.institucion_standard
          },
          numero_proyectos: 1
        }
      }
    };

    instituciones[doc.institucion_standard] = geoJsonFeature;

  }
  // there is already an entry for this institucion
  else {
    // update areas clinicas
    var area_clinica = instituciones[doc.institucion_standard].properties.area_clinica.join(',');
    area_clinica = area_clinica + ',' + doc.area_clinica;
    instituciones[doc.institucion_standard].properties.area_clinica = parse_area_clinica(area_clinica);

    // update numero de proyectos
    instituciones[doc.institucion_standard].properties.data.numero_proyectos++;
  }

});


// save in the new collection
for (i in instituciones) {
  collection_out.save(instituciones[i]);
};


print("Data processed correctly.");



