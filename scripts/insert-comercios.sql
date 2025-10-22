-- ==============================================
-- 🏪 INSERTAR DATOS DE COMERCIOS
-- ==============================================
-- Script para insertar los datos de comercios.json en la tabla associates

-- Verificar que la tabla existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'associates';

-- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'associates' 
ORDER BY ordinal_position;

-- Insertar datos de comercios
INSERT INTO associates (
    id,
    nombre,
    descripcion,
    telefono,
    direccion,
    maps_url,
    web_texto,
    web_url,
    rrss_texto,
    rrss_url,
    imagen
) VALUES 
(1, 'CHAROL ZAPATOS', 'Tu tienda Multimarca en Ceuta, para ellas y ellos las mejores marcas en el sector del calzado. Conoce nuestros establecimientos donde nuestro equipo de profesionales te atenderá de manera individual, profesional y cercana... Porque llevamos un largo recorrido caminando con nuestros clientes.', '+34956514406', 'Paseo del Revellín, 9', 'https://www.google.com/maps/search/?api=1&query=CHAROL+ZAPATOS+Paseo+del+Revellín,+9,+51001,+Ceuta', '', 'https://nan', 'Facebook', 'https://www.facebook.com/charolzapatosceuta/', 'charol-zapatos-card.webp'),

(2, 'QREATIVOS', 'No somos una agencia más, lo nuestro es una vocación, nos apasiona. Queremos lo mejor para ti y para tu empresa... y se nos nota. Queremos que tu empresa sea mejor, porque eso nos hará ser mejores.', '+34956748011', 'Plaza de los Reyes, s/n. Edificio Plaza de los Reyes, Local 7', 'https://www.google.com/maps/search/?api=1&query=QREATIVOS+Plaza+de+los+Reyes,+s/n.+Edificio+Plaza+de+los+Reyes,+Local+7,+51001+Ceuta', 'qreativos.es', 'http://www.qreativos.es', 'Instagram | Facebook', 'https://www.instagram.com/qreativos/ | https://www.facebook.com/qreativos/', 'qreativos-card.webp'),

(3, 'CANON', 'Empresa distribuidora oficial de la marca CANON. Dispone de todo tipo de equipamiento para oficinas, fotocopiadoras, impresoras, redes, ordenadores y accesorios.', '+34956524642', 'C. Velarde, 30, Local 3-4', 'https://www.google.es/maps/place/Sistemas+de+Oficina+de+Ceuta,+S.L.+-+CANON/@35.886243,-5.3189893,15z/data=!3m1!4b1!4m6!3m5!1s0xd0ca4000e2b2597:0xe025ce1799f34c3f!8m2!3d35.8862261!4d-5.3086895!16s%2Fg%2F1hc12k5xg?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D', 'canon.es', 'https://www.canon.es/cbc/ceuta/', 'Facebook', 'https://www.facebook.com/canonceuta/', 'canon-card.webp'),

(4, 'DEWE', 'Toda la moda de señora, caballero.', '+34956511812', 'Calle Antioco 6', 'https://www.google.com/maps/search/?api=1&query=DEWE+Calle+Antioco+6+51001+Ceuta', 'dewe.es', 'http://www.dewe.es', 'Instagram', 'https://www.instagram.com/dw_ceuta/', 'DEWE.png'),

(5, 'INTERSERVICIOS', 'Los empresarios necesitan dedicarse a sus negocios, olvidando los problemas administrativos, contables, fiscales, jurídicos y otros. Esta es la especialidad de Interservicios: asesorar con eficacia realizando todos los trámites administrativos', '956513903/interservicios@interservicioscom', 'P.º del Revellín, 7', 'https://www.google.com/maps/search/?api=1&query=INTERSERVICIOS+P.º+del+Revellín,+7,+51001+Ceuta', 'interservicios.es', 'https://interservicios.es/', 'Facebook', 'https://www.facebook.com/isceuta/', 'interservicios-card.webp'),

