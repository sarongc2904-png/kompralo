# Virtual Assistant

## Activacion

El asistente se activa con:

```env
NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED=true
```

Para ocultarlo, elimina la variable o usa un valor distinto de `true`.

## Rutas visibles

El asistente se monta solo en estas rutas publicas o de cliente:

- `/invitaciones`
- `/invitaciones/precios`
- `/checkout/success`
- `/cliente`

No se muestra en:

- `/dashboard`
- `/login`
- `/auth`
- `/api`

## Asistente por plan

El asistente publico se controla con `NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED`.

El asistente dentro del dashboard tiene dos controles:

```env
NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true
DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe
```

`NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED` solo controla si el widget puede mostrarse en el cliente.

`DASHBOARD_ASSISTANT_ALLOWED_PLANS` es server-only y define que planes pueden usar el asistente dentro del dashboard. Si falta o esta vacia, el default seguro es apagado para todos.

Ejemplos:

```env
DASHBOARD_ASSISTANT_ALLOWED_PLANS=basic,premium,deluxe
DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe
DASHBOARD_ASSISTANT_ALLOWED_PLANS=deluxe
```

El dominio interno usa exclusivamente `basic`, `premium` y `deluxe`. Los valores heredados `gold` y `platinum` solo se aceptan en fronteras de lectura y se normalizan a `premium` y `deluxe`; nunca se persisten.

La decision real no usa email, tokens ni datos del cliente en el navegador. La ruta del dashboard lee el `planId` de la invitacion y pasa al componente cliente solo un boolean seguro: `enabledForPlan`.

## AV-4B Dashboard Assistant UI

AV-4B agrega una UI especifica para el editor del dashboard. Aparece solo en:

- `/dashboard/invitations/[id]/edit`

Activacion:

```env
NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true
DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe
```

El widget del dashboard permite generar textos para:

- mensaje de bienvenida
- frase de portada
- historia / StoryBook
- mensaje final
- texto para respuesta de asistencia
- dress code
- mesa de regalos
- padres
- padrinos
- itinerario
- hospedaje
- redes sociales

La UI llama `POST /api/assistant` con:

```json
{
  "message": "Prompt interno de generacion de texto",
  "pageContext": {
    "pathname": "/dashboard/invitations/[id]/edit"
  }
}
```

No envia:

- `customerEmail`
- `invitationId`
- tokens
- sesion
- historial completo
- contenido completo de la invitacion

El asistente del dashboard no guarda automaticamente en Supabase y no modifica campos del editor. El usuario debe copiar el texto generado con el boton `Copiar texto` y pegarlo manualmente en el campo que quiera editar.

## AV-1 local

AV-1 funciona sin IA externa. El widget usa reglas locales definidas en:

- `src/features/virtual-assistant/assistantRules.ts`
- `src/features/virtual-assistant/assistantKnowledgeBase.ts`

La conversacion se conserva en `localStorage` del navegador. No se guarda en Supabase.

## AV-2 API interna

AV-2 agrega:

```txt
POST /api/assistant
```

El frontend envia el mensaje del usuario y contexto minimo de pagina:

```json
{
  "message": "Que plan me conviene?",
  "pageContext": {
    "pathname": "/invitaciones/precios"
  },
  "conversationId": "conv-local"
}
```

La API responde con reglas locales:

```json
{
  "answer": "Respuesta del asistente",
  "suggestedActions": [],
  "source": "local-rules"
}
```

Si la API falla, el widget usa fallback local con `getAssistantResponse(message)`.

## AV-3 IA controlada

AV-3 permite que `/api/assistant` use OpenAI solo para mensajes donde la IA aporta valor.

Activacion:

```env
ASSISTANT_AI_ENABLED=true
OPENAI_API_KEY=<server-only-key>
```

`OPENAI_API_KEY` es server-only. Nunca debe tener prefijo `NEXT_PUBLIC_`.

Si `ASSISTANT_AI_ENABLED` falta, es `false`, o no existe `OPENAI_API_KEY`, el asistente sigue funcionando con reglas locales.

### Cuando usa IA

La IA solo se intenta para mensajes creativos o complejos, por ejemplo:

- redactar textos para invitaciones
- mejorar una frase
- hacer un mensaje mas elegante o emotivo
- votos, discursos, historia de amor o mensaje final
- preguntas largas o ambiguas

### Cuando sigue local

Estas intenciones siguen con reglas locales por costo, velocidad y seguridad:

- precios
- planes
- como funciona
- ya compre / post compra
- login
- WhatsApp
- RSVP basico
- soporte basico

### Fallback

El flujo es:

1. `/api/assistant` valida el body.
2. Genera una respuesta local.
3. Decide si vale la pena usar IA.
4. Si IA esta desactivada o no hay key, responde local.
5. Si IA falla, responde la respuesta local con `source: "local-fallback"`.

No hay streaming, tool calls ni historial enviado en AV-3.

## Seguridad

AV-1/AV-2 no usan:

- OpenAI
- SDKs nuevos
- Supabase
- Stripe
- Resend
- service role key
- almacenamiento de conversaciones en base de datos

El cliente solo envia `pathname` como contexto automatico. No envia emails, tokens ni ids de invitacion.

AV-3 tampoco envia emails, invitationId, tokens, session data, service role keys ni historial de conversacion a OpenAI. Solo envia:

- mensaje validado y limitado a 1000 caracteres
- `pathname` no sensible, si existe
- contexto fijo de KOMPRALO

Antes de enviarse a IA, el `pathname` se sanitiza:

- se eliminan query params y hash
- se descartan rutas que contengan senales sensibles como token, email, session, secret, stripe o service_role
- se descartan valores que no parezcan rutas internas

## AV-4 pendiente

AV-4 podra agregar historial controlado, telemetria anonima, metricas de costo y soporte para el dashboard editor.
