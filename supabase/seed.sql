-- =============================================================================
-- Kompralo — Seed Data
-- Run AFTER schema.sql.
-- Creates a demo user (bypasses auth.users) and inserts the 4 demo invitations.
--
-- IMPORTANT: This seed is for development and staging only.
-- Do NOT run in production — the demo user has no real auth account.
--
-- Usage in Supabase SQL Editor:
--   1. Run schema.sql first.
--   2. Run this file (select all → Run).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Demo user
-- We insert directly into auth.users to satisfy the FK on public.users.
-- The password hash is a placeholder — this account cannot log in via the UI.
-- ---------------------------------------------------------------------------
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) values (
  '00000000-0000-0000-0000-000000000001',
  'demo@kompralo.mx',
  '',   -- no real password; use service role key to manage this user
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, full_name, plan_id) values (
  '00000000-0000-0000-0000-000000000001',
  'demo@kompralo.mx',
  'Kompralo Demo',
  'platinum'
) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Helper: we use fixed UUIDs so the seed is idempotent (safe to re-run).
-- ---------------------------------------------------------------------------

-- =============================================================================
-- INVITATION 1: Sofía & Alejandro — Boda — Champagne — Platinum
-- =============================================================================
insert into public.invitations (
  id, user_id, slug, category, variant, template_id,
  plan_id, status, theme_id, title, subtitle,
  event_date, published_at, created_at, updated_at
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'sofia-y-alejandro',
  'wedding', 'couple', 'kompralo-master-wedding-v1',
  'platinum', 'published', 'champagne',
  'Sofía & Alejandro', 'Nuestra Boda',
  '2026-10-24T18:00:00',
  '2026-06-17T09:56:00-05:00',
  '2026-06-16T19:18:00-05:00',
  '2026-06-17T09:56:00-05:00'
) on conflict (id) do nothing;