(6, 'LA MECA', 'Tienda multimarca dedicada al sportwear y mundo del jeans, trabajando para nuestra clientela desde el año 1973. En la actualidad contamos con un gran número de marcas: Pepe Jeans, Hilfiger Denim, Gant, Napapijri, V&L, Miss Side Car,', '+34956510365', 'Calle Camoens, 6', 'https://www.google.com/maps/search/?api=1&query=LA+MECA+Calle+Camoens,+6,+51001,+Ceuta', 'Inicio - La Meca Ceuta - Tienda Multimarca Española', 'https://Inicio - La Meca Ceuta - Tienda Multimarca Española', '', '', 'la-meca.png'),

(7, 'SYMBOL ASESORAMIENTO', 'Nuestra especialidad es el asesoramiento cercano a nuestros clientes, informando al cliente periódicamente de su situación, para evaluar y corregir lo que fuera necesario, aportando ideas y soluciones para optimizar su negocio con la finalidad de que sea competitivo.', '+34956514718', 'C. Gral. Serrano Orive, 8, bajo', 'https://www.google.com/maps/search/?api=1&query=SYMBOL+ASESORAMIENTO+C.+Gral.+Serrano+Orive,+8,+bajo,+51001+Ceuta', 'asesoriasymbol.net', 'http://www.asesoriasymbol.net', '', '', 'symbol-asesoramiento-card.webp'),

(8, 'BOUTIQUE CLUB', 'Somos la boutique de referencia en moda, calzado y complementos de señora, caballero, jóvenes y niños. Estamos especializados en firmas de alta costura y pret a porter de primer orden.', '+34628821810', 'P.º del Revellín, 1', 'https://www.google.com/maps/search/?api=1&query=BOUTIQUE+CLUB+P.º+del+Revellín,+1,+51001+Ceuta', 'boutiqueclub.tumblr.com', 'http://boutiqueclub.tumblr.com', '', '', 'boutique-club-card.webp'),

(9, 'EL REFECTORIO', 'En nuestro restaurante encontrará carnes, pescados y mariscos, además, de postres y deliciosos vinos.', '+34956513884', 'Pob. Marinero, Local 37', 'https://www.google.com/maps/search/?api=1&query=EL+REFECTORIO+Pob.+Marinero,+Local+37,+51001+Ceuta', 'Restaurante - Mesón "El Refectorio" - Ceuta', 'https://Restaurante - Mesón "El Refectorio" - Ceuta', '', '', 'el-refectorio-card.webp'),

(10, 'DUTY FREE CEUTA', 'Perfumería selectiva y Cosmética, Vinos & Licores, Delicatessen.', '+34956512806', 'Cdad, P.º del Revellín, 21', 'https://www.google.com/maps/search/?api=1&query=DUTY+FREE+CEUTA+Cdad,+P.º+del+Revellín,+21,+51001+Ceuta', 'Duty Free Ceuta - Tienda online de relojes, joyas, perfumes, cosmética, alcohol y licores', 'https://Duty Free Ceuta - Tienda online de relojes, joyas, perfumes, cosmética, alcohol y licores', '', '', 'duty-free-ceuta-card.webp'),

(11, 'ALMACENES SAN PABLO', 'Ubicada en el centro de la ciudad, este gran establecimiento ofrece una gran variedad de productos relacionados con la ferretería, bricolaje, fontanería, material eléctrico, pinturas, menaje, perfumería, artículos de limpieza,', '+34956503174', 'Calle Daoiz, 3', 'https://www.google.com/maps/search/?api=1&query=ALMACENES+SAN+PABLO+Calle+Daoiz,+3,+51001+Ceuta', 'Almacenes San Pablo de Ceuta - Almacenes San Pablo', 'https://www.sanpablo.eu/', '', '', 'almacenes-san-pablo-card.webp'),

(12, 'ATLEET CEUTA', 'Descubre lo último en zapatillas y ropa deportiva de Adidas, Nike, Skechers y mucho más.', '+34856393337', 'Av. Cañonero Dato, 21', 'https://www.google.com/maps/search/?api=1&query=ATLEET+CEUTA+Av.+Cañonero+Dato,+21,+51001+Ceuta', 'atleet.store', 'https://www.atleet.store/', '', '', 'atleet-ceuta-card.webp'),

