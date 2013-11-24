//
// @file
// Script to manipulated data imported from CSV for red ITEMAS World
//
// @author Nuno Veloso (nuno@marzeelabs.org)
//


//
// Transforms "sector" single string field into array of area clinicas
// @param [string]
// @return [array] with trimmed sub strings
//
function parse_sector(sector) {
  // var declaration
  var sector_array = Array();

  // transform sting -> array
  sector.replace(/\//, ',').split(",")
    // let's trim sub strings!
    .forEach(function(string) {
      sector_array.push(string.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    }
  );

  // delete the repeated values
  sector_array = sector_array.filter(function (e, i, arr) {
    return arr.lastIndexOf(e) === i;
  });

  return sector_array;
}

//
// Trim function
// @param [string] raw
// @return [string] trimmed
//
function trim(string) {
  return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}


//
// BEGIN script
//

db = db.getSiblingDB('itemas');

var collection_in = db.itemas_world_in;
var collection_out = db.itemas_world_out;

var instituciones = {};


print("Starting data processing");


collection_in.find().sort({"_id" : 1}).forEach(function(doc){

  var institucion = trim(doc.institucion);

  // this is a new institution
  if (!(institucion in instituciones)) {

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
        sector: parse_sector(doc.sector),
        data: {
          pais: doc.pais,
          tipo_entidad: doc.tipo_entidad,
          numero_proyectos: 1
        }
      }
    };

    instituciones[institucion] = geoJsonFeature;

  }
  // there is already an entry for this institucion
  else {
    // update areas clinicas
    var sector = instituciones[institucion].properties.sector.join(',');
    sector = sector + ',' + doc.sector;
    instituciones[institucion].properties.sector = parse_sector(sector);

    // update numero de proyectos
    instituciones[institucion].properties.data.numero_proyectos++;
  }

});


// save in the new collection
for (i in instituciones) {
  collection_out.save(instituciones[i]);
};


print("Data processed correctly.");