insert into public.invitation_content (
  id, invitation_id,
  protagonists, event_time, location, hero,
  story, gallery, timeline, itinerary,
  dress_code, gift_registry, music, final_message,
  parents, padrinos, hotels, social,
  rsvp_whatsapp_number, feature_overrides
) values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '[{"id":"sofia","name":"Sofía","role":"bride","familyLabel":"Sofía"},{"id":"alejandro","name":"Alejandro","role":"groom","familyLabel":"Alejandro"}]',
  '18:00 HRS',
  '{"venueName":"Hacienda San José","address":"Carretera Libre a Tepoztlán Km 12.5, Col. El Vergel, Morelos, CP 62520","googleMapsLink":"https://maps.google.com","wazeLink":"https://waze.com/ul"}',
  '{"emotionalPhrase":"\"Porque el amor es un camino que se recorre de la mano, y nuestro destino favorito siempre será el uno con el otro.\"","imageUrl":"https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800","videoUrl":"/video-boda.mp4","eventLabel":"Nuestra Boda"}',
  '{"slides":[{"id":"story-1","imageUrl":"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800","title":"Así nos conocimos","text":"Todo comenzó una tarde lluviosa de otoño."},{"id":"story-2","imageUrl":"https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800","title":"Nuestra primera conversación","text":"Hablamos durante horas sobre el universo, los libros y los sueños."},{"id":"story-3","imageUrl":"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800","title":"Nuestro primer viaje","text":"Esa aventura nos enseñó que juntos todo es mejor."},{"id":"story-4","imageUrl":"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800","title":"El momento perfecto","text":"Y así llegamos al día en que decidimos escribir nuestro para siempre."}]}',
  '{"images":["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800","https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=800","https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"]}',
  '[{"id":"tl-1","year":"2021","title":"Donde todo comenzó","description":"Nuestra primera mirada y una plática interminable en el café del centro."},{"id":"tl-2","year":"2023","title":"Primer viaje juntos","description":"Conquistamos las playas del sur y supimos que éramos el equipo perfecto."},{"id":"tl-3","year":"2025","title":"La propuesta","description":"Un atardecer de verano inolvidable donde decidimos unir nuestras vidas para siempre."}]',
  '[{"id":"iti-1","time":"18:00 HRS","title":"Ceremonia Religiosa","location":"Catedral Metropolitana de la Ciudad","icon":"church"},{"id":"iti-2","time":"19:30 HRS","title":"Cóctel de Bienvenida","location":"Jardín Principal de la Hacienda","icon":"glass"},{"id":"iti-3","time":"20:30 HRS","title":"Recepción y Banquete","location":"Gran Salón de Espejos","icon":"utensils"},{"id":"iti-4","time":"22:30 HRS","title":"Apertura de Pista","location":"Pista Central de Baile","icon":"music"}]',
  '{"type":"Formal Rigurosa (Gala)","description":"Hombres de traje oscuro o esmoquin; Mujeres de vestido largo de noche.","suggestions":"Agradecemos de corazón evitar tonos blancos, marfil y beige."}',
  '{"items":[{"id":"gift-1","provider":"Amazon Wedding Registry","logoType":"amazon","link":"https://www.amazon.com/wedding"},{"id":"gift-2","provider":"Mesa de Regalos Liverpool","logoType":"liverpool","link":"https://mesaderegalos.liverpool.com.mx"},{"id":"gift-3","provider":"Transferencia Bancaria","logoType":"bank","bankDetails":{"bankName":"Banca Premier","clabe":"0123 4567 8901 2345 67","accountOwner":"Sofía y Alejandro"}}]}',
  '{"audioUrl":"/audio/wedding-background.mp3"}',
  '{"quote":"Sin ti este día no estaría completo. Te esperamos con los brazos abiertos para celebrar la vida, el amor y el inicio de nuestra historia.","imageUrl":"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800"}',
  '[{"side":"groom","protagonistId":"alejandro","fatherName":"Roberto Martínez Flores","motherName":"Carmen Ruiz de Martínez"},{"side":"bride","protagonistId":"sofia","fatherName":"Eduardo García Pérez","motherName":"Laura Sánchez de García"}]',
  '[{"id":"p-1","rubro":"Flores","icon":"flowers","names":["Familia Hernández Vega"]},{"id":"p-2","rubro":"Pastel","icon":"cake","names":["Familia Morales Torres"]},{"id":"p-3","rubro":"Música","icon":"music","names":["Familia Reyes Salinas"]},{"id":"p-4","rubro":"Fotografía","icon":"photo","names":["Familia Díaz Guerrero"]},{"id":"p-5","rubro":"Video","icon":"video","names":["Familia López Mendoza"]},{"id":"p-6","rubro":"Arras y Anillos","icon":"rings","names":["Familia Castillo Bravo"]},{"id":"p-7","rubro":"Iluminación","icon":"lights","names":["Familia Vargas Ochoa"]},{"id":"p-8","rubro":"Bebidas","icon":"bar","names":["Familia Jiménez Ríos"]},{"id":"p-9","rubro":"Transporte","icon":"car","names":["Familia Núñez Pedroza"]},{"id":"p-10","rubro":"Lazo y Arras","icon":"church","names":["Familia Aguilar Soto"]}]',
  '[{"id":"h-1","name":"Hotel Boutique Las Palmas","stars":5,"distance":"3 min del venue","priceRange":"$$$","address":"Av. Central 45, Tepoztlán, Morelos","phone":"+52 735 395 0100","bookingLink":"https://booking.com"},{"id":"h-2","name":"Posada del Tepozteco","stars":4,"distance":"8 min del venue","priceRange":"$$","address":"Paraíso 3, Tepoztlán, Morelos","phone":"+52 735 395 0010","bookingLink":"https://booking.com"},{"id":"h-3","name":"Hotel Noa Tepoztlán","stars":4,"distance":"10 min del venue","priceRange":"$$","address":"Revolución 12, Tepoztlán, Morelos","phone":"+52 735 395 0223","bookingLink":"https://booking.com"}]',
  '{"hashtag":"#SofíaYAlejandro","instagramHandle":"@sofiaYalejandro2026","note":"Comparte tus fotos y momentos favoritos del día con nuestro hashtag."}',
  '5215512345678',
  '{}'
) on conflict (id) do nothing;