(13, 'AUTOMOTO H.G.P.S.L.', '​Somos concesionario oficial YAMAHA, KTM, DAELIM, KSR GROUP, en Ceuta. Nos dedicamos a la venta de motocicletas desde hace más de 40 años, siendo lideres en el sector. A la venta de recambios, también tenemos nuestro propio Taller.', '+34956518510', 'P.º de la Marina Española, 28', 'https://www.google.com/maps/search/?api=1&query=AUTOMOTO+H.G.P.S.L.+P.º+de+la+Marina+Española,+28,+51001+Ceuta', 'automotoceuta9.webnode.es', 'https://automotoceuta9.webnode.es/', '', '', 'automoto-h-g-p-s-l-card.webp'),

(14, 'CALZEDONIA', 'Tienda especializada en medias, pantis, leggings de diseño, calcetines y ropa de baño para mujer, hombre y niños. La amplia gama de productos, gran atención al factor moda y una inmejorable relación calidad-precio unido a la', '+34956514418', 'Paseo del Revellín, 25', 'https://www.google.com/maps/search/?api=1&query=CALZEDONIA+Paseo+del+Revellín,+25', 'Medias, calcetines, leggings y moda de baño | Calzedonia', '', '', '', 'calzedonia-card.webp'),

(15, 'CARMEN MARAÑES', 'Tu destino exclusivo para la más alta cosmética y perfumería en Ceuta. Nos enorgullece ofrecerte una experiencia única, fusionando la elegancia de la alta costura en lencería con las marcas más exclusivas y prestigiosas del mundo de la perfumería.', '+34956517918', 'Calle Real, 17', 'https://www.google.com/maps/search/?api=1&query=CARMEN+MARAÑES+Calle+Real,+17', '', 'https://nan', '', '', 'carmen-maranes-card.webp'),

(16, 'CASA ROS FACTORY', 'Dedicada a la venta de calzado, textil y accesorios de deporte, ofreciendo productos de nueva colección y productos rebajados hasta un 70% de descuento. Dedicada a la venta de equipaje ofreciendo descuentos en todas sus marcas. Minimarket.', '+34956522961', 'Avenida Cañonero Dato, 23', 'https://www.google.com/maps/search/?api=1&query=CASA+ROS+FACTORY+Avenida+Cañonero+Dato,+23', '', 'https://nan', '', '', 'casa-ros-factory-card.webp'),

(17, 'CHOCRON 1948', 'Chocrón, apellido perteneciente a una saga de grandes joyeros que durante cuatro generaciones se ha consolidado como referencia imprescindible en el sector del Lujo. Desde 1948 es marca registrada, adquiriendo gran reconocimiento gracias a su dilatada experiencia y contrastada calidad ofrecida en su boutiques de Ceuta, Madrid y Marbella.', '+34956512124', 'Calle González de la Vega, 3', 'https://www.google.com/maps/search/?api=1&query=CHOCRON+1948+Calle+González+de+la+Vega,+3', 'chocronjoyeros.com', 'http://www.chocronjoyeros.com', '', '', 'chocron-1948-card.webp'),

(18, 'CLUB BEBÉ', 'Este establecimiento ofrece tanto moda, desde bebé hasta niños de cuatro años, como accesorios esenciales para esas edades, sobre todo para los primeros meses de vida como gasas, chupetes o mantitas.', '', 'Calle Camoens, 5', 'https://www.google.com/maps/search/?api=1&query=CLUB+BEBÉ+Calle+Camoens,+5', '', 'https://nan', '', '', 'club-bebe-card.webp'),

(19, 'DISTRIBUCIONES REINOSO', 'Encuentra los mejores productos para tu mascota, tenemos todo lo que tu mejor amigo necesita, alimentos, juguetes, accesorios, higiene y más, tú lo cuidas, el disfruta.', '+34956514774', 'Calle Camoens, 11', 'https://www.google.com/maps/search/?api=1&query=DISTRIBUCIONES+REINOSO+Calle+Camoens,+11', 'distribucionesreinoso.com', 'http://www.distribucionesreinoso.com/tienda.html', '', '', 'distribuciones-reinoso-card.webp'),

