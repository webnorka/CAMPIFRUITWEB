# INFORME UI/UX Integral - Campifruit Web

Fecha de auditoria: 2026-02-06
Proyecto: CAMPIFRUITWEB
Objetivo: evaluar experiencia cliente + admin, flujos completos (catalogo, productos, cesta, checkout/pago, panel admin) y definir backlog accionable para llevar el producto a nivel SOTA (look and feel, rendimiento, operacion, facilidad de uso).

## 1) Resumen ejecutivo

Estado general actual:
- UI visual: buena base visual premium, consistente en branding, con componentes modernos.
- Flujo cliente: funcional para pedido por WhatsApp, pero incompleto para ecommerce moderno (sin pasarela activa, sin descuentos en checkout, sin identidad de cliente).
- Flujo admin: amplio en superficie (pedidos, productos, familias, carrusel, promociones, codigos, clientes), pero con desconexiones funcionales importantes entre modulos.
- Calidad tecnica: build OK, lint FAIL con 28 errores.

Puntuacion actual (estimada):
- Cliente UX: 6.5/10
- Admin UX: 6.0/10
- Integridad funcional end-to-end: 4.5/10
- Rendimiento base frontend: 7.5/10
- Accesibilidad/usabilidad operativa: 5.5/10

Bloqueantes principales (P0):
1. Ruta de login admin con wiring inconsistente de autenticacion.
2. Configuracion con accion de reset no implementada.
3. Editor de familias con callback de upload incorrecto.
4. Selector de familia en productos filtrando por campo inexistente.
5. Carrusel admin no impacta el carrusel publico real.
6. Promociones/codigos no conectados al checkout.
7. Modelo clientes no conectado a creacion de pedidos.

## 2) Metodologia y evidencia

Revision realizada sobre:
- Frontend publico: `app/src/public`, `app/src/pages`, `app/src/components`, `app/src/context`.
- Frontend admin: `app/src/admin`.
- Servicios: `app/src/services`.
- Esquema y migraciones: `migrations`, `docs/audits/sql`.
- Baseline operativo: `docs/audits/2026-02-06-baseline-inventory.md`.

Comandos ejecutados:
- `npm run build` en `app/` -> OK.
- `npm run lint` en `app/` -> FAIL (28 errores).

Resultado build (2026-02-06):
- `dist/assets/index-o-hS1ZhK.js`: 454.38 KB (gzip 132.41 KB)
- `dist/assets/AdminPanel-BnHGqO34.js`: 195.12 KB (gzip 45.18 KB)
- `dist/assets/index-CNBfP_3Z.css`: 88.04 KB (gzip 12.74 KB)

Resultado lint:
- 28 errores (hooks, vars no usadas, fast-refresh rules, no-undef, etc.).

## 3) Mapa de flujos actuales

### 3.1 Flujo cliente (actual)

1. Entrada y navegacion:
- Home (`/`) -> Catalogo (`/catalogo`).
- Header fijo + CTA Hero + barra de cesta flotante.

2. Catalogo:
- Productos cargados desde Supabase via `ProductsContext`.
- Agrupacion por categoria.
- Tarjetas con precio/oferta y agregar a cesta.

3. Cesta y checkout:
- Cesta modal con cantidades y resumen.
- Checkout pide nombre + notas.
- Se crea pedido por RPC `create_order`.
- Se abre WhatsApp con mensaje formateado.

4. Poscheckout:
- Limpia cesta y cierra modal.
- No hay pagina de confirmacion ni tracking.

### 3.2 Flujo admin (actual)

1. Acceso:
- Login admin en `/admin/login`.
- Panel protegido en `/admin/*`.

2. Modulos de panel:
- Pedidos: listado, filtro, cambio de estado, export CSV.
- Clientes: listado, detalle, notas, historial por customer_id.
- Productos: CRUD, ofertas, stock, SKU, acciones masivas.
- Familias: CRUD, orden drag-and-drop, visibilidad.
- Carrusel: CRUD de slides y orden.
- Promociones: CRUD.
- Codigos descuento: CRUD y limites de uso.
- Configuracion: branding, WhatsApp, hero, colores, footer.

