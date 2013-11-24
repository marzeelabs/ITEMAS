
## Spain

```
$ cd /path/to/itemas/data
$ mongoimport --db itemas --collection itemas_es_in --file es/itemas_es_raw.json  --jsonArray
$ mongo es/itemas_es.js
$ mongoexport --db itemas --collection itemas_es_out --out es/itemas_es_final.json --jsonArray
```

Copy the JsonArray generated in `es/itemas_es_final.json` to replace `features` sub-object in `itemas_es_final_single.geojson`, located in `data` folder.


## World

```
$ cd /path/to/itemas/data
$ mongoimport --db itemas --collection itemas_world_in --type csv  --file world/itemas_world_raw.csv --headerline
$ mongo world/itemas_world.js
$ mongoexport --db itemas --collection itemas_world_out --out world/itemas_world_final.json --jsonArray
```

Copy the JsonArray generated in `world/itemas_world_final.json` to replace `features` sub-object in `itemas_world_final_single.geojson`, located in `data` folder.
