# Restaurantes recomendados

Monorepo con npm workspaces: aplicación Expo y backend NestJS con PostgreSQL.

## Estado actual

- **API funcional:** registro, login, consulta de usuario, logout y creación, consulta, edición y eliminación de restaurantes privados. Incluye búsqueda, filtros por tipos de comida y paginación.
- **Móvil:** ofrece registro, activación por correo e inicio de sesión real. Las cuentas autenticadas consultan y guardan restaurantes en la API; la demo conserva sus datos locales de AsyncStorage por separado. La sesión se mantiene en memoria: al cerrar la app hay que volver a entrar. Obtiene el catálogo de tipos del backend y limita sus opciones según los filtros activos.
- Los datos locales existentes no se migran ni se eliminan al reorganizar el código.

## Estructura

```text
apps/
  mobile/             App Expo, pantallas y componentes
  api/
    src/auth/         Usuarios, contraseñas y sesiones
    src/restaurants/  Restaurantes y permisos por propietario
    migrations/       Evolución versionada del esquema SQL
    test/             Pruebas HTTP contra PostgreSQL
packages/
  contracts/          Tipos y categorías compartidos, sin dependencias de Nest o React
compose.yaml          PostgreSQL para desarrollo
```

El backend utiliza NestJS 11 y TypeScript. El acceso a PostgreSQL se hace con `pg`, consultas parametrizadas y migraciones SQL explícitas. Los módulos de Nest separan controladores HTTP, validación y lógica de negocio. Se mantiene Nest 11 por compatibilidad con la versión de `@nestjs/throttler` utilizada.

## Preparación

Requisitos: Node.js 22.13 o posterior, npm con workspaces y Docker Desktop con el motor Linux iniciado. Ejecuta los comandos desde la raíz del repositorio.

```powershell
npm install
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
npm run db:up
npm run db:migrate
```

Las copias de `.env` solo se hacen la primera vez. Antes de arrancar PostgreSQL, completa `POSTGRES_PASSWORD` con una contraseña propia y configura `DATABASE_URL` y `TEST_DATABASE_URL` con la conexión local (incluye usuario, contraseña, host, puerto y nombre de base de datos; codifica los caracteres especiales de la contraseña para URL). Los ejemplos dejan esos valores vacíos deliberadamente. El valor local de `POSTGRES_PASSWORD` debe coincidir con la contraseña de `DATABASE_URL`. Los archivos `.env` están excluidos de Git. Espera a que PostgreSQL esté saludable (`docker compose ps`) antes de ejecutar las migraciones.

Si ya tienes PostgreSQL, puedes omitir Docker y apuntar `DATABASE_URL` y `TEST_DATABASE_URL` a una base de datos de desarrollo. Las migraciones no se ejecutan automáticamente al arrancar la API. Para cambiar el esquema, añade una nueva migración; no edites las ya aplicadas. El ejecutor comprueba su contenido y aplica las pendientes en una transacción.

## Arrancar API y móvil

Para arrancar la API y Expo juntos en una sola terminal:

```powershell
npm run dev
```

Este comando compila los contratos compartidos y lanza ambos procesos con acceso directo a la terminal para que Expo muestre el QR y sus atajos de teclado. La API conserva la salida al recompilar para no borrar el QR. Pulsa `Ctrl+C` para detener ambos; si uno termina, también se cierra el otro. PostgreSQL debe estar iniciado y las migraciones aplicadas según la preparación anterior.

También puedes arrancarlos por separado. Terminal para la API, con recompilación automática:

```powershell
npm run api:dev
```

