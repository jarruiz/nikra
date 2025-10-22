-- ==============================================
-- 🏪 INSERTAR DATOS DE COMERCIOS CON UUID AUTOMÁTICO
-- ==============================================
-- Script para insertar los datos de comercios.json en la tabla associates
-- Los UUIDs se generan automáticamente

-- Verificar que la tabla existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'associates';

-- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'associates' 
ORDER BY ordinal_position;

-- Insertar datos de comercios (sin especificar id, se genera automáticamente)
INSERT INTO associates (
    nombre,
    descripcion,
    telefono,
    direccion,
    maps_url,
    web_texto,
    web_url,
    rrss_texto,
    rrss_url,
    imagen,
    activo
) VALUES 
('CHAROL ZAPATOS', 'Tu tienda Multimarca en Ceuta, para ellas y ellos las mejores marcas en el sector del calzado. Conoce nuestros establecimientos donde nuestro equipo de profesionales te atenderá de manera individual, profesional y cercana... Porque llevamos un largo recorrido caminando con nuestros clientes.', '+34956514406', 'Paseo del Revellín, 9', 'https://www.google.com/maps/search/?api=1&query=CHAROL+ZAPATOS+Paseo+del+Revellín,+9,+51001,+Ceuta', '', 'https://nan', 'Facebook', 'https://www.facebook.com/charolzapatosceuta/', 'charol-zapatos-card.webp', true),

('QREATIVOS', 'No somos una agencia más, lo nuestro es una vocación, nos apasiona. Queremos lo mejor para ti y para tu empresa... y se nos nota. Queremos que tu empresa sea mejor, porque eso nos hará ser mejores.', '+34956748011', 'Plaza de los Reyes, s/n. Edificio Plaza de los Reyes, Local 7', 'https://www.google.com/maps/search/?api=1&query=QREATIVOS+Plaza+de+los+Reyes,+s/n.+Edificio+Plaza+de+los+Reyes,+Local+7,+51001+Ceuta', 'qreativos.es', 'http://www.qreativos.es', 'Instagram | Facebook', 'https://www.instagram.com/qreativos/ | https://www.facebook.com/qreativos/', 'qreativos-card.webp', true),

('CANON', 'Empresa distribuidora oficial de la marca CANON. Dispone de todo tipo de equipamiento para oficinas, fotocopiadoras, impresoras, redes, ordenadores y accesorios.', '+34956524642', 'C. Velarde, 30, Local 3-4', 'https://www.google.es/maps/place/Sistemas+de+Oficina+de+Ceuta,+S.L.+-+CANON/@35.886243,-5.3189893,15z/data=!3m1!4b1!4m6!3m5!1s0xd0ca4000e2b2597:0xe025ce1799f34c3f!8m2!3d35.8862261!4d-5.3086895!16s%2Fg%2F1hc12k5xg?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D', 'canon.es', 'https://www.canon.es/cbc/ceuta/', 'Facebook', 'https://www.facebook.com/canonceuta/', 'canon-card.webp', true),

('DEWE', 'Toda la moda de señora, caballero.', '+34956511812', 'Calle Antioco 6', 'https://www.google.com/maps/search/?api=1&query=DEWE+Calle+Antioco+6+51001+Ceuta', 'dewe.es', 'http://www.dewe.es', 'Instagram', 'https://www.instagram.com/dw_ceuta/', 'DEWE.png', true),

('INTERSERVICIOS', 'Los empresarios necesitan dedicarse a sus negocios, olvidando los problemas administrativos, contables, fiscales, jurídicos y otros. Esta es la especialidad de Interservicios: asesorar con eficacia realizando todos los trámites administrativos', '956513903/interservicios@interservicioscom', 'P.º del Revellín, 7', 'https://www.google.com/maps/search/?api=1&query=INTERSERVICIOS+P.º+del+Revellín,+7,+51001+Ceuta', 'interservicios.es', 'https://interservicios.es/', 'Facebook', 'https://www.facebook.com/isceuta/', 'interservicios-card.webp', true),

('LA MECA', 'Tienda multimarca dedicada al sportwear y mundo del jeans, trabajando para nuestra clientela desde el año 1973. En la actualidad contamos con un gran número de marcas: Pepe Jeans, Hilfiger Denim, Gant, Napapijri, V&L, Miss Side Car,', '+34956510365', 'Calle Camoens, 6', 'https://www.google.com/maps/search/?api=1&query=LA+MECA+Calle+Camoens,+6,+51001,+Ceuta', 'Inicio - La Meca Ceuta - Tienda Multimarca Española', 'https://Inicio - La Meca Ceuta - Tienda Multimarca Española', '', '', 'la-meca.png', true),

('SYMBOL ASESORAMIENTO', 'Nuestra especialidad es el asesoramiento cercano a nuestros clientes, informando al cliente periódicamente de su situación, para evaluar y corregir lo que fuera necesario, aportando ideas y soluciones para optimizar su negocio con la finalidad de que sea competitivo.', '+34956514718', 'C. Gral. Serrano Orive, 8, bajo', 'https://www.google.com/maps/search/?api=1&query=SYMBOL+ASESORAMIENTO+C.+Gral.+Serrano+Orive,+8,+bajo,+51001+Ceuta', 'asesoriasymbol.net', 'http://www.asesoriasymbol.net', '', '', 'symbol-asesoramiento-card.webp', true),

('BOUTIQUE CLUB', 'Somos la boutique de referencia en moda, calzado y complementos de señora, caballero, jóvenes y niños. Estamos especializados en firmas de alta costura y pret a porter de primer orden.', '+34628821810', 'P.º del Revellín, 1', 'https://www.google.com/maps/search/?api=1&query=BOUTIQUE+CLUB+P.º+del+Revellín,+1,+51001+Ceuta', 'boutiqueclub.tumblr.com', 'http://boutiqueclub.tumblr.com', '', '', 'boutique-club-card.webp', true),

('EL REFECTORIO', 'En nuestro restaurante encontrará carnes, pescados y mariscos, además, de postres y deliciosos vinos.', '+34956513884', 'Pob. Marinero, Local 37', 'https://www.google.com/maps/search/?api=1&query=EL+REFECTORIO+Pob.+Marinero,+Local+37,+51001+Ceuta', 'Restaurante - Mesón "El Refectorio" - Ceuta', 'https://Restaurante - Mesón "El Refectorio" - Ceuta', '', '', 'el-refectorio-card.webp', true),

('DUTY FREE CEUTA', 'Perfumería selectiva y Cosmética, Vinos & Licores, Delicatessen.', '+34956512806', 'Cdad, P.º del Revellín, 21', 'https://www.google.com/maps/search/?api=1&query=DUTY+FREE+CEUTA+Cdad,+P.º+del+Revellín,+21,+51001+Ceuta', 'Duty Free Ceuta - Tienda online de relojes, joyas, perfumes, cosmética, alcohol y licores', 'https://Duty Free Ceuta - Tienda online de relojes, joyas, perfumes, cosmética, alcohol y licores', '', '', 'duty-free-ceuta-card.webp', true);

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_comercios FROM associates;

-- Ver algunos ejemplos con sus UUIDs generados
SELECT id, nombre, telefono, direccion FROM associates LIMIT 5;