-- =============================================================================
-- INVITATION 2: Baby Shower Valentina — Floral — Platinum
-- =============================================================================
insert into public.invitations (
  id, user_id, slug, category, variant, template_id,
  plan_id, status, theme_id, title, subtitle,
  event_date, published_at, created_at, updated_at
) values (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'baby-shower-demo',
  'baby-shower', 'girl', 'kompralo-master-baby-shower-v1',
  'platinum', 'published', 'floral',
  'Baby Shower de Valentina', 'Bienvenida al mundo',
  '2027-03-15T11:00:00',
  '2026-06-17T10:00:00-05:00',
  '2026-06-17T10:00:00-05:00',
  '2026-06-17T10:00:00-05:00'
) on conflict (id) do nothing;

insert into public.invitation_content (
  id, invitation_id,
  protagonists, event_time, location, hero,
  story, gallery, timeline, itinerary,
  dress_code, gift_registry, music, final_message,
  parents, padrinos, hotels, social,
  rsvp_whatsapp_number, feature_overrides
) values (
  '20000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '[{"id":"valentina","name":"Valentina","role":"bride","familyLabel":"Valentina"}]',
  '11:00 HRS',
  '{"venueName":"Jardín Rosaleda","address":"Av. de las Flores 120, Col. Jardines, Guadalajara, Jalisco, CP 44900","googleMapsLink":"https://maps.google.com","wazeLink":"https://waze.com/ul"}',
  '{"emotionalPhrase":"\"Cada bebé es un poema de amor escrito en el cielo, y este es el nuestro.\"","imageUrl":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800","eventLabel":"Baby Shower"}',
  '{"slides":[]}',
  '{"images":["https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800","https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800","https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800"]}',
  '[]',
  '[{"id":"iti-1","time":"11:00 HRS","title":"Llegada de Invitados","location":"Entrada principal del Jardín Rosaleda","icon":"glass"},{"id":"iti-2","time":"11:30 HRS","title":"Juegos y Actividades","location":"Área central del jardín","icon":"music"},{"id":"iti-3","time":"13:00 HRS","title":"Brunch y Pastel","location":"Salón de banquetes","icon":"utensils"},{"id":"iti-4","time":"14:30 HRS","title":"Apertura de Regalos","location":"Área de honor","icon":"rings"}]',
  '{"type":"Casual Elegante","description":"Colores pastel, blancos y rosas. Outfits cómodos y festivos.","suggestions":"Evitar colores muy oscuros. ¡Ven lista para jugar!"}',
  '{"items":[{"id":"gift-1","provider":"Amazon Baby Registry","logoType":"amazon","link":"https://www.amazon.com/baby"},{"id":"gift-2","provider":"Mesa de Regalos Liverpool","logoType":"liverpool","link":"https://mesaderegalos.liverpool.com.mx"},{"id":"gift-3","provider":"Transferencia Bancaria","logoType":"bank","bankDetails":{"bankName":"Banca Premier","clabe":"0123 4567 8901 2345 67","accountOwner":"Familia Rodríguez"}}]}',
  '{"audioUrl":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"}',
  '{"quote":"Tu presencia es el regalo más grande que Valentina puede recibir. Te esperamos con el corazón lleno de alegría.","imageUrl":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800"}',
  '[{"side":"bride","protagonistId":"valentina","fatherName":"Carlos Rodríguez Medina","motherName":"Andrea Fuentes de Rodríguez"}]',
  '[]',
  '[{"id":"h-1","name":"Hotel Demetria","stars":5,"distance":"5 min del venue","priceRange":"$$$","address":"Av. Américas 1600, Guadalajara, Jalisco","phone":"+52 33 3669 9000","bookingLink":"https://booking.com"}]',
  '{"hashtag":"#BabyValentina2027","instagramHandle":"@babyvalentina","note":"¡Comparte tus fotos del día con nuestro hashtag y ayúdanos a recordar este momento!"}',
  '5215512345678',
  '{"showStoryBook":false,"showTimeline":false,"showPadrinos":false,"showGiftRegistry":true,"showHashtag":true}'
) on conflict (id) do nothing;

