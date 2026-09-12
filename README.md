# Restaurantes recomendados

Aplicación móvil hecha con React Native y Expo para conservar restaurantes recomendados. Los datos se guardan localmente en el teléfono. Los iconos junto al nombre abren búsquedas gratuitas en Google Maps o Google.

## Estructura

`src/screens` contiene las pantallas; `src/components`, las piezas reutilizables; `src/navigation`, las rutas; `src/services`, la persistencia y el estado compartido; y `src/types`, los contratos TypeScript.

## Arranque

```powershell
cd C:\Repositorios\restaurantes-recomendados
npm install
npx expo start
```

Para comprobar tipos:

```powershell
npm run typecheck
```

## Probarla en el móvil

1. Instala **Expo Go** desde Google Play o App Store.
2. Asegúrate de que teléfono y ordenador estén en la misma red Wi-Fi.
3. Ejecuta `npx expo start` y escanea el QR mostrado en el terminal con Expo Go (Android) o la cámara (iPhone).
4. Si la red local bloquea la conexión, ejecuta `npx expo start --tunnel`.

## Búsqueda de Google

No requiere clave de Google ni cuenta de facturación. Tras introducir un nombre, toca el icono de localización para buscarlo en Google Maps o la `G` para abrir la búsqueda web de Google.