## 4) Hallazgos priorizados

## P0 - Bloqueantes funcionales

1. Login admin con wiring de contexto inconsistente.
- Evidencia: `app/src/App.jsx:36` renderiza `AdminLogin` fuera de `AuthProvider`; `app/src/admin/AdminLogin.jsx:9` usa `useAuth()`.
- Impacto: riesgo de crash o flujo de login no confiable.
- Accion: envolver `AdminLogin` en `AuthProvider` o mover login dentro de `AdminApp` con ruta dedicada.

2. `resetConfig` no existe en contexto.
- Evidencia: `app/src/admin/ConfigEditor.jsx:7` y boton en `app/src/admin/ConfigEditor.jsx:38`; `ConfigContext` no expone reset (`app/src/context/ConfigContext.jsx:119`).
- Impacto: error en runtime al usar reset.
- Accion: implementar `resetConfig` real (defaults + persistencia) o remover CTA.

3. Upload de familias roto por prop incorrecta.
- Evidencia: `app/src/admin/FamiliesEditor.jsx:189` usa `onImageChange`; componente espera `onUpload` (`app/src/components/ImageUpload.jsx:6` y uso en `:99`).
- Impacto: no se puede guardar imagen de familia.
- Accion: estandarizar contrato de `ImageUpload` y corregir llamadas.

4. Selector de familia en productos filtra por campo inexistente.
- Evidencia: `app/src/admin/ProductEditor.jsx:377` filtra `f.visible`; el modelo maneja `active` (`app/src/context/FamiliesContext.jsx:38`).
- Impacto: familias no aparecen en editor de producto.
- Accion: reemplazar por `f.active`.

5. Carrusel admin desconectado del frontend cliente.
- Evidencia: admin edita `carousel_slides` (`app/src/admin/CarouselEditor.jsx:23`), pero frontend usa ofertas de `products` (`app/src/components/OfferCarousel.jsx:12`) y no consume `slides`.
- Impacto: trabajo de admin en carrusel no se refleja en tienda.
- Accion: decidir fuente unica (slides o ofertas) e integrar.

6. Promociones y codigos no aplican en checkout.
- Evidencia: checkout solo envia items, nombre, notas (`app/src/services/checkoutService.js:7-18`); `CartModal` no tiene campo de codigo (`app/src/components/CartModal.jsx:96-147`); servicio de descuentos existe pero no se usa (`app/src/services/discountService.js:11`, busqueda global sin usos).
- Impacto: modulo admin de promos/codigos sin valor para cliente.
- Accion: integrar validacion/consumo en flujo checkout + persistir `discount_code`/`discount_amount`.

7. Modulo clientes desconectado del pedido real.
- Evidencia: `create_order` no guarda `customer_id` (`migrations/006_secure_order_api.sql:66-68`); panel clientes consulta pedidos por `customer_id` (`app/src/admin/CustomersPanel.jsx:64`). Baseline reporta `customers` en 0 (`docs/audits/2026-02-06-baseline-inventory.md:18`).
- Impacto: CRM admin sin datos reales.
- Accion: capturar email/telefono en checkout y resolver customer upsert + enlace en orden.

## P1 - Alto impacto UX/operacion

1. Pasarela de pago no implementada aunque esquema la contempla.
- Evidencia: columnas/payment flags en esquema (`docs/audits/sql/2026-02-06-schema-snapshot.sql:30-32`, `:76-78`), pero UI checkout solo WhatsApp (`app/src/components/CartModal.jsx:237-248`).
- Impacto: flujo ecommerce incompleto para conversion y escalado.
- Accion: implementar paso de metodo de pago con Stripe/alternativa.

2. Feedback UX basado en `alert/confirm/prompt`.
- Evidencia: multiples usos en cliente/admin (ej. `app/src/components/CartModal.jsx:20`, `app/src/admin/ProductEditor.jsx:392`).
- Impacto: experiencia poco pulida, bloqueo de flujo, inconsistencia visual.
- Accion: unificar sistema de toasts, dialogs y validaciones inline.