-- =============================================================================
-- INVITATION 3: Cumpleaños Isabella — Azure — Gold
-- =============================================================================
insert into public.invitations (
  id, user_id, slug, category, variant, template_id,
  plan_id, status, theme_id, title, subtitle,
  event_date, published_at, created_at, updated_at
) values (
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'birthday-demo',
  'birthday', 'woman', 'kompralo-master-birthday-v1',
  'gold', 'published', 'azure',
  'Cumpleaños de Isabella', '30 años',
  '2027-05-20T19:00:00',
  '2026-06-17T10:00:00-05:00',
  '2026-06-17T10:00:00-05:00',
  '2026-06-17T10:00:00-05:00'
) on conflict (id) do nothing;

insert into public.invitation_content (
  id, invitation_id,
  protagonists, event_time, location, hero,
  story, gallery, timeline, itinerary,
  dress_code, gift_registry, music, final_message,
  parents, padrinos, hotels, social,
  rsvp_whatsapp_number, feature_overrides
) values (
  '20000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  '[{"id":"isabella","name":"Isabella","role":"bride","familyLabel":"Isabella"}]',
  '19:00 HRS',
  '{"venueName":"Terraza Vista Hermosa","address":"Paseo de la Reforma 250, Piso 14, Col. Cuauhtémoc, CDMX, CP 06600","googleMapsLink":"https://maps.google.com","wazeLink":"https://waze.com/ul"}',
  '{"emotionalPhrase":"\"Treinta años de historias, risas y sueños. Esta noche los celebramos contigo.\"","imageUrl":"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800","eventLabel":"30 Años"}',
  '{"slides":[]}',
  '{"images":["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800","https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=800","https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800","https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=800"]}',
  '[]',
  '[{"id":"iti-1","time":"19:00 HRS","title":"Coctelería de Bienvenida","location":"Terraza principal con vista a la ciudad","icon":"glass"},{"id":"iti-2","time":"20:30 HRS","title":"Cena de Gala","location":"Salón principal Vista Hermosa","icon":"utensils"},{"id":"iti-3","time":"22:00 HRS","title":"Pastel y Brindis","location":"Centro del salón","icon":"rings"},{"id":"iti-4","time":"22:30 HRS","title":"Música y Baile","location":"Pista de baile","icon":"music"}]',
  '{"type":"Cocktail","description":"Vestido de cóctel o traje formal. Colores vibrantes bienvenidos.","suggestions":"Paleta sugerida: azules, dorados y blancos rotos. ¡Luce espléndida!"}',
  '{"items":[{"id":"gift-1","provider":"Amazon Wish List","logoType":"amazon","link":"https://www.amazon.com"},{"id":"gift-2","provider":"Transferencia Bancaria","logoType":"bank","bankDetails":{"bankName":"BBVA México","clabe":"0123 4567 8901 2345 67","accountOwner":"Isabella Moreno"}},{"id":"gift-3","provider":"Mesa de Regalos Liverpool","logoType":"liverpool","link":"https://mesaderegalos.liverpool.com.mx"}]}',
  '{"audioUrl":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"}',
  '{"quote":"Tu compañía hace que cada momento valga doble. Gracias por ser parte de mi historia y de esta noche tan especial.","imageUrl":"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800"}',
  '[]',
  '[]',
  '[{"id":"h-1","name":"Hotel Marquis Reforma","stars":5,"distance":"2 min del venue","priceRange":"$$$","address":"Paseo de la Reforma 465, CDMX","phone":"+52 55 5229 1200","bookingLink":"https://booking.com"},{"id":"h-2","name":"Camino Real Polanco","stars":5,"distance":"10 min del venue","priceRange":"$$$","address":"Mariano Escobedo 700, Polanco, CDMX","phone":"+52 55 5263 8888","bookingLink":"https://booking.com"}]',
  '{"hashtag":"#Isabella30","instagramHandle":"@isabella30fest","note":"Comparte los mejores momentos de la noche. ¡Queremos verlos!"}',
  '5215512345678',
  '{"showStoryBook":false,"showTimeline":false,"showParents":false,"showPadrinos":false,"showGiftRegistry":true,"showHashtag":true}'
) on conflict (id) do nothing;

