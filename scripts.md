```bash
mongo-express  | Server is open to allow connections from anyone (0.0.0.0)
mongo-express  | basicAuth credentials are "admin:pass", it is recommended you change this in your config.js! 
```

- Quitar las variables de entorno y sacarlas al env

# MongoDB

## ReplicaSet
``` js
rs.initiate({
    _id : "mongors1", 
    members: [{_id : 0, host : "mongors1"}, {_id : 1, host : "mongors2"}, {_id : 2, host : "mongors3"}]
})
```

## Config ReplicaSet
``` js
rs.initiate({
    _id: "mongors1conf", 
    configsvr: true, 
    members: [{_id : 0, host : "mongocfg1"}, {_id : 1, host : "mongocfg2"},{_id : 2, host : "mongocfg3"}]
})
```

## Mongos Shard
``` js
sh.addShard("mongors1/mongors1:27017")
```

## BD desde consola

```bash
use socialdb
```

```js
sh.shardCollection(
  "RestaurantDB.Dishes",
  { shardkey_custom: "hashed" },
  false,
  {
    numInitialChunks: 5,
    collation: { locale: "simple" }
  }
)
```

## Consultas

## 3. Consultas

```js
db.collection.getShardDistribution()
```

```js
sh.status()
```

```js
rs.status()
```