# Etapa 5 - Pagos con Mercado Pago

## Eventos webhook procesados
- `payment`: se consulta `/v1/payments/{id}` contra Mercado Pago y recién luego se normaliza estado interno (`pending`, `approved`, `rejected`, `cancelled`, `refunded`, `in_process`).
- `subscription_preapproval`: se consulta `/preapproval/{id}` para sincronizar estado interno de suscripción (`pending`, `authorized`, `paused`, `cancelled`, `ended`).

## Idempotencia
Cada evento se registra en `WebhookEvent` con llave única (`provider`, `eventKey`) para evitar reprocesar notificaciones duplicadas.

## Trazabilidad
- `PaymentOrder`: intento/orden de compra.
- `PaymentTransaction`: transacción confirmada/sincronizada por webhook o reconciliación.
- `Subscription`: relación recurrente por usuario con referencia externa `providerPreapprovalId`.

## Seguridad y coherencia
- No se confirma pago al crear preferencia/preapproval.
- No se confía ciegamente en payload del webhook: se verifica estado contra la API del proveedor.
- Si el modo de monetización deshabilita una modalidad, la API rechaza con `409`.