-- =============================================================================
-- INVITATION 4: Bautizo Emilia — Azure — Gold
-- =============================================================================
insert into public.invitations (
  id, user_id, slug, category, variant, template_id,
  plan_id, status, theme_id, title, subtitle,
  event_date, published_at, created_at, updated_at
) values (
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'baptism-demo',
  'baptism', 'girl', 'kompralo-master-baptism-v1',
  'gold', 'published', 'azure',
  'Bautizo de Emilia', 'Bienvenida a la fe',
  '2027-04-18T10:30:00',
  '2026-06-17T10:30:00-05:00',
  '2026-06-17T10:30:00-05:00',
  '2026-06-17T10:30:00-05:00'
) on conflict (id) do nothing;

insert into public.invitation_content (
  id, invitation_id,
  protagonists, event_time, location, hero,
  story, gallery, timeline, itinerary,
  dress_code, gift_registry, music, final_message,
  parents, padrinos, hotels, social,
  rsvp_whatsapp_number, feature_overrides
) values (
  '20000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000004',
  '[{"id":"emilia","name":"Emilia","role":"bride","familyLabel":"Emilia"}]',
  '10:30 HRS',
  '{"venueName":"Parroquia del Sagrado Corazón","address":"Calle Hidalgo 45, Col. Centro, San Miguel de Allende, Guanajuato, CP 37700","googleMapsLink":"https://maps.google.com","wazeLink":"https://waze.com/ul"}',
  '{"emotionalPhrase":"\"Con amor la recibimos en el mundo, y con fe la entregamos a Dios.\"","imageUrl":"https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800","eventLabel":"Bautizo"}',
  '{"slides":[]}',
  '{"images":["https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800","https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=800","https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800","https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800"]}',
  '[]',
  '[{"id":"iti-1","time":"10:30 HRS","title":"Ceremonia de Bautizo","location":"Parroquia del Sagrado Corazón","icon":"church"},{"id":"iti-2","time":"12:00 HRS","title":"Sesión de Fotos","location":"Atrio de la Parroquia","icon":"rings"},{"id":"iti-3","time":"13:00 HRS","title":"Recepción y Almuerzo","location":"Hacienda El Recreo, San Miguel de Allende","icon":"utensils"},{"id":"iti-4","time":"15:00 HRS","title":"Pastel y Brindis","location":"Jardín principal de la hacienda","icon":"glass"}]',
  '{"type":"Formal Elegante","description":"Colores claros y pastel. Vestimenta respetuosa para la ceremonia religiosa.","suggestions":"Tonos blancos, azules suaves, lilas y beige. Evitar colores oscuros."}',
  '{"items":[{"id":"gift-1","provider":"Amazon Baby Registry","logoType":"amazon","link":"https://www.amazon.com/baby"},{"id":"gift-2","provider":"Mesa de Regalos Liverpool","logoType":"liverpool","link":"https://mesaderegalos.liverpool.com.mx"},{"id":"gift-3","provider":"Transferencia Bancaria","logoType":"bank","bankDetails":{"bankName":"Banorte","clabe":"0123 4567 8901 2345 67","accountOwner":"Familia Castillo Reyes"}}]}',
  '{"audioUrl":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"}',
  '{"quote":"Hoy Emilia recibe la luz de la fe. Gracias por compartir con nosotros este día tan sagrado e irrepetible.","imageUrl":"https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800"}',
  '[{"side":"bride","protagonistId":"emilia","fatherName":"Diego Castillo Mendoza","motherName":"Fernanda Reyes de Castillo"}]',
  '[{"id":"p-1","rubro":"Bautismo","icon":"church","names":["Familia Gutiérrez Lara"]},{"id":"p-2","rubro":"Flores","icon":"flowers","names":["Familia Peña Solís"]},{"id":"p-3","rubro":"Pastel","icon":"cake","names":["Familia Ramírez Vega"]},{"id":"p-4","rubro":"Fotografía","icon":"photo","names":["Familia Torres Núñez"]},{"id":"p-5","rubro":"Recuerdos","icon":"gift","names":["Familia Álvarez Cruz"]}]',
  '[]',
  '{"hashtag":"#BautizoEmilia2027","instagramHandle":"@bautizoemilia","note":"Comparte los momentos más especiales del día con nuestro hashtag."}',
  '5215512345678',
  '{"showStoryBook":false,"showTimeline":false,"showHashtag":true,"showGiftRegistry":true,"showPadrinos":true,"showAccommodation":false}'
) on conflict (id) do nothing;
