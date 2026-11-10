# Te Toca

> *Mi loco, mañana te toca.*

App interna para saber **quién va a la oficina** cada semana. Turnos de **lunes y martes**, con rotación de **4 semanas** entre las mismas personas.

Incluye calendario mensual, vista anual, próximos turnos, feriados de Ecuador, modo claro/oscuro y exportación a `.ics`.

## Rotación actual

| Persona | Turno |
| --- | --- |
| Roberto Oyola | semana 1 |
| Daniel Hinostroza | semana 2 |
| Bryan Vera | semana 3 |
| Kevin Cepeda | semana 4 |

- Ancla: **lunes 9 de noviembre de 2026** (turno de Daniel).
- Cada persona vuelve a ir cada **28 días**.
- Kevin (tú) tiene su turno marcado con la etiqueta **Tú**.

## Feriados

La lista vive en `src/app/core/holidays.ts` y se puede editar sin tocar la lógica.

- **2026** está cargado con el calendario oficial (incluye los decretos del 2 de enero y 20 de noviembre).
- **2027** está como preliminar y la app lo indica como *por confirmar*.
- Si un feriado cae en lunes o martes de turno, la app lo resalta y muestra un aviso.
- **La rotación no se reprograma**: el feriado solo se señala. Siempre hay que confirmar con el líder técnico.

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
- `meId`: persona que se marca como “Tú”.
- `PEOPLE`: nombres, iniciales y colores.

## Deploy en GitHub Pages

1. Crea un repositorio en GitHub y sube este proyecto a la rama `main`.
2. En **Settings → Pages**, elige **GitHub Actions** como source.
3. El workflow `.github/workflows/deploy.yml` compila y publica automáticamente.

El build usa `baseHref: "./"`, así funciona tanto en `usuario.github.io/te-toca/` como en un dominio propio. No hay router, por lo que no necesita reglas de rewrite.

> GitHub Pages para repositorios privados requiere plan Pro/Enterprise.

## Aviso

Calendario referencial. Los feriados, las jornadas suspendidas y las condiciones de asistencia pueden variar por disposiciones internas del banco. Antes de asistir, corrobora con tu líder técnico. Esta no es una app oficial del banco.
