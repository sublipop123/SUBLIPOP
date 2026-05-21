const fs = require('fs');
const dbPath = 'data/database.json';

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// New structured categories
db.categorias = [
    { id: 'tazas', nombre: 'Tazas', icon: '☕' },
    { id: 'tarros', nombre: 'Tarros y Vasos', icon: '🫙' },
    { id: 'termos', nombre: 'Termos', icon: '💧' },
    { id: 'textiles', nombre: 'Textiles', icon: '👕' },
    { id: 'accesorios', nombre: 'Accesorios', icon: '🧢' }
];

const newProducts = [
    // --- TAZAS ---
    {
        nombre: 'Tazas Clásica',
        categoria: 'tazas',
        precio: 120,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Fondo de Color',
        categoria: 'tazas',
        precio: 150,
        stock: 10,
        material: 'Cerámica Brillante (Rojo, Naranja, Verde, Azul, Amarillo, Rosa)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Asa de Corazón',
        categoria: 'tazas',
        precio: 130,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Asa Corazón Fondo de Color',
        categoria: 'tazas',
        precio: 160,
        stock: 10,
        material: 'Cerámica Mate (Azul, Amarillo, Naranja, Verde, Rojo, Rosa)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Dúo Asa de Corazón',
        categoria: 'tazas',
        precio: 350,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Mágica Clásica',
        categoria: 'tazas',
        precio: 160,
        stock: 10,
        material: 'Cerámica Mate (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Mágica Fondo de Color',
        categoria: 'tazas',
        precio: 190,
        stock: 10,
        material: 'Cerámica Mate (Verde, Rojo, Rosa, Naranja, Amarillo, Azul)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Mágica Asa Corazón',
        categoria: 'tazas',
        precio: 190,
        stock: 10,
        material: 'Cerámica Mate (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Mágica con DTF UV',
        categoria: 'tazas',
        precio: 260,
        stock: 10,
        material: 'Cerámica Mate (Blanco y Negro)',
        tecnica: 'Sublimación con DTF UV',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        descripcion: 'Nota: Si desea taza mágica con fondo de color el costo aumenta +$30.',
        activo: true
    },
    {
        nombre: 'Taza Diamantada Mágica',
        categoria: 'tazas',
        precio: 197,
        stock: 10,
        material: 'Cerámica Mate (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        areaImpresion: '21 x 9.5 cm',
        medidas: '8.3 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas con DTF UV (Solo Impresión)',
        categoria: 'tazas',
        precio: 150,
        stock: 10,
        material: 'Cerámica (Brillante, mate, diamantado, aperlado, etc)',
        tecnica: 'Sublimación con DTF UV',
        descripcion: 'Precio solo del diseño y estampado. El precio total depende de la taza.',
        activo: true
    },
    {
        nombre: 'Taza Blanca 12oz',
        categoria: 'tazas',
        precio: 150,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        areaImpresion: '14 x 8 cm',
        medidas: '8 cm x 9 cm',
        activo: true
    },
    {
        nombre: 'Tazas Largas',
        categoria: 'tazas',
        precio: 160,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '15 oz',
        areaImpresion: '21 x 10.5 cm',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Largas Fondo de Color',
        categoria: 'tazas',
        precio: 180,
        stock: 10,
        material: 'Cerámica Brillante (Rojo, Naranja, Verde, Azul, Amarillo, Rosa)',
        tecnica: 'Sublimación',
        capacidad: '15 oz',
        areaImpresion: '21 x 10.5 cm',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Largas Mágicas',
        categoria: 'tazas',
        precio: 210,
        stock: 10,
        material: 'Cerámica Mate (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '15 oz',
        areaImpresion: '21 x 10.5 cm',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Cónicas Clásicas',
        categoria: 'tazas',
        precio: 140,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        areaImpresion: '22 x 10 cm',
        medidas: '7 cm x 10 cm',
        activo: true
    },
    {
        nombre: 'Tazas Cónicas Fondo de Color',
        categoria: 'tazas',
        precio: 160,
        stock: 10,
        material: 'Cerámica Brillante (Rosa, Rojo, Amarillo, Azul, Verde, Naranja)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        areaImpresion: '22 x 10 cm',
        medidas: '7 cm x 10 cm',
        activo: true
    },
    {
        nombre: 'Tazas Cónicas Mágicas',
        categoria: 'tazas',
        precio: 180,
        stock: 10,
        material: 'Cerámica Brillante (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        areaImpresion: '22 x 10 cm',
        medidas: '7 cm x 10 cm',
        activo: true
    },
    {
        nombre: 'Taza Cónica Alta',
        categoria: 'tazas',
        precio: 180,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '17 oz',
        areaImpresion: '23 x 15 cm',
        medidas: '8.5 cm x 15 cm',
        activo: true
    },
    {
        nombre: 'Tazas Cónicas Altas Mágicas',
        categoria: 'tazas',
        precio: 220,
        stock: 10,
        material: 'Cerámica Brillante (Blanco y Negro)',
        tecnica: 'Sublimación',
        capacidad: '17 oz',
        areaImpresion: '23 x 15 cm',
        medidas: '8.5 cm x 15 cm',
        activo: true
    },
    {
        nombre: 'Taza con Cuchara',
        categoria: 'tazas',
        precio: 330,
        stock: 10,
        material: 'Cerámica Brillante (Fondo: Rosa, Rojo, Amarillo, Azul, Verde, Naranja)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas con Cuchara Mágicas',
        categoria: 'tazas',
        precio: 350,
        stock: 10,
        material: 'Cerámica Brillante (Fondo: Rosa, Rojo, Amarillo, Azul, Verde, Naranja)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Taza Satinada',
        categoria: 'tazas',
        precio: 200,
        stock: 10,
        material: 'Cristal Mate Satinado',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Satinadas Base de Color',
        categoria: 'tazas',
        precio: 230,
        stock: 10,
        material: 'Cristal Brillante (Base: Rosa, Rojo, Amarillo, Azul, Verde, Naranja)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Taza de Cristal Transparente',
        categoria: 'tazas',
        precio: 200,
        stock: 10,
        material: 'Cristal Brillante Transparente',
        tecnica: 'Sublimación o DTF UV',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        descripcion: '$290 MXN DTF UV, $200 MXN Sublimada',
        activo: true
    },
    {
        nombre: 'Tazas de Acero Esmaltada',
        categoria: 'tazas',
        precio: 180,
        stock: 10,
        material: 'Acero inoxidable Brillante (Blanca)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        medidas: '8 cm x 8 cm',
        activo: true
    },
    {
        nombre: 'Taza Color Metalizado',
        categoria: 'tazas',
        precio: 230,
        stock: 10,
        material: 'Cerámica Brillante Metalizado (Oro, Plata, Bronce, Azul, Rosa)',
        tecnica: 'Sublimación',
        capacidad: '12 oz',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Aperladas',
        categoria: 'tazas',
        precio: 230,
        stock: 10,
        material: 'Cerámica Mate (Base: Rosa, azul, plata, oro, blanco)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Taza Diamantada',
        categoria: 'tazas',
        precio: 250,
        stock: 10,
        material: 'Cerámica Mate Diamantado (Rosa, Azul, Oro, Plata, Bronce)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas de Color con Ventana',
        categoria: 'tazas',
        precio: 230,
        stock: 10,
        material: 'Cerámica Brillante (Varios Colores)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Taza Fotoluminiscente',
        categoria: 'tazas',
        precio: 280,
        stock: 10,
        material: 'Cerámica Brillante (Blanco)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.5 cm x 11 cm',
        activo: true
    },
    {
        nombre: 'Tazas Neon',
        categoria: 'tazas',
        precio: 260,
        stock: 10,
        material: 'Cristal Brillante (Base: Rosa, Rojo, Amarillo, Azul, Verde, Naranja)',
        tecnica: 'Sublimación',
        capacidad: '11 oz',
        medidas: '8.3 cm x 11 cm',
        activo: true
    },

    // --- VASOS Y TARROS ---
    {
        nombre: 'Tarro Transparente',
        categoria: 'tarros',
        precio: 180,
        stock: 10,
        material: 'Vidrio Brillante Transparente',
        tecnica: 'Sublimación o DTF UV',
        capacidad: '16 oz / 473 ml',
        descripcion: '$270 MXN DTF UV, $180 MXN Sublimado',
        activo: true
    },
    {
        nombre: 'Tarro Cervecero Satinado',
        categoria: 'tarros',
        precio: 190,
        stock: 10,
        material: 'Vidrio Satinado Mate',
        tecnica: 'Sublimación o DTF UV',
        capacidad: '16 oz / 473 ml',
        descripcion: '$190 MXN Sublimado, $220 MXN DTF UV',
        activo: true
    },
    {
        nombre: 'Tequilero Transparente',
        categoria: 'tarros',
        precio: 45,
        stock: 10,
        material: 'Vidrio Brillante Transparente',
        tecnica: 'Vinil adhesivo',
        descripcion: 'Mínimo de compra: 30pz',
        activo: true
    },
    {
        nombre: 'Tequilero Satinado',
        categoria: 'tarros',
        precio: 45,
        stock: 10,
        material: 'Vidrio Satinado Mate',
        tecnica: 'Sublimación',
        capacidad: '16 oz / 473 ml',
        activo: true
    },
    {
        nombre: 'Tequilero Blanco',
        categoria: 'tarros',
        precio: 45,
        stock: 10,
        material: 'Vidrio Brillante',
        tecnica: 'Sublimación',
        activo: true
    },
    {
        nombre: 'Vaso Highball Esmerilado',
        categoria: 'tarros',
        precio: 150,
        stock: 10,
        material: 'Vidrio Satinado Mate',
        tecnica: 'Sublimación',
        capacidad: '16 oz / 473 ml',
        activo: true
    },
    {
        nombre: 'Vasos (Tipo Cafetería con Tapa)',
        categoria: 'tarros',
        precio: 42,
        stock: 10,
        material: 'Plástico Brillante o Mate (Blanco y Negro)',
        tecnica: 'Vinil adhesivo',
        capacidad: '12 oz / 24 oz',
        medidas: '12 oz (5x10cm) / 24 oz (8x15cm)',
        activo: true
    },

    // --- TERMOS ---
    {
        nombre: 'Termos',
        categoria: 'termos',
        precio: 87,
        stock: 10,
        material: 'Cerámica o Plástico',
        tecnica: 'Serigrafía o Sublimación',
        capacidad: '800 ml',
        areaImpresion: '15 x 20 cm',
        descripcion: 'Conserva bebidas frías o calientes',
        activo: true
    },

    // --- TEXTILES ---
    {
        nombre: 'Tote Bags',
        categoria: 'textiles',
        precio: 52,
        stock: 10,
        material: 'Tela de manta/loneta 100% algodón',
        tecnica: 'Serigrafía',
        medidas: '35 cm x 40 cm',
        descripcion: 'Venta de Mayoreo a partir de 25 piezas',
        activo: true
    },
    {
        nombre: 'Playera Básica Algodón',
        categoria: 'textiles',
        precio: 250,
        stock: 10,
        material: '100% Algodón',
        tecnica: 'Sublimación / DTF',
        descripcion: 'Precio $250-$280. Corte Clásico unisex. Tallas: CH, M, G, XG',
        activo: true
    },
    {
        nombre: 'Playera Básica Poliéster',
        categoria: 'textiles',
        precio: 200,
        stock: 10,
        material: '100% Poliéster (Tacto algodón)',
        tecnica: 'Sublimación',
        descripcion: 'Precio $200-$250. Corte Clásico unisex. Tallas: CH, M, G, XG',
        activo: true
    },
    {
        nombre: 'Sudadera',
        categoria: 'textiles',
        precio: 480,
        stock: 10,
        material: '100% Algodón',
        tecnica: 'DTF / Serigrafía',
        descripcion: 'Precio $480-$550. Corte Clásico unisex. Tallas: CH, M, G, XG',
        activo: true
    },
    {
        nombre: 'Ropa Interior Personalizada',
        categoria: 'textiles',
        precio: 190,
        stock: 10,
        material: '100% Algodón',
        tecnica: 'Sublimación o DTF Textil',
        activo: true
    },
    {
        nombre: 'Calcetines Personalizados',
        categoria: 'textiles',
        precio: 90,
        stock: 10,
        material: '100% Algodón',
        tecnica: 'Sublimación o DTF Textil',
        activo: true
    },

    // --- ACCESORIOS ---
    {
        nombre: 'Gorra Visera Plana',
        categoria: 'accesorios',
        precio: 250,
        stock: 10,
        material: '100% Algodón',
        tecnica: 'DTF Textil',
        activo: true
    },
    {
        nombre: 'Gorra Blanca y Red de Color',
        categoria: 'accesorios',
        precio: 150,
        stock: 10,
        material: '100% Poliéster',
        tecnica: 'Sublimación',
        activo: true
    },
    {
        nombre: 'Funda de Cojín',
        categoria: 'accesorios',
        precio: 180,
        stock: 10,
        material: '100% Poliéster',
        tecnica: 'Sublimación',
        activo: true
    },
    {
        nombre: 'Pantuflas',
        categoria: 'accesorios',
        precio: 150,
        stock: 10,
        material: '100% Poliéster',
        tecnica: 'Sublimación',
        activo: true
    }
];

// Re-assign IDs
newProducts.forEach((p, index) => {
    p.id = Date.now() + index;
});

db.productos = newProducts;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Database updated successfully with ' + newProducts.length + ' products.');
