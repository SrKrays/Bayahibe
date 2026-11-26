/**
 * Textos en inglés. La clave es el texto exacto en español (ver LanguageContext).
 * Para agregar un texto nuevo: envolverlo con t('...') en el componente y sumarlo acá.
 * En modo dev, la consola avisa "[i18n] falta traducir" si alguno quedó afuera.
 */
export const EN: Record<string, string> = {
  // ---------- navegación / general ----------
  Secciones: 'Sections',
  'El objetivo': 'The goal',
  'La idea': 'The idea',
  'Cómo lo hacemos': 'How we do it',
  'Súmate': 'Join us',
  Colaborar: 'Donate',
  Cerrar: 'Close',

  // ---------- hero ----------
  'Bayahibe, antes y después': 'Bayahibe, before and after',
  'República Dominicana': 'Dominican Republic',
  'Mar turquesa, arrecifes, manglares y un pueblo que vive de su costa.':
    'Turquoise sea, reefs, mangroves and a town that lives from its coast.',
  'Un rincón del Caribe que vale la pena cuidar.': 'A corner of the Caribbean worth protecting.',
  'Esto no es el futuro. Es hoy.': 'This is not the future. It’s today.',
  'Bayahibe, República Dominicana.': 'Bayahibe, Dominican Republic.',
  'Si no hacemos nada.': 'If we do nothing.',
  'Escenario ilustrativo · 2036': 'Illustrative scenario · 2036',
  'Bayahibe nos necesita.': 'Bayahibe needs us.',
  'Aprendemos a cuidar. Salimos a proteger.': 'We learn to care. We go out to protect.',
  'Conoce el programa': 'See the program',
  'Descubre el proyecto': 'Discover the project',
  'Ver desde el principio': 'Watch from the start',
  'Ir al acto': 'Go to act',
  'días sin cuidarlo': 'days without care',
  'si nada cambia': 'if nothing changes',
  rebobinando: 'rewinding',
  'todavía estamos a tiempo': 'there’s still time',
  'manos a la obra': 'let’s get to work',
  HOY: 'TODAY',

  // ---------- 01 · el objetivo ----------
  'Que cuidar Bayahibe': 'Making care for Bayahibe',
  'se vuelva costumbre.': 'an everyday habit.',
  'No es una limpieza: es un ciclo que se repite cada semana, escuela por escuela.':
    'It’s not a one-off clean-up: it’s a cycle that repeats every week, school by school.',
  Aprender: 'Learn',
  Actuar: 'Act',
  Medir: 'Measure',
  Concientizar: 'Raise awareness',
  'Las escuelas enseñan a separar, reducir y cuidar el mar.': 'Schools teach how to sort, reduce and protect the sea.',
  'Una jornada de limpieza por semana, rotando entre escuelas.': 'One clean-up day a week, rotating between schools.',
  'Cada kilo se pesa y se publica: el avance se ve.': 'Every kilo is weighed and published: progress you can see.',
  'Los niños llevan la misión a casa y las familias ganan premios.':
    'Kids take the mission home and families win prizes.',
  'y vuelve a empezar, cada semana': 'and it starts again, every week',
  'El resultado': 'The result',
  'Un Bayahibe más limpio, con datos que lo demuestran y cuidado por su propia gente.':
    'A cleaner Bayahibe, with data to prove it, cared for by its own people.',
  'de las escuelas con su brigada ambiental': 'of schools with their own environmental brigade',
  'acción ambiental por semana en cada escuela': 'environmental action per week at every school',
  'gran jornada comunitaria por mes': 'big community clean-up day per month',
  'meses entre cada informe público de resultados': 'months between each public results report',
  'Metas del primer año del programa.': 'Goals for the program’s first year.',

  // ---------- 02 · la idea ----------
  'Bayahibe no es solo el lugar donde vivimos.': 'Bayahibe is not just the place where we live.',
  'Es un ecosistema que debemos cuidar.': 'It’s an ecosystem we must protect.',
  'es un programa escolar permanente de educación ambiental, reciclaje y protección del entorno para el Distrito Municipal de Bayahibe, en La Altagracia.':
    'is a permanent school program for environmental education, recycling and protection of the surroundings for the Municipal District of Bayahibe, in La Altagracia.',
  'Bayahibe vive de su mar, de sus arrecifes y manglares, y está unido al Parque Nacional Cotubanamá. Cuando los residuos llegan a la costa, no solo se daña el paisaje: se daña la biodiversidad, el turismo y el trabajo de toda la comunidad.':
    'Bayahibe lives from its sea, its reefs and mangroves, and is bound to Cotubanamá National Park. When waste reaches the coast, it doesn’t just spoil the landscape: it harms biodiversity, tourism and the livelihood of the whole community.',
  'La propuesta es crear una': 'The proposal is to build an',
  'cultura ambiental que nazca en las escuelas': 'environmental culture born in schools',
  ': formar a niños y adolescentes como agentes de cuidado del territorio y unir lo que aprenden en el aula con acciones concretas de limpieza, separación de residuos, reciclaje y protección de los ecosistemas costeros.':
    ': training children and teenagers as caretakers of their land, and linking what they learn in class with concrete actions — clean-ups, waste sorting, recycling and protection of coastal ecosystems.',
  'Un niño que aprende a cuidar su entorno se convierte en un adulto que protege su comunidad.':
    'A child who learns to care for their surroundings becomes an adult who protects their community.',
  Escuela: 'School',
  Niño: 'Child',
  Familia: 'Family',
  Barrio: 'Neighborhood',
  '¿Quiénes lo hacen posible?': 'Who makes it possible?',
  'No es una iniciativa aislada. El programa propone unir a las instituciones que ya trabajan en el territorio con la fuerza de toda la comunidad.':
    'It’s not an isolated initiative. The program brings together the institutions already working in the area with the strength of the whole community.',
  Protagonistas: 'Leading role',
  Territorio: 'Local government',
  'Educación': 'Education',
  'Medio ambiente': 'Environment',
  Reciclaje: 'Recycling',
  Comunidad: 'Community',
  'Escuelas, docentes y estudiantes': 'Schools, teachers and students',
  'Cada curso forma una Brigada Ambiental Escolar: un docente coordinador, estudiantes, familias y voluntarios. Una estructura educativa, nunca política ni partidaria.':
    'Each class forms a School Environmental Brigade: a coordinating teacher, students, families and volunteers. An educational structure — never political or partisan.',
  'Junta Municipal de Bayahibe': 'Bayahibe Municipal Board',
  'Articula el programa en el distrito y facilita la logística de las jornadas: zonas, recolección y destino final de los residuos.':
    'Coordinates the program in the district and supports the logistics of each clean-up: areas, collection and final destination of the waste.',
  'Ministerio de Educación · Distrito 12-02': 'Ministry of Education · District 12-02',
  'Coordina la incorporación del programa en los centros educativos de Bayahibe, dentro del Distrito Educativo de San Rafael del Yuma.':
    'Coordinates bringing the program into Bayahibe’s schools, within the San Rafael del Yuma Education District.',
  'Ministerio de Medio Ambiente': 'Ministry of Environment',
  'Socio técnico en residuos, biodiversidad y el vínculo con el Parque Nacional Cotubanamá, sumando la experiencia de EcoAcademia en la comunidad.':
    'Technical partner on waste, biodiversity and the link with Cotubanamá National Park, building on EcoAcademia’s experience in the community.',
  'Puntos de depósito para reciclaje': 'Recycling drop-off points',
  'Contenedores en escuelas, comercios y espacios públicos para separar plástico, latas, vidrio y cartón. Acercan el reciclaje a cada familia y reciben lo que juntan las brigadas.':
    'Bins at schools, shops and public spaces to sort plastic, cans, glass and cardboard. They bring recycling closer to every family and receive what the brigades collect.',
  'Familias, comercios, hoteles y voluntarios': 'Families, shops, hotels and volunteers',
  'Porque el turismo de Bayahibe depende de un entorno sano, todos tienen un lugar: materiales, puntos de recolección, educación marina y manos.':
    'Because Bayahibe’s tourism depends on a healthy environment, everyone has a role: supplies, collection points, marine education and helping hands.',

  // ---------- 03 · paso a paso ----------
  'Cómo lo cambiamos': 'How we change it',
  'Paso a paso.': 'Step by step.',
  'Escuela por escuela, semana a semana.': 'School by school, week by week.',
  'El cambio no llega con una sola limpieza. Llega cuando cuidar se vuelve costumbre. Por eso el programa avanza en etapas: primero aprender, después actuar, medir los resultados y sumar a toda la comunidad.':
    'Change doesn’t come from a single clean-up. It comes when caring becomes a habit. That’s why the program moves in stages: first learn, then act, measure the results and bring the whole community on board.',
  'Toca cada tema para saber más': 'Tap each topic to learn more',
  '4 semanas': '4 weeks',
  'Cada semana': 'Every week',
  'En casa': 'At home',
  'Cada jornada': 'Every clean-up',
  'Cada mes': 'Every month',
  'Aprender antes de salir': 'Learn before going out',
  'Antes de recoger un solo residuo, cada escuela hace un ciclo corto: conocer Bayahibe, entender a dónde va la basura y qué le hace el plástico al mar.':
    'Before picking up a single piece of waste, each school runs a short cycle: getting to know Bayahibe, understanding where trash goes and what plastic does to the sea.',
  'Conozcamos Bayahibe': 'Getting to know Bayahibe',
  'Bayahibe vive del mar: playas, arrecifes, manglares y el Parque Nacional Cotubanamá. Los niños descubren qué hace único a su pueblo y por qué el turismo depende de que esté limpio. Al final dibujan "Así quiero ver Bayahibe dentro de 20 años".':
    'Bayahibe lives from the sea: beaches, reefs, mangroves and Cotubanamá National Park. Kids discover what makes their town unique and why tourism depends on keeping it clean. At the end they draw “How I want to see Bayahibe in 20 years”.',
  '¿A dónde va la basura?': 'Where does trash go?',
  'Lo que se tira en la calle no desaparece: el viento y la lluvia lo arrastran a cañadas, playas y al mar. Lo que se separa en casa puede reciclarse. La regla que aprenden: Reducir → Reutilizar → Separar → Reciclar.':
    'What’s dropped in the street doesn’t disappear: wind and rain carry it into streams, beaches and the sea. What’s sorted at home can be recycled. The rule they learn: Reduce → Reuse → Sort → Recycle.',
  'El plástico y el mar': 'Plastic and the sea',
  'El plástico no se degrada: se rompe en pedazos cada vez más pequeños (microplásticos) que terminan en peces, tortugas y aves. Por eso el primer paso es evitar los plásticos de un solo uso: bolsas, sorbetes y vasos.':
    'Plastic doesn’t break down: it splits into ever smaller pieces (microplastics) that end up in fish, turtles and birds. That’s why the first step is avoiding single-use plastics: bags, straws and cups.',
  'Somos guardianes de Bayahibe': 'We are the guardians of Bayahibe',
  'Cada curso forma su Brigada Ambiental: un docente, los estudiantes, familias y voluntarios. Reciben guantes, bolsas, pinzas, chalecos, botiquín y planillas. Los Guardianes de Bayahibe son los niños que se ocupan de cuidar su pueblo.':
    'Each class forms its Environmental Brigade: a teacher, students, families and volunteers. They get gloves, bags, grabbers, vests, a first-aid kit and record sheets. The Guardians of Bayahibe are the kids who take care of their town.',
  'Un colegio, una jornada': 'One school, one clean-up day',
  'Una jornada por semana con sistema rotativo: todas las escuelas participan sin sobrecargar a docentes ni estudiantes. Con protocolo de seguridad infantil en cada salida.':
    'One clean-up day a week on a rotating schedule: every school takes part without overloading teachers or students. With a child-safety protocol on every outing.',
  'Entorno escolar': 'Around the school',
  'La primera salida es a la escuela y sus alrededores: cerca, segura y fácil de organizar. Los niños ven el cambio en el lugar donde pasan el día.':
    'The first outing is the school and its surroundings: close, safe and easy to organize. Kids see the change where they spend their day.',
  'Espacios comunitarios': 'Community spaces',
  'Plazas, calles y canchas del barrio. Antes de cada jornada, un adulto recorre e inspecciona la zona.':
    'Squares, streets and sports courts in the neighborhood. Before each clean-up, an adult walks and inspects the area.',
  Reciclables: 'Recyclables',
  'Jornadas para recuperar botellas, latas y cartón y llevarlos a reciclaje. Todo se pesa y se registra.':
    'Days to recover bottles, cans and cardboard and take them to recycling. Everything is weighed and recorded.',
  'Limpieza costera controlada': 'Supervised beach clean-up',
  'La playa, con supervisión y sólo en zonas seguras. Los residuos peligrosos (vidrios, jeringas, químicos) los manejan únicamente adultos.':
    'The beach, supervised and only in safe areas. Hazardous waste (glass, syringes, chemicals) is handled by adults only.',
  'La misión llega a la familia': 'The mission reaches the family',
  'Cada semana, una "Misión ambiental en familia" y un Pasaporte Verde para cada estudiante. El aprendizaje sale del aula y entra a cada hogar.':
    'Every week, a “Family environmental mission” and a Green Passport for each student. Learning leaves the classroom and enters every home.',
  'Separar botellas y latas': 'Sorting bottles and cans',
  'Misión de la semana: armar en casa un rincón para botellas y latas, separadas del resto de la basura.':
    'Mission of the week: set up a corner at home for bottles and cans, separate from the rest of the trash.',
  'Menos bolsas plásticas': 'Fewer plastic bags',
  'Misión de la semana: usar cinco bolsas plásticas menos. Bolsa de tela, mochila o caja: todo vale.':
    'Mission of the week: use five fewer plastic bags. Cloth bag, backpack or box: anything goes.',
  'Cuidar el frente de casa': 'Caring for the front of the house',
  'Misión de la semana: limpiar el frente de la vivienda junto a la familia y mantenerlo así.':
    'Mission of the week: clean the front of the house with the family and keep it that way.',
  'Enseñar a un adulto': 'Teaching an adult',
  'Misión de la semana: explicarle a un adulto por qué no hay que tirar basura en la calle. El niño enseña: la familia aprende.':
    'Mission of the week: explain to an adult why we shouldn’t litter. The child teaches: the family learns.',
  '¿Qué es el Pasaporte Verde?': 'What is the Green Passport?',
  'Medir lo que hacemos': 'Measuring what we do',
  'Cada jornada registra participantes, kilos recuperados por tipo y su destino final. Con esos datos nace el Índice Ambiental Escolar de Bayahibe y un informe público periódico.':
    'Each clean-up records participants, kilos recovered by type and their final destination. That data builds the Bayahibe School Environmental Index and a regular public report.',
  'Kg recuperados': 'Kg recovered',
  'Todo lo que se junta se pesa. El total de cada mes se publica para que todo Bayahibe vea el avance.':
    'Everything collected is weighed. Each month’s total is published so all of Bayahibe can see the progress.',
  'Kg reciclables': 'Kg recyclable',
  'Se registra aparte lo que puede reciclarse: plástico, vidrio, metal y cartón, y a dónde se llevó.':
    'What can be recycled is recorded separately — plastic, glass, metal and cardboard — and where it was taken.',
  'Estudiantes participantes': 'Participating students',
  'Cuántos niños participan en cada jornada. Que se sumen más es tan importante como juntar más.':
    'How many kids take part in each clean-up. More kids joining matters as much as collecting more.',
  'Actividades educativas': 'Educational activities',
  'Charlas, talleres y misiones también cuentan. En el Reto Escuelas Verdes no gana quien junta más basura: se suman los cuatro indicadores.':
    'Talks, workshops and missions count too. In the Green Schools Challenge the winner isn’t whoever collects the most trash: all four indicators add up.',
  'Toda la comunidad': 'The whole community',
  'Hoteles, restaurantes, comercios y operadores turísticos se suman al cuidado del destino. Una vez al mes, la Gran Jornada “Mi casa, mi mar” reúne a todos.':
    'Hotels, restaurants, shops and tour operators join in caring for the destination. Once a month, the Great “Mi casa, mi mar” Day brings everyone together.',
  Hoteles: 'Hotels',
  'Patrocinan materiales y aportan los premios del Pasaporte Verde, como estadías para las familias.':
    'They sponsor supplies and provide the Green Passport prizes, such as stays for families.',
  Comercios: 'Shops',
  'Se convierten en puntos de depósito para reciclaje y reducen el plástico de un solo uso.':
    'They become recycling drop-off points and cut down on single-use plastic.',
  'Operadores turísticos': 'Tour operators',
  'Comparten lo que saben del mar: charlas de educación marina para las escuelas.':
    'They share what they know about the sea: marine-education talks for schools.',
  Voluntarios: 'Volunteers',
  'Acompañan las jornadas y la Gran Jornada mensual, donde los adultos se ocupan de las tareas de riesgo.':
    'They support the clean-ups and the monthly Great Day, where adults handle the risky tasks.',
  'Seguridad ante todo': 'Safety first',
  'No tocar': 'Don’t touch',
  'Aislar el área': 'Isolate the area',
  'Avisar al adulto responsable': 'Tell the adult in charge',
  'Los estudiantes participan siempre en zonas inspeccionadas, con autorización de sus familias, adultos responsables, guantes, hidratación y protección solar. Los residuos peligrosos los manejan solo adultos.':
    'Students always take part in inspected areas, with their families’ permission, adults in charge, gloves, water and sun protection. Hazardous waste is handled by adults only.',

  // ---------- Pasaporte Verde ----------
  'Pasaporte Verde': 'Green Passport',
  'Guardián de Bayahibe': 'Guardian of Bayahibe',
  Mes: 'Month',
  'Premio mensual': 'Monthly prize',
  'Es la libreta de cada estudiante. Convierte el cuidado del ambiente en un juego en familia, con un premio de verdad.':
    'It’s each student’s booklet. It turns caring for the environment into a family game — with a real prize.',
  'Cada semana, una misión': 'Every week, a mission',
  'La familia recibe una misión ambiental para hacer en casa.': 'The family gets an environmental mission to do at home.',
  'Cada misión, un sello': 'Every mission, a stamp',
  'La misión cumplida se marca con un sello en el pasaporte.': 'Each completed mission earns a stamp in the passport.',
  'Pasaporte completo, premio': 'Full passport, a prize',
  'La familia que completa el pasaporte del mes gana un voucher: una estadía o experiencia en Bayahibe aportada por hoteles y comercios aliados.':
    'The family that completes the month’s passport wins a voucher: a stay or experience in Bayahibe provided by partner hotels and businesses.',
  'Aprendí a separar residuos': 'I learned to sort waste',
  'Participé en una limpieza': 'I joined a clean-up',
  'Planté una especie': 'I planted a tree',
  'Reciclé': 'I recycled',
  'Eliminé un plástico de un solo uso': 'I dropped a single-use plastic',
  'Aprendí sobre el arrecife': 'I learned about the reef',
  'Aprendí sobre manglares': 'I learned about mangroves',
  'Protegí un animal': 'I protected an animal',
  'Enseñé una acción ambiental a mi familia': 'I taught my family a green action',

  // ---------- Súmate / Colaborar ----------
  'Bayahibe lo hace': 'Bayahibe does it',
  'en comunidad.': 'together.',
  'Soy una escuela': 'I’m a school',
  'Formen su Brigada Ambiental y súmense a la rotación de jornadas.':
    'Form your Environmental Brigade and join the clean-up rotation.',
  'Tengo un comercio u hotel': 'I have a shop or hotel',
  'Patrocinio de materiales, puntos de depósito para reciclaje y premios para el Pasaporte Verde.':
    'Sponsor supplies, host a recycling drop-off point and provide Green Passport prizes.',
  'Quiero ser voluntario/a': 'I want to volunteer',
  'Acompaña las jornadas y la Gran Jornada “Mi casa, mi mar”.': 'Support the clean-ups and the Great “Mi casa, mi mar” Day.',
  '¿Quieres ayudar desde donde estés?': 'Want to help from wherever you are?',
  'Tu aporte se convierte en guantes, bolsas y materiales para las brigadas escolares.':
    'Your donation becomes gloves, bags and supplies for the school brigades.',
  'Guardianes de Bayahibe': 'Guardians of Bayahibe',
  'Aprendemos a cuidar. Salimos a proteger. Bayahibe nos necesita.':
    'We learn to care. We go out to protect. Bayahibe needs us.',
  'Colabora con Mi casa, mi mar': 'Support Mi casa, mi mar',
  'Cada aporte se convierte en materiales para las brigadas escolares y se informa públicamente en qué se usó.':
    'Every donation becomes supplies for the school brigades, and we publicly report how it was used.',
  'Guantes y pinzas': 'Gloves and grabbers',
  'Bolsas diferenciadas': 'Sorting bags',
  'Chalecos y botiquín': 'Vests and first-aid kit',
  'Indumentaria para los guardianes': 'Clothing for the guardians',
  'Transferencia bancaria': 'Bank transfer',
  'Desde República Dominicana': 'From the Dominican Republic',
  'Desde el exterior': 'From abroad',
  'PayPal u otra plataforma': 'PayPal or another platform',
  Alias: 'Alias',
  Banco: 'Bank',
  Titular: 'Account holder',
  'Número de cuenta': 'Account number',
  'Tipo de cuenta': 'Account type',
  'RNC / Cédula': 'Tax ID (RNC / Cédula)',
  PayPal: 'PayPal',
  'A COMPLETAR': 'TO BE COMPLETED',
  Copiar: 'Copy',
  '¡Copiado!': 'Copied!',
  '¿Quieres donar materiales o avisar tu aporte?': 'Want to donate supplies or let us know about your donation?',
  'Gracias por cuidar Bayahibe con nosotros.': 'Thank you for caring for Bayahibe with us.',
};
