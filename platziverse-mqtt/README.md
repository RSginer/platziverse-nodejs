# platziverse-mqtt

## 'agent/connected'
```js
{
  agent: {
    uuid, // auto generar
    username, // definir por configuracion
    name, // definir por configuracion
    hostname, // obtener del S.O
    pid // obtener del proceso
  }
}
```

## 'agent/disconnected'
```js
  {
    agent: {
      uuid
    }
  }
```

## 'agent/message'
```js 
  {
    agent,
    metrics: [
      {
        type,
        value
      }
    ],
    timestamp // generar al crear mensaje
  }
```