(20, 'EROSKY CITY', 'Su supermercado ubicado en el centro de la ciudad ofrece una amplia variedad de productos alimenticios de alta calidad al mejor precio. Situado en la calle principal, sus más de 800 m2 ofrecen una cómoda disposición de los productos.', '+34956518884', 'Calle Real, 40', 'https://www.google.com/maps/search/?api=1&query=EROSKY+CITY+Calle+Real,+40', 'eroski.es', 'http://www.eroski.es/', '', '', 'erosky-city-card.webp'),

(21, 'FOTO ESTUDIO GARCÍA CORTÉS', 'Fotógrafo profesional con más de 40 años de experiencia, es un referente en la fotografía ceutí. Situados en el centro de la ciudad, combinamos tradición y vanguardia, capturando momentos inolvidables. Profesionalidad en Cada Captura Nuestro Sello de Distinción MÁS QUE UN FOTÓGRAFO No todos los fotógrafos son creados igual, y en un mundo saturado de imágenes, es', '+34956512044', 'Avenida Alcalde José Victori Goñalons, 18', 'https://www.google.com/maps/search/?api=1&query=FOTO+ESTUDIO+GARCÍA+CORTÉS+Avenida+Alcalde+José+Victori+Goñalons,+18', '', '', '', '', 'foto-estudio-garcia-cortes-card.webp'),

(22, 'HOTEL ULISES (OH NICE)', 'En pleno centro histórico y comercial, en el corazón de la ciudad, y con todos los servicios que imagines y las comodidades que te mereces. Piscina interior privada y habitaciones muy especiales, servicio de restaurante, cafetería, bar, salas multiusos, salas de juntas, salones para eventos, ....', '+34956514540', 'Calle Camoens, 3', 'https://www.google.com/maps/search/?api=1&query=HOTEL+ULISES+(OH+NICE)+Calle+Camoens,+3', '', '', '', '', 'hotel-ulises-oh-nice-card.webp'),

(23, 'HPB IMPACTO', 'Con más de 30 años de historia, Impacto es reunir en un mismo nombre hamburguesería, pizzería, bocatería, asador, freiduría y Ceuta. A lo que hay que sumarle una apuesta firme por los productos de primera calidad (sello de garantía Halal incluído), así como un mimo constante a nuestros clientes, parte importante de la familia de Impacto Ceuta.', '+34956517166', 'Polígono Virgen de África, 4', 'https://www.google.com/maps/search/?api=1&query=HPB+IMPACTO+Polígono+Virgen+de+África,+4', 'impactoceuta.es', 'http://www.impactoceuta.es', '', '', 'hpb-impacto-card.webp'),

(24, 'ILU VIAJES', 'Agencia de viajes con una amplia experiencia, se dedica a ofrecer a sus clientes las mejores opciones para sus viajes. Con un equipo de profesionales altamente cualificados, se encarga de gestionar todo lo necesario para que sus clientes disfruten de una experiencia inolvidable.', '+34856200203', 'Calle Real, 17', 'https://www.google.com/maps/search/?api=1&query=ILU+VIAJES+Calle+Real,+17', 'iluviajes.es', 'https://iluviajes.es/', '', '', 'ilu-viajes-card.webp'),

(25, 'ILUMÍNATE', 'Empresa de mantenimiento, instalación y reparación eléctrica y el de suministro y colocación del material eléctrico que resulte necesario para el hogar y otros establecimientos. En la tienda encontrarás una amplia variedad de lámparas y puntos de luz para decorar cualquier espacio.', '+34956522509', 'Calle Cervantes, 16', 'https://www.google.com/maps/search/?api=1&query=ILUMÍNATE+Calle+Cervantes,+16', '', 'https://nan', '', '', 'iluminate-card.webp'),

(26, 'INTERSPORT EMPIRE', 'Disponemos de todos los equipos de los deportes que practica footing, gimnasio, fútbol, deportes al aire libre, esquí, snowboard, tenis, ciclismo, natación...', '+34956518700', 'Paseo del Revellín, 4', 'https://www.google.com/maps/search/?api=1&query=INTERSPORT+EMPIRE+Paseo+del+Revellín,+4', 'intersport.es', 'https://www.intersport.es/', '', '', 'intersport-empire-card.webp'),

