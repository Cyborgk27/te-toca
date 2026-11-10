# Te Toca

> *Mi loco, mañana te toca.*

App interna para saber **quién va a la oficina** cada semana. Turnos de **lunes y martes**, con rotación de **4 semanas** entre las mismas personas.

Incluye calendario mensual, vista anual, próximos turnos, feriados de Ecuador, modo claro/oscuro y exportación a `.ics`.

## Rotación actual

| Persona | Turno |
| --- | --- |
| Roberto Oyola | semana 1 |
| Daniel Hinostrosa | semana 2 |
| Bryan Vera | semana 3 |
| Kevin Cepeda | semana 4 |

- Ancla: **lunes 9 de noviembre de 2026** (turno de Daniel).
- Cada persona vuelve a ir cada **28 días**.
- Cada quien puede elegir su nombre en **“¿Quién eres?”**; la selección se guarda solo en su navegador y activa la etiqueta **Tú**.

## Feriados

La lista vive en `src/app/core/holidays.ts` y se puede editar sin tocar la lógica.

- **2026** está cargado con el calendario oficial (incluye los decretos del 2 de enero y 20 de noviembre).
- **2027** está como preliminar y la app lo indica como *por confirmar*.
- Si un feriado cae en lunes o martes de turno, la app lo resalta y muestra un aviso.
- **La rotación no se reprograma**: el feriado solo se señala. Siempre hay que confirmar con el líder técnico.

## Cómo usar el `.ics`

1. En la app, pulsa **Descargar .ics**. Se descarga `te-toca-rotacion.ics` con los próximos 12 meses.
2. **Google Calendar:** Configuración → Importar y exportar → Importar → elegir el archivo → calendario “Oficina”.
3. **Outlook:** Calendario → Agregar calendario → Cargar desde archivo (o Archivo → Abrir y exportar → Importar iCalendar en escritorio).
4. **iPhone / iPad:** abrir el archivo → Compartir → Calendario → Agregar todo.
5. **Android:** importar desde Google Calendar web; la app no acepta `.ics` directamente. **Mac:** Calendario → Archivo → Importar.

> Es una foto de las próximas 52 semanas: no se actualiza sola. Para evitar duplicados al reimportar, usa un calendario aparte llamado **“Oficina”**.

## Desarrollo

```bash
npm install
npm start
```

Abre `http://localhost:4200`.

```bash
npm test
npm run build
```

## Configuración

Todo lo editable está en `src/app/core/rotation.config.ts`:

- `anchorMonday`: lunes de inicio de un turno.
- `anchorPersonId`: persona a la que le toca ese lunes.
- `order`: orden de la rotación.
- `officeDayOffsets`: días de oficina (0 = lunes, 1 = martes).
- `PEOPLE`: nombres, iniciales y colores.

La persona que está viendo la app se elige con el selector **“¿Quién eres?”** y se guarda en `localStorage` de ese navegador. No hay nada personal quemado en el código.

## Deploy en GitHub Pages

1. Crea un repositorio en GitHub y sube este proyecto a la rama `main`.
2. En **Settings → Pages**, elige **GitHub Actions** como source.
3. El workflow `.github/workflows/deploy.yml` compila y publica automáticamente.

El build usa `baseHref: "./"`, así funciona tanto en `usuario.github.io/te-toca/` como en un dominio propio. No hay router, por lo que no necesita reglas de rewrite.

> GitHub Pages para repositorios privados requiere plan Pro/Enterprise.

## Aviso

Calendario referencial. Los feriados, las jornadas suspendidas y las condiciones de asistencia pueden variar por disposiciones internas del banco. Antes de asistir, corrobora con tu líder técnico. Esta no es una app oficial del banco.
