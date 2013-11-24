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
  area_clinica.split("/")
    // let's trim sub strings!
    .forEach(function(string) {
      area_clinica_array.push(string.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
    }
  );

  return area_clinica_array;
}


//
// BEGIN script
//

use itemas;

var collection = db.itemas_es;

print("Starting data processing");

collection.find().sort({"_id" : 1}).forEach(function(doc){

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
        insticucion: {
          original: doc.institucion_original,
          standard: doc.institucion_standard
        },
        proyecto: {
          descripcion: doc.proyecto_descripcion,
          estado: doc.proyecto_estado,
          keyords: doc.descripcion_kw,
          ip: {
            owner: doc.ip,
            nivel: doc.ip_nivel
          },
          entidades_finaciodoras: doc.entidades_finaciodoras,
          fondos_capital_riesgo: doc.fondos_capital_riesgo,
          entidades_colaboradoras: doc.entidades_colaboradoras,
          datas: {
            inicio: doc.ano_inicio,
            fin: doc.ano_inicio
          },
          capacidad_trabajo: doc.capacidad_trabajo
        }
      }
    }
  };

  // delete old document properties.
  db.itemas_es.remove({"_id": doc._id}, 1);

  // save new document in geoJson format
  collection.save(geoJsonFeature);

});

print("Data processed correctly.");



