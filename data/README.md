
```
$ cd /path/to/itemas/data
$ mongoimport --db itemas --collection itemas_es_in --file es/itemas_es_raw.json  --jsonArray
$ mongo es/itemas_es.js
$ mongoexport --db itemas --collection itemas_es_out --out es/itemas_es_final.json --jsonArray
```

Copy the JsonArray generated in `es/itemas_es_final.json` to replace `features` sub-object in `itemas_es_final_single.geojson`, located in `data` folder.