3. Export CSV sin escape robusto.
- Evidencia: join por comas sin sanitizacion en `OrdersList` (`app/src/admin/OrdersList.jsx:79`) y `CustomersPanel` (`app/src/admin/CustomersPanel.jsx:105`).
- Impacto: riesgo de CSV roto/inyeccion formula.
- Accion: usar serializador CSV seguro y escapar celdas.

4. Carga de datos global en publico sin segmentacion por ruta.
- Evidencia: providers globales para products/families/carousel en `App` (`app/src/App.jsx:29-33`) y fetch inmediato en cada context (`ProductsContext.jsx:35-37`, `FamiliesContext.jsx:26-28`, `CarouselContext.jsx:37-39`).
- Impacto: solicitudes innecesarias y trabajo extra en Home.
- Accion: lazy providers por ruta o fetch on-demand.

5. Calidad de codigo por debajo de umbral de entrega.
- Evidencia: `npm run lint` -> 28 errores.
- Impacto: deuda tecnica y mayor probabilidad de regresiones.
- Accion: cerrar lint a cero y agregar checks en CI.

## P2 - Mejoras SOTA (look, feeling, accesibilidad, conversion)

1. CTA principal del carrusel sin accion real.
- Evidencia: boton "Anadir al carrito" sin `onClick` en `app/src/components/OfferCarousel.jsx:82-84`.
- Impacto: friccion de conversion.

2. Carrito no persistente entre recargas.
- Evidencia: `CartContext` usa solo estado en memoria (`app/src/context/CartContext.jsx:6-41`).
- Impacto: perdida de intencion de compra.

3. Accesibilidad mejorable en modales y controles.
- Evidencia: modales custom sin manejo explicito de foco/ESC/trap (ej. `CartModal`, modales admin), icon-buttons sin `aria-label` explicito en varios casos.
- Impacto: experiencia pobre para teclado/lectores.

4. Falta de estado de confirmacion post-pedido.
- Impacto: menor confianza del cliente, menos claridad de exito/error.

## 5) Evaluacion de flujos por dominio

## 5.1 Cliente

Navegacion y descubrimiento:
- Fortaleza: home y catalogo claros, diseño visual fuerte.
- Gap: sin buscador/filtros avanzados por familia o rango de precio.

Cesta:
- Fortaleza: controles de cantidad claros, resumen visible.
- Gap: no persistencia, no codigo promocional, no validacion de stock al confirmar.

Checkout:
- Fortaleza: RPC server-side para total evita manipulacion de precios.
- Gap: sin pago online, sin datos minimos de contacto (email/telefono), sin terminos/consent, sin paso de confirmacion.

Post-orden:
- Fortaleza: mensaje WhatsApp automatico.
- Gap: sin pantalla de "pedido recibido" ni id de orden visible para usuario.

## 5.2 Admin

Pedidos:
- Fortaleza: lectura clara + cambio de estado + export.
- Gap: no gestion de pago (`payment_status`), no filtros por fecha avanzada, export vulnerable.

Productos:
- Fortaleza: CRUD amplio, oferta y lote.
- Gap: bug de familias, validaciones limitadas (precios negativos/edge-cases), UX de categorias via prompt.

Familias:
- Fortaleza: orden visual y visibilidad.
- Gap: bug de upload.

Carrusel:
- Fortaleza: editor completo.
- Gap: desconectado de frontend publico.

Promociones/Codigos:
- Fortaleza: CRUD completo.
- Gap: no impacto real en checkout.

Clientes:
- Fortaleza: UI completa para CRM.
- Gap: sin data real conectada al checkout.

Configuracion:
- Fortaleza: personalizacion amplia.
- Gap: reset roto, falta de guardrails para valores invalidos.

## 6) Plan de accion recomendado para agente IA (priorizado)

## Fase A - Estabilizacion critica (P0)

Objetivo: dejar todos los flujos funcionales y consistentes.

Tareas:
1. Corregir wiring de auth/login admin.
- Archivos: `app/src/App.jsx`, `app/src/admin/AdminApp.jsx`, `app/src/admin/AdminLogin.jsx`.
- Criterio: login funciona siempre, sin crash y con redireccion limpia.