(27, 'INTIMISSIMI', 'Si estás buscando una tienda de ropa interior y lencería cerca de ti, dirígete a una de nuestras tiendas de Intimissimi en Ceuta y consigue todos los productos que necesitas. Gracias a nuestras tiendas de ropa interior para mujer podrás renovar y ampliar tu armario.', '+34856396921', 'Paseo del Revellín, 25', 'https://www.google.com/maps/search/?api=1&query=INTIMISSIMI+Paseo+del+Revellín,+25', '', '', '', '', 'INTIMISSIMI.png'),

(28, 'JOYERÍA BLANCO', 'Desde 1971. Joyería, taller propio, regalos de empresa y grabados. Exclusividad en la Joya Ceitil.', '+34956512035', 'Calle Real, 27', 'https://www.google.com/maps/search/?api=1&query=JOYERÍA+BLANCO+Calle+Real,+27', '', 'https://nan', '', '', 'joyeria-blanco-card.webp'),

(29, 'LA MECA NIÑOS', 'Tienda multimarca situada en el centro de la ciudad. Nos encanta la moda y llevamos en este mundo desde 1973. Ofrecemos gran cantidad de productos muy especiales. Una moda muy versátil, una moda muy cool para pequeños.', '+34956519322', 'Calle Cervantes, 16', 'https://www.google.com/maps/search/?api=1&query=LA+MECA+NIÑOS+Calle+Cervantes,+16', 'lamecaceuta.es', 'http://lamecaceuta.es', '', '', 'la-meca-ninos-card.webp'),

(30, 'LA RIQUÍSIMA II', 'Bar cafetería ubicado en una céntrica plaza de la ciudad, especializado en pescados, mariscos, pinchitos al carbón y shawarma.', '+34956777406', 'Calle General Serrano Orive, 11', 'https://www.google.com/maps/search/?api=1&query=LA+RIQUÍSIMA+II+Calle+General+Serrano+Orive,+11', '', 'https://nan', '', '', 'la-riquisima-ii-card.webp'),

(31, 'MARISOL CENTER', 'Un gran establecimiento especializado en pequeño y gran electrodomésticos, electrónica, móviles, tablets,', '+34956522509', 'Avenida Cañonero Dato, 30B', 'https://www.google.com/maps/search/?api=1&query=MARISOL+CENTER+Avenida+Cañonero+Dato,+30B', '', 'https://nan', '', '', 'marisol-center-card.webp'),

(32, 'MCDONALD´S', 'El hogar de las hamburguesas, tu cita con los Happy Meals y el lugar donde todo el mundo puede cumplir sueños.', '+34956514619', 'Poblado Marinero, 23', 'https://www.google.com/maps/search/?api=1&query=MCDONALD´S+Poblado+Marinero,+23', 'mcdonalds-mcdelivery.es', 'https://mcdonalds-mcdelivery.es/', '', '', 'mcdonald-s-card.webp'),

(33, 'MIA BOUTIQUE', 'Mía Boutique. Boutique multimarca femenina. Nuestra tienda se centra en una línea de moda versátil, fashion, trendy, romántica y carismática.', '+34956510365', 'Calle González de la Vega, 8', 'https://www.google.com/maps/search/?api=1&query=MIA+BOUTIQUE+Calle+González+de+la+Vega,+8', '', 'https://nan', '', '', 'mia-boutique-card.webp'),

(34, 'MULTIÓPTICAS TAYLOR', 'Con las últimas tendencias, una gama completa de productos de alta calidad, asesoramiento especializado de nuestros ópticos, unas soluciones personalizadas, visuales y auditivas, promociones y precios bajos.', '+34956513114', 'Calle Teniente Coronel Gautier, 18', 'https://www.google.com/maps/search/?api=1&query=MULTIÓPTICAS+TAYLOR+Calle+Teniente+Coronel+Gautier,+18', 'multiopticas.com', 'https://www.multiopticas.com/es/home', '', '', 'multiopticas-taylor-card.webp'),

