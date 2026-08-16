export interface MenuItem {
  id: string;
  name: string;
  category: 'combos_vip' | 'botellas' | 'cocteles' | 'shots_cervezas' | 'piqueos';
  price: number;
  description: string;
  includes: string[];
  tag?: string;
  isVipEligible?: boolean; // If helps reach VIP $100+
  badgeColor?: string;
}

export const LIQUOR_CATEGORIES = [
  { id: 'todos', label: 'Todo el Menú' },
  { id: 'combos_vip', label: '👑 Combos VIP Gold' },
  { id: 'botellas', label: '🍾 Botellas Premium' },
  { id: 'cocteles', label: '🍸 Cócteles de Autor' },
  { id: 'shots_cervezas', label: '🍻 Shots & Cervezas' },
  { id: 'piqueos', label: '🍟 Piqueos & Snacks' },
];

export const LIQUOR_MENU_ITEMS: MenuItem[] = [
  // COMBOS VIP ($100+ -> VIP Priority!)
  {
    id: 'combo-hinojosa-gold',
    name: 'Combo Hinojosa Gold VIP',
    category: 'combos_vip',
    price: 140,
    description: 'La experiencia definitiva para cantar como una estrella. Botella Johnnie Walker Gold Label Reserve con acompañantes premium.',
    includes: ['1 Botella Johnnie Walker Gold Label (750ml)', '4 Bebidas Energizantes Red Bull', 'Hielera con hielo infinito', 'Snack Mix Hinojosa Gourmet', 'Acceso a 5 canciones con Prioridad VIP Alta'],
    tag: '⭐ Más Vendido VIP',
    isVipEligible: true,
    badgeColor: 'border-amber-400/50 bg-amber-400/20 text-amber-200',
  },
  {
    id: 'combo-don-julio-fiesta',
    name: 'Combo Tequila Don Julio Blanco',
    category: 'combos_vip',
    price: 130,
    description: 'Para los amantes del buen tequila mexicano. Acompañado de limones frescos, sal marina artesanal y cervezas bien frías.',
    includes: ['1 Botella Don Julio Blanco (750ml)', '6 Cervezas Corona Extra', 'Plato de limones y sal marina', 'Sangrita de la casa', 'Acceso a 5 canciones con Prioridad VIP'],
    tag: '🔥 Fiesta Mexicana',
    isVipEligible: true,
    badgeColor: 'border-pastel-pink/50 bg-pastel-pink/20 text-pastel-pink',
  },
  {
    id: 'combo-black-party',
    name: 'Combo Johnnie Walker Black Label',
    category: 'combos_vip',
    price: 110,
    description: 'El clásico indiscutible de la noche. Whisky añejado 12 años con mezcladores a elección.',
    includes: ['1 Botella JW Black Label (750ml)', '4 Aguas Tónicas / Ginger Ale', '2 Red Bulls', 'Hielera y vasos altos', 'Califica para 5 canciones VIP'],
    tag: '🥃 Clásico de la Noche',
    isVipEligible: true,
    badgeColor: 'border-amber-300/40 bg-amber-300/15 text-amber-300',
  },
  {
    id: 'combo-ron-zacapa',
    name: 'Combo Ron Zacapa Centenario 23',
    category: 'combos_vip',
    price: 125,
    description: 'Ron premium guatemalteco de solera. Notas de miel, caramelo y especias dulces.',
    includes: ['1 Botella Zacapa 23 (750ml)', '4 Bebidas Coca-Cola / Ginger', 'Hielera y rodajas de naranja', 'Snack de frutos secos', 'Prioridad VIP Alta'],
    tag: '👑 Reserva Especial',
    isVipEligible: true,
    badgeColor: 'border-purple-400/50 bg-purple-400/20 text-purple-200',
  },

  // BOTELLAS ($50 - $99 -> Medium/VIP Priority)
  {
    id: 'botella-old-parr',
    name: 'Old Parr 12 Años',
    category: 'botellas',
    price: 85,
    description: 'Whisky escocés blended suave y aromático. Incluye 2 mezcladores y hielera.',
    includes: ['1 Botella Old Parr 12 (750ml)', '2 Bebidas a elección', 'Hielera'],
    tag: 'Recomendado',
    isVipEligible: false,
  },
  {
    id: 'botella-jagermeister',
    name: 'Jägermeister Herbal Original',
    category: 'botellas',
    price: 65,
    description: 'Licor alemán de 56 hierbas botánicas servido a -18°C.',
    includes: ['1 Botella Jägermeister (700ml)', '4 Vasos de shot helados', '2 Red Bulls'],
    tag: '⚡ Shots Fríos',
    isVipEligible: false,
  },
  {
    id: 'botella-gin-tanqueray',
    name: 'Tanqueray London Dry Gin',
    category: 'botellas',
    price: 75,
    description: 'Ginebra destilada 4 veces con enebro y toques cítricos.',
    includes: ['1 Botella Tanqueray (750ml)', '4 Aguas Tónicas Premium', 'Rodajas de pepino y frutos rojos'],
    isVipEligible: false,
  },
  {
    id: 'botella-vodka-absolut',
    name: 'Absolut Vodka Original',
    category: 'botellas',
    price: 60,
    description: 'Vodka sueco suave elaborado con trigo de invierno.',
    includes: ['1 Botella Absolut (750ml)', '2 Jugos de naranja o arándano', 'Hielera'],
    isVipEligible: false,
  },

  // COCTELES DE AUTOR
  {
    id: 'coctel-hinojosa-night',
    name: 'Cóctel Hinojosa Blue Sky',
    category: 'cocteles',
    price: 12,
    description: 'Nuestra firma de la casa: Gin Tanqueray, Blue Curaçao, jarabe de maracuyá, tónica y escarchado de azúcar pastel.',
    includes: ['Copa balón', 'Hielo cristalino', 'Frutos del bosque'],
    tag: '🍹 Firma Hinojosa',
  },
  {
    id: 'coctel-mojito-pasion',
    name: 'Mojito Pasión & Menta',
    category: 'cocteles',
    price: 10,
    description: 'Ron blanco, hierbabuena fresca machacada, pulpa de maracuyá y soda efervescente.',
    includes: ['Vaso alto', 'Hielo frappé'],
  },
  {
    id: 'coctel-margarita-fresa',
    name: 'Margarita Fresa Frozen',
    category: 'cocteles',
    price: 11,
    description: 'Tequila reposado, licor de naranja, fresas naturales escarchado con sal rosa del Himalaya.',
    includes: ['Copa margarita escarchada'],
  },
  {
    id: 'coctel-gin-tonic-pink',
    name: 'Pink Gin Tonic Lavender',
    category: 'cocteles',
    price: 11,
    description: 'Ginebra rosa con toques de lavanda, pimienta rosa y tónica floral.',
    includes: ['Copa balón', 'Aroma botánico'],
  },

  // SHOTS & CERVEZAS
  {
    id: 'shots-ruleta-6',
    name: 'Bandeja de 6 Shots "Cucaracha"',
    category: 'shots_cervezas',
    price: 24,
    description: 'Tequila flameado con licor de café y canela para encender la fiesta antes de cantar.',
    includes: ['6 Shots flameados en mesa'],
    tag: '🔥 Flameado',
  },
  {
    id: 'shots-jagerbombs-4',
    name: 'Ronda de 4 Jägerbombs',
    category: 'shots_cervezas',
    price: 22,
    description: 'Shots de Jägermeister sumergidos en vasos de Red Bull helado.',
    includes: ['4 Shots completos'],
  },
  {
    id: 'balde-coronas-6',
    name: 'Balde de 6 Cervezas Corona Extra',
    category: 'shots_cervezas',
    price: 25,
    description: 'Seis botellas servidas en balde metálico con abundante hielo y limones.',
    includes: ['6 Coronas (355ml)', 'Plato de limones'],
  },
  {
    id: 'balde-stella-6',
    name: 'Balde de 6 Stella Artois',
    category: 'shots_cervezas',
    price: 26,
    description: 'Lager belga premium servida bien fría en balde con hielo.',
    includes: ['6 Stellas (330ml)'],
  },

  // PIQUEOS & SNACKS
  {
    id: 'piqueo-tabla-hinojosa',
    name: 'Tabla de Quesos y Jamones Artesanales',
    category: 'piqueos',
    price: 18,
    description: 'Selección de jamón serrano, queso gouda, salami, frutos secos, aceitunas y tostadas al ajo.',
    includes: ['Para 3-4 personas'],
  },
  {
    id: 'piqueo-alitas-bbq',
    name: 'Alitas BBQ Hinojosa (12 Unidades)',
    category: 'piqueos',
    price: 14,
    description: 'Alitas crujientes bañadas en salsa BBQ ahumada con papas rústicas y aderezo ranch.',
    includes: ['Papas rústicas', 'Salsa ranch'],
  },
  {
    id: 'piqueo-nachos-supremos',
    name: 'Nachos Supremos con Guacamole & Queso Fundido',
    category: 'piqueos',
    price: 13,
    description: 'Totopos crujientes con carne sazonada, queso cheddar derretido, frijoles y pico de gallo.',
    includes: ['Guacamole casero', 'Jalapeños'],
  },
];
