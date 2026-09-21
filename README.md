# Restaurantes recomendados

Monorepo con npm workspaces: aplicación Expo y backend NestJS con PostgreSQL.

## Estado actual

- **API:** desplegada en Vercel y conectada a PostgreSQL en Neon. El acceso usa Google a través de Firebase Authentication, con sesiones revocables y restaurantes privados por usuario. Incluye búsqueda, filtros y paginación.
- **Android:** el acceso con Google y la conexión a la API se han probado en un APK. La sesión de la API se guarda con Expo SecureStore y se comprueba al abrir la app. Dura siete días; después se vuelve a entrar con Google. La interfaz sigue el modo claro u oscuro del dispositivo.
- **Demo:** conserva sus datos en AsyncStorage, sin cuenta ni sincronización. Sigue disponible en Expo Go y otras plataformas. No se importa automáticamente a una cuenta.
- **Google Play:** hay perfiles EAS separados para APK de prueba con Google (`preview-google`) y AAB para tienda (`production-google`). El AAB actual se generó antes de los últimos cambios visuales y habrá que regenerarlo al terminar las pruebas.
- **Demo:** el perfil EAS `preview` continúa siendo solo demo.

## Estructura

```text
apps/
  mobile/             App Expo, pantallas y componentes
  api/
    src/auth/         Google, verificación Firebase y sesiones
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

Los perfiles `preview` y `preview-google` de `apps/mobile/eas.json` generan APK independientes, sin Expo Go ni servidor de desarrollo. `preview` ofrece únicamente la demo, con datos guardados en el dispositivo. `preview-google` usa el login de Google y la API pública; los datos quedan en PostgreSQL en Neon. Las búsquedas de Google y Maps necesitan internet.

Desde `apps/mobile`, inicia sesión en tu cuenta de Expo y genera el APK:

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

La primera compilación vincula el proyecto a Expo y permite generar la clave de firma Android. Conserva ese proyecto y su clave para poder instalar futuras actualizaciones sobre la misma app. El perfil incrementa automáticamente el número de compilación.

Cuando termine, descarga el APK desde el enlace de EAS y compártelo con tus probadores. En Android, abre el archivo y permite la instalación desde el navegador o gestor de archivos si el sistema lo solicita. Este archivo no sirve para iPhone. Los datos de Expo Go no se transfieren automáticamente al APK; desinstalar la app elimina sus datos locales.

Referencia: [APK con EAS Build](https://docs.expo.dev/build-reference/apk/).

## Acceso con Google

1. En Firebase, habilita Authentication → Google y registra Android con el paquete `com.restaurantes.recomendados`.
2. Añade la SHA-1 de la firma de EAS. Cuando publiques en Google Play, añade también la SHA-1 de **la firma de la aplicación de Google Play**, que puede ser distinta de la de subida/EAS.
3. Descarga `google-services.json` actualizado a `apps/mobile/google-services.json`. Está ignorado por Git. No contiene credenciales de administración ni de Neon; es configuración cliente y quedará incorporado en la app compilada.
4. Configura `FIREBASE_PROJECT_ID` en la API con el proyecto de Firebase. No hace falta una clave privada de cuenta de servicio para verificar estos tokens. La API rechaza el modo emulador de Firebase.
5. Ejecuta las migraciones antes de iniciar la nueva API. La migración `010_google_auth.sql` añade el UID de Firebase y permite usuarios sin contraseña, conservando usuarios y restaurantes anteriores.
6. Configura `EXPO_PUBLIC_API_URL` con la API accesible desde el móvil (incluye `/api/v1`). Usa HTTPS para el despliegue público y nunca pongas la conexión de Neon en variables `EXPO_PUBLIC_*`.

La librería nativa de Google no funciona en Expo Go: para probar el login hace falta un nuevo APK o development build. El botón solo se ofrece en Android nativo configurado y con `EXPO_PUBLIC_DEMO_ONLY=false`.

Para EAS, el archivo ignorado se suministra mediante una variable **File** llamada `GOOGLE_SERVICES_JSON`, en el entorno de la compilación. `app.config.js` admite esa ruta o el archivo local. `EXPO_PUBLIC_API_URL` apunta a la API pública en los entornos `preview` y `production`; `preview-google` genera el APK de prueba y `production-google` genera el AAB. El perfil `preview` conserva la demo. No se deben subir claves privadas ni archivos de conexión de la API a EAS.

Flujo: Google entrega su credencial al SDK nativo de Firebase; la app obtiene un **ID token de Firebase**, lo envía a `POST /api/v1/auth/google` y recibe una sesión propia de la API. La API comprueba firma, caducidad, proyecto emisor, proveedor Google y correo verificado; no acepta un correo o UID aportados por el cliente. El token Google no sustituye al token Firebase en ese endpoint.

Las identidades se vinculan por UID inmutable de Firebase. No se fusionan automáticamente cuentas por correo: si una cuenta antigua tiene el mismo email, se devuelve un conflicto para evitar apropiaciones. Esas cuentas y sus restaurantes permanecen en la base de datos y necesitan un procedimiento explícito de migración. Los endpoints de contraseña y confirmación por correo han sido retirados.

Las sesiones duran siete días, solo guardan su hash SHA-256 en PostgreSQL y se revocan al cerrar sesión. Cerrar sesión requiere conexión con la API; si no se puede revocar, la app informa del fallo. La sesión Firebase temporal se cierra después del intercambio. Deshabilitar una cuenta en Firebase no revoca automáticamente las sesiones propias ya emitidas: para una revocación administrativa hay que eliminar sus sesiones de la API. Esta implementación verifica la firma y caducidad del ID token, no su revocación remota en Firebase.

| Método | Ruta bajo /api/v1 | Función |
| --- | --- | --- |
| POST | /auth/google | Recibir { idToken } y devolver { accessToken, expiresAt, user } |
| GET | /auth/me | Consultar usuario autenticado |
| POST | /auth/logout | Revocar la sesión actual |
| GET | /restaurants | Listar restaurantes propios |
| GET | /restaurant-types | Catálogo público de tipos |
| POST | /restaurants | Crear restaurante |
| GET | /restaurants/:id | Consultar restaurante propio |
| PATCH | /restaurants/:id | Modificar los campos enviados |
| DELETE | /restaurants/:id | Eliminar restaurante propio |

Usa el `accessToken` de la API como Bearer en Swagger o en tus peticiones. Los restaurantes se restringen al usuario de la sesión, nunca a un propietario enviado en el cuerpo.

El listado devuelve `{ items, limit, offset }` y admite `query`, `locality`, `price`, `types`, `visitedOnly`, `limit` (1–100) y `offset`. Para varios tipos: `?types=Tapas&types=Sushi`.

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

## Próximos pasos

La API en Vercel y la base persistente en Neon ya están en uso; el login de Google se probó en Android. Los siguientes pasos son completar la verificación de Play Console, terminar de revisar la interfaz clara/oscura y generar el AAB actualizado para las pruebas de Play. Antes de publicar también hay que ofrecer la eliminación de cuenta/datos y las páginas de privacidad necesarias. La importación de datos de la demo es una mejora pendiente.

El límite de peticiones actual está en memoria y está pensado para una instancia de API; hay que revisarlo para un despliegue con múltiples instancias.

La conexión de Neon se guarda localmente en `apps/api/.env.neon`, independiente de `apps/api/.env`, que conserva desarrollo y pruebas locales. Para aplicar migraciones a Neon de forma explícita:

```powershell
cd apps/api
node --env-file=.env.neon scripts/migrate.mjs
```

Las actualizaciones de Android no recrean PostgreSQL. Las migraciones se ejecutan por separado y las ya aplicadas no se modifican. Mantén copias de seguridad externas antes de cambios de esquema con datos reales.

Referencias: [Google con Expo](https://docs.expo.dev/guides/google-authentication/), [Firebase Admin: verificación](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

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