(35, 'OVS KIDS', 'Lo mejor de la moda infantil italiana. Las últimas tendencias en ropa para niños, diseños originales y de gran calidad. Lo que más les diferencia es que todas sus prendas están hechas con fibras naturales. Lo mejor de lo mejor para lo más peques de la casa. Niño, niña, camiseta, pantalón, sudadera.', '+34956512766', 'Calle Real, 13', 'https://www.google.com/maps/search/?api=1&query=OVS+KIDS+Calle+Real,+13', 'ovsfashion.com', 'http://www.ovsfashion.com/es/es/', '', '', 'ovs-kids-card.webp'),

(36, 'HOTEL PARADOR LA MURALLA', 'Entre dos mares encontrarás la bella ciudad de Ceuta, y mirando a ellos, en un lugar privilegiado, está el Parador, un moderno edificio adosado a las antiguas Murallas Reales, ubicado en el centro de la urbe.', '+34956514940', 'Plaza de África, 12', 'https://www.google.com/maps/search/?api=1&query=HOTEL+PARADOR+LA+MURALLA+Plaza+de+África,+12', 'parador.es', 'http://www.parador.es/es/paradores/parador-de-ceuta', '', '', 'hotel-parador-la-muralla-card.webp'),

(37, 'PIEZITOS', 'Zapatería infantil multimarca, moda, bonitos complementos y juguetes', '+34659671996', 'Calle Real, 24', 'https://www.google.com/maps/search/?api=1&query=PIEZITOS+Calle+Real,+24', 'piezitos.es', 'http://www.piezitos.es/', '', '', 'piezitos-card.webp'),

(38, 'SPOON CABALLA', 'Ubicado en la playa de La Ribera, nuestro restaurante ofrece un espacio de recreo y diversión. Disponemos de una amplia carta de especialidades gastronómicas. Un ambiente exclusivo y moderno donde podrás disfrutar de la gastronomía y de las copas, tanto en su interior como en la terraza de la playa.', '+34681060547', 'Calle Luis López Anglada, s/n', 'https://www.google.com/maps/search/?api=1&query=SPOON+CABALLA+Calle+Luis+López+Anglada,+s/n', '', 'https://nan', '', '', 'spoon-caballa-card.webp'),

(39, 'SUPER SPORT', 'Dedicada a la venta de calzado, textil y accesorios de deporte, ofreciendo descuentos hasta el 70%.', '+34956524101', 'Lugar Muelle Cañonero Dato, 19', 'https://www.google.com/maps/search/?api=1&query=SUPER+SPORT+Lugar+Muelle+Cañonero+Dato,+19', '', 'https://nan', '', '', 'super-sport-card.webp'),

(40, 'TAX FRY CEUTA', 'En este establecimiento podrán encontrar una amplia variedad de perfumería, cosmética de las mejoras marcas, licores, regalos, relojes, gafas, golosinas, y bisutería fina entre otros artículos de primera calidad. Cuenta con un punto de venta de la compañía Balearia en el que pueden comprar los billetes para sus viajes.', '+34956519574', 'Plaza de África, 0', 'https://www.google.com/maps/search/?api=1&query=TAX+FRY+CEUTA+Plaza+de+África,+0', 'dutyfreeceuta.com', 'http://www.dutyfreeceuta.com/', '', '', 'tax-fry-ceuta-card.webp'),

(41, 'TOUS', 'Franquicia Tous focalizada en la venta de artículos de Joyería, Textil y Complementos.', '+34956524434', 'Paseo del Revellín, 7', 'https://www.google.com/maps/search/?api=1&query=TOUS+Paseo+del+Revellín,+7', 'tous.com', 'https://www.tous.com/es-es/', '', '', 'tous-card.webp'),

(42, 'VIAJES TRUJILLO', 'Vive unas vacaciones de ensueño de mano de nuestros profesionales. Ferry, helicóptero, avión, tren, hoteles, a todos los destinos. Visita también nuestra tienda online en la que encontrarás destinos increíbles.', '+34956511047', 'Calle Real, 16 bajo, Ceuta', 'https://www.google.com/maps/search/?api=1&query=VIAJES+TRUJILLO+Calle+Real,+16+bajo,+Ceuta', 'viajes-trujillo.com', 'http://www.viajes-trujillo.com', '', '', 'viajes-trujillo-card.webp');

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_comercios FROM associates;

-- Ver algunos ejemplos
SELECT id, nombre, telefono, direccion FROM associates LIMIT 5;