2. Implementar `resetConfig` o retirar boton.
- Archivos: `app/src/context/ConfigContext.jsx`, `app/src/admin/ConfigEditor.jsx`.
- Criterio: reset aplica defaults y persiste en DB.

3. Corregir upload familias + contrato unificado de ImageUpload.
- Archivos: `app/src/admin/FamiliesEditor.jsx`, `app/src/components/ImageUpload.jsx`.
- Criterio: imagen de familia se guarda y se visualiza.

4. Corregir filtro de familia en productos (`visible` -> `active`).
- Archivos: `app/src/admin/ProductEditor.jsx`.
- Criterio: selector de familia muestra datos activos.

5. Unificar carrusel admin-publico.
- Archivos: `app/src/components/OfferCarousel.jsx`, `app/src/context/CarouselContext.jsx` (y/o `CatalogPage`).
- Criterio: cambios del admin se reflejan en storefront.

## Fase B - Cierre funcional ecommerce

Objetivo: flujo comercial completo.

Tareas:
1. Integrar codigos de descuento en checkout (UI + RPC atomico).
- Archivos: `app/src/components/CartModal.jsx`, `app/src/services/discountService.js`, `migrations/006_secure_order_api.sql` (o nueva migracion).
- Criterio: codigo valido descuenta total y queda trazado en orden.

2. Integrar cliente real en pedido.
- Capturar email/telefono, upsert customer y set `customer_id`.
- Archivos: checkout + SQL function + panel clientes.
- Criterio: pedidos aparecen en historial por cliente.

3. Implementar pasarela de pago (si scope negocio lo requiere).
- Metodo recomendado: checkout hibrido WhatsApp + pago online configurable por `config`.
- Criterio: `payment_method` y `payment_status` reflejan estado real.

## Fase C - UX polish SOTA

Objetivo: experiencia premium coherente y friccion minima.

Tareas:
1. Sustituir `alert/confirm/prompt` por sistema de dialogs/toasts.
2. Persistir cesta en `localStorage` con recuperacion segura.
3. Agregar vista de confirmacion de pedido con ID y resumen.
4. Mejorar accesibilidad: focus trap, ESC en modales, aria-labels, contrast checks.
5. Mejorar filtrado catalogo: por familia, oferta, texto, precio.

## Fase D - Calidad, rendimiento y observabilidad

Objetivo: release estable y medible.

Tareas:
1. Dejar `npm run lint` en 0.
2. Agregar pruebas E2E minimas:
- cliente compra completa.
- admin CRUD producto.
- admin aplica promo y cliente la usa.
3. Endurecer export CSV.
4. Revisar carga inicial de providers para evitar fetch innecesario en home.
5. Mantener k6 como gate de carga antes de release.

## 7) Checklist de aceptacion final (DoD)

Checklist funcional:
- Cliente puede comprar por WhatsApp sin errores.
- Cliente puede aplicar codigo (si configurado).
- Cliente puede pagar online (si habilitado).
- Admin puede gestionar productos/familias/carrusel y ver efecto en vivo.
- Admin puede ver clientes con pedidos asociados.

Checklist UX:
- No hay alerts nativos en flujo principal.
- Estados loading/empty/error consistentes.
- Modales accesibles por teclado y cierre ESC.

Checklist tecnico:
- `npm run build` OK.
- `npm run lint` OK (0 errores).
- Pruebas E2E y smoke tests de flujo completo OK.
- k6 catalogo/checkout dentro de umbrales definidos.

## 8) Conclusiones

La app tiene una base visual buena y una estructura amplia, pero hoy no cumple todavia un workflow ecommerce/admin "pulido" de punta a punta por desconexiones criticas entre modulos.

Prioridad real para alcanzar nivel cliente/admin SOTA:
1. Reparar P0 de wiring y contratos UI.
2. Conectar promociones, clientes y checkout en un solo flujo coherente.
3. Completar pago online configurable.
4. Cerrar deuda UX y calidad tecnica (lint/tests/accesibilidad).

Con ese orden, el salto de calidad es alto sin reescribir toda la app.