- Documentación interactiva: [Swagger](http://127.0.0.1:3000/api/docs).
- Estado de base de datos y migraciones: [Health](http://127.0.0.1:3000/api/v1/health).
- OpenAPI JSON: [Especificación](http://127.0.0.1:3000/api/docs-json).

Otra terminal para Expo:

```powershell
npm start
```

Escanea el QR con Expo Go usando la misma Wi-Fi. También puedes ejecutar `npm run android` o `npm run ios`. Para pasar opciones directamente a Expo: `npm run start --workspace=@restaurantes/mobile -- --tunnel`.

La API escucha en `127.0.0.1` por defecto. Copia `apps/mobile/.env.example` a `apps/mobile/.env` y configura `EXPO_PUBLIC_API_URL` (por defecto `http://localhost:3000/api/v1`). Para móvil físico, configura `HOST=0.0.0.0` en `apps/api/.env` y utiliza la IP local del ordenador como URL de la API, incluyendo `/api/v1`; en el emulador Android utiliza `10.0.2.2` como host. Reinicia Expo tras cambiar la variable. El túnel de Expo no publica la API. `CORS_ORIGINS` acepta orígenes web separados por comas.

Para ejecutar la API compilada:

```powershell
npm run build
npm run api:start
```

## APK para compartir (Android)

El perfil `preview` de `apps/mobile/eas.json` genera un APK independiente, sin Expo Go ni servidor de desarrollo. Esta versión ofrece únicamente la demo: guarda los restaurantes en cada dispositivo y utiliza el catálogo de tipos incluido en la app. No sincroniza datos entre móviles. Las búsquedas de Google y Maps necesitan internet.

Desde `apps/mobile`, inicia sesión en tu cuenta de Expo y genera el APK:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

La primera compilación vincula el proyecto a Expo y permite generar la clave de firma Android. Conserva ese proyecto y su clave para poder instalar futuras actualizaciones sobre la misma app. El perfil incrementa automáticamente el número de compilación.

Cuando termine, descarga el APK desde el enlace de EAS y compártelo con tus probadores. En Android, abre el archivo y permite la instalación desde el navegador o gestor de archivos si el sistema lo solicita. Este archivo no sirve para iPhone. Los datos de Expo Go no se transfieren automáticamente al APK; desinstalar la app elimina sus datos locales.

Referencia: [APK con EAS Build](https://docs.expo.dev/build-reference/apk/).

## Probar la API con cuentas reales

En Swagger, registra una cuenta con `POST /api/v1/auth/register` enviando `name`, `nick`, `email` y `password`. Activa la cuenta desde el correo y después usa `/auth/login` para obtener `accessToken` y pegarlo en **Authorize**. El registro ya no devuelve una sesión. También puedes usar PowerShell tras activar la cuenta:

```powershell
$apiUrl = 'http://127.0.0.1:3000/api/v1'
$credentials = @{ email = 'felix@example.com'; password = 'una-clave-local-larga' } | ConvertTo-Json
$session = Invoke-RestMethod "$apiUrl/auth/login" -Method Post -ContentType 'application/json' -Body $credentials
$headers = @{ Authorization = "Bearer $($session.accessToken)" }
$restaurant = @{ name = 'Casa de comidas'; locality = 'Madrid'; type = 'Tapas'; recommendedBy = 'Ana' } | ConvertTo-Json
Invoke-RestMethod "$apiUrl/restaurants" -Method Post -Headers $headers -ContentType 'application/json' -Body $restaurant
Invoke-RestMethod "$apiUrl/restaurants?types=Tapas&limit=20" -Headers $headers
```

Si la cuenta existe, utiliza `/auth/login` en lugar de `/auth/register`.

| Método | Ruta bajo `/api/v1` | Función |
| --- | --- | --- |
| POST | `/auth/register` | Crear cuenta pendiente y enviar confirmación |
| POST | `/auth/resend-confirmation` | Reenviar confirmación enviando `email` |
| GET | `/auth/confirm-email?token=…` | Página para confirmar la activación |
| POST | `/auth/confirm-email` | Activar desde el formulario del correo |
| POST | `/auth/verify-email` | Activar mediante JSON `{ token }` |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Consultar usuario autenticado |
| POST | `/auth/logout` | Invalidar la sesión actual |
| GET | `/restaurants` | Listar restaurantes propios |
| GET | `/restaurant-types` | Catálogo de tipos para formulario y filtros (público) |
| POST | `/restaurants` | Crear restaurante |
| GET | `/restaurants/:id` | Consultar restaurante propio |
| PATCH | `/restaurants/:id` | Modificar solo los campos enviados |
| DELETE | `/restaurants/:id` | Eliminar restaurante propio |

El listado devuelve `{ items, limit, offset }`. Acepta `query`, `locality`, `price`, `types`, `limit` (1–100, por defecto 50) y `offset`. Para varios tipos: `?types=Tapas&types=Sushi`. `query` busca también en el nombre de quien recomendó el restaurante. `name` es obligatorio; el resto de campos de creación utiliza una cadena vacía por defecto. Los contratos TypeScript no sustituyen la validación en el servidor.

Las contraseñas, de 12 a 128 caracteres, se almacenan con scrypt y sal aleatoria. Los tokens son opacos, duran siete días y solo se guarda su hash SHA-256 en la base de datos. Logout revoca el token inmediatamente. Las respuestas nunca incluyen hashes. Los intentos de login y registro tienen límites por IP. Cada consulta de restaurantes se restringe al propietario obtenido de la sesión, nunca a un usuario enviado en el cuerpo.

## Verificación

Los restaurantes usan IDs `BIGINT GENERATED ALWAYS AS IDENTITY`, asignados por PostgreSQL (`1`, `2`, `3`…). La API los devuelve como cadenas para preservar su precisión. La migración `003` numera los restaurantes existentes por fecha de creación y conserva su UUID en `legacy_id`; las rutas de restaurantes pasan a exigir el nuevo ID numérico. Los usuarios mantienen su UUID. Las secuencias pueden tener huecos por borrados o transacciones fallidas. La demo local utiliza su propio contador persistente y migra los datos anteriores a un almacenamiento `v2`, conservando el original como respaldo.

Cada restaurante incluye `visited` (booleano, inicialmente `false`) y `opinion` (texto de hasta 4000 caracteres). En el formulario, «Ya he estado» permite escribir la opinión; la tarjeta muestra «✓ Visitado» y la opinión aparece al desplegarla. Desmarcar la visita conserva el texto para recuperarlo después. El interruptor «Solo visitados» combina este criterio con los demás filtros y limita también los tipos disponibles; apagado muestra todos. La API ofrece el mismo filtro con `?visitedOnly=true` (`false` muestra todos). Aplica la nueva migración con `npm run db:migrate`. Los datos locales anteriores reciben los valores predeterminados al cargarse.

```powershell
npm run typecheck
npm run build
npm test
```

`npm test` requiere `TEST_DATABASE_URL`. Crea un esquema aleatorio `test_*`, aplica las migraciones y elimina únicamente ese esquema al terminar; no toca las tablas de desarrollo. Verifica autenticación, caducidad, logout, aislamiento entre usuarios, filtros, actualizaciones parciales, persistencia al reiniciar la API y límites de intentos.

Para detener PostgreSQL conservando los datos: `npm run db:down`.

## Siguiente integración

Queda guardar la sesión en almacenamiento seguro para mantenerla al reiniciar la app y ofrecer una importación explícita de las recomendaciones locales. Todavía no hay recuperación de contraseña. El límite de peticiones actual es en memoria y está pensado para una sola instancia de API.

## Correo de activación

El formulario de registro está desactivado por defecto: al pulsar «Crear cuenta» se muestra «Registro temporalmente no disponible» y un acceso a la demo. Cuando el correo esté configurado, establece `EXPO_PUBLIC_REGISTRATION_ENABLED=true` en `apps/mobile/.env` y reinicia Expo para recuperar el formulario. Esta opción controla la interfaz; el endpoint de registro de la API conserva su comportamiento.

Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` y `PUBLIC_API_URL` en `apps/api/.env`. `PUBLIC_API_URL` debe incluir `/api/v1` y ser accesible desde el dispositivo que abre el correo. Para el puerto 465 usa `SMTP_SECURE=true`; para 587 usa `false` y STARTTLS. En producción se exige TLS. Las opciones siguen la [documentación SMTP de Nodemailer](https://nodemailer.com/smtp).

Aplica `npm run db:migrate` antes de iniciar el backend. La migración `004` añade nombre, nick único y confirmación. Las cuentas anteriores también deben confirmar el email mediante «Reenviar activación» y sus sesiones anteriores se invalidan. El nick acepta de 3 a 40 letras ASCII, números o guiones bajos y no distingue mayúsculas. La contraseña tiene de 12 a 128 caracteres.

El token aleatorio se almacena únicamente como hash, caduca en 24 horas y se consume una sola vez. Abrir el enlace no activa por sí solo la cuenta: hay que pulsar «Activar cuenta», para evitar activaciones por lectores automáticos de correo. Reenviar invalida el enlace anterior y se limita a una solicitud por minuto por cuenta, además del límite por IP. Si falla SMTP, se revierte el registro o reenvío para permitir reintentar. No se incluyen tokens de activación en respuestas de registro ni logs. Sin configuración SMTP, el registro devuelve un error de servicio y no crea la cuenta.

Los iconos de Google y Google Maps de la app siguen abriendo búsquedas sin clave de API.

Referencias: [NestJS](https://docs.nestjs.com/), [monorepos Expo](https://docs.expo.dev/guides/monorepos/), [consultas parametrizadas con pg](https://node-postgres.com/features/queries).

## Registrar una visita

En cada tarjeta pendiente, «Registrar visita» abre la edición y desplaza el formulario a «Mi opinión». En este modo los datos del restaurante están deshabilitados; se permite escribir la experiencia y elegir 😍 «Me encantó», 😊 «Me gustó», 😐 «Normal», 🙁 «No me gustó» o 😞 «Me decepcionó». «Guardar visita» confirma los cambios; volver sin guardar conserva el estado anterior. La tarjeta plegada muestra un marcador de ubicación con confirmación integrada y la valoración, sin texto de estado. El lápiz mantiene la edición completa.

La valoración se conserva en la demo local y en la API. Los registros antiguos empiezan sin valoración. Antes de arrancar la API actualizada, ejecuta `npm run db:migrate` para aplicar `005_restaurant_rating.sql` y `006_restaurant_rating_options.sql`.

Las valoraciones se representan con caritas propias de colores: verde intenso, verde claro, amarillo, naranja y rojo, de mejor a peor experiencia. Las expresiones y las etiquetas distinguen las opciones también sin depender del color.

## Varios tipos de local

El formulario permite marcar varios tipos de local y las tarjetas muestran todas las etiquetas seleccionadas. El filtro encuentra los restaurantes que tengan cualquiera de los tipos elegidos.

El campo `type` se guarda como una lista; la API también acepta el texto de los clientes anteriores. Ejecuta `npm run db:migrate` antes de iniciar la API actualizada para aplicar `008_restaurant_multiple_types.sql`: convierte los tipos existentes en listas sin perder la selección y los campos vacíos en listas vacías. La demo local convierte sus registros al cargarlos.

## Rangos de precio

El formulario y el filtro ofrecen los mismos seis rangos de precio. `price` almacena la clave elegida (`under20`, `20to40`, `40to60`, `60to80`, `80to100` u `over100`), o `''` si no se especifica. El filtro compara la clave directamente.

Aplica `009_restaurant_price_ranges.sql` con `npm run db:migrate` antes de arrancar la API. Los precios anteriores escritos a mano se conservan en `legacy_price` (y en `legacyPrice` en la demo), visibles en la tarjeta y como referencia en el formulario, hasta elegir un rango. Mientras no tengan rango aparecen en «Todos los precios».
