# Sistema de Gestión de Restaurantes – Proyecto 1

## Base de Datos II — Instituto Tecnológico de Costa Rica  
**Autores:** Sebastián Chacón y Pablo Agüero  
**Profesor:** Kenneth Obando Rodríguez  

---

## Arquitectura General

Servicios incluidos:
- `nginx` – Balanceador de carga
- `app1`, `app2` – API REST principal
- `db` – PostgreSQL
- `redis` – Sistema de caché
- `search` – Microservicio de búsqueda
- `elasticsearch` y `kibana`
- `mongos`, `mongors1–3`, `mongocfg1–3` – MongoDB con replicación y sharding
- `mongo-express` – Administración web MongoDB

---

## Ejecución del sistema

### 1. Clonar y levantar servicios
```bash
git clone https://github.com/tu-repo/restaurantes.git
cd restaurantes
docker compose up --build -d
````

---

## 2. Inicializar replicación y sharding de MongoDB

### Conectarse al contenedor `mongors1` y configurar el ReplicaSet:

```bash
docker exec -it mongors1 mongosh
```

```js
rs.initiate({
  _id: "mongors1",
  members: [
    { _id: 0, host: "mongors1:27017" },
    { _id: 1, host: "mongors2:27017" },
    { _id: 2, host: "mongors3:27017" }
  ]
})
```

### Configurar el ReplicaSet de configuración:

```bash
docker exec -it mongocfg1 mongosh
```

```js
rs.initiate({
  _id: "mongors1conf",
  configsvr: true,
  members: [
    { _id: 0, host: "mongocfg1:27017" },
    { _id: 1, host: "mongocfg2:27017" },
    { _id: 2, host: "mongocfg3:27017" }
  ]
})
```

### Agregar shard al router `mongos`:

```bash
docker exec -it mongos mongosh
```

```js
sh.addShard("mongors1/mongors1:27017,mongors2:27017,mongors3:27017")
```

---

## 3. Verificación de servicios

### PostgreSQL:

```bash
docker exec -it postgresdb psql -U postgres -d restaurante
```

### Redis:

```bash
docker exec -it redis redis-cli
```

### ElasticSearch:

```bash
curl http://localhost:9200
```

### Kibana:

Acceder a: [http://localhost:5601](http://localhost:5601)

### Mongo Express:

Acceder a: [http://localhost:8081](http://localhost:8081)

---

## Cambiar motor de base de datos

Editar `DB_ENGINE` en `app1` y `app2`:

```yaml
- DB_ENGINE=postgres
# o
- DB_ENGINE=mongodb
```

---

## Endpoints principales

### API REST (vía Nginx - puerto 3000)

* `POST /auth/register`
* `POST /auth/login`
* `GET /users/me`
* `GET /restaurants`
* `POST /menus`
* etc.

### Servicio de búsqueda (puerto 4000)

* `GET /search/products?q=texto`
* `GET /search/products/category/:categoria`
* `POST /search/reindex`

---

## Pruebas automatizadas

```bash
docker exec -it app1 npm test
```

---

## Video demostrativo

[https://www.youtube.com/watch?v=r_2bHr9QAn8](https://www.youtube.com/watch?v=r_2bHr9QAn8)

