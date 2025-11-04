
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

// Data from placeholder-images.json
const placeholderImages = [
    {
      "id": "prod_1_img",
      "description": "A stylish denim jacket on a hanger.",
      "imageUrl": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxkZW5pbSUyMGphY2tldHxlbnwwfHx8fDE3NjE5NDExMjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "denim jacket"
    },
    {
      "id": "prod_2_img",
      "description": "A classic white t-shirt folded neatly.",
      "imageUrl": "https://images.unsplash.com/photo-1643881080033-e67069c5e4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3aGl0ZSUyMHQtc2hpcnR8ZW58MHx8fHwxNzYxOTE5MjMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "white t-shirt"
    },
    {
      "id": "prod_3_img",
      "description": "A pair of black skinny jeans.",
      "imageUrl": "https://images.unsplash.com/photo-1531920724711-2e0aeed7aecf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxibGFjayUyMGplYW5zfGVufDB8fHx8MTc2MTkxNTEyMXww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "black jeans"
    },
    {
      "id": "prod_4_img",
      "description": "A light and airy floral summer dress.",
      "imageUrl": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBkcmVzc3xlbnwwfHx8fDE3NjE5MDg0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "floral dress"
    },
    {
      "id": "prod_5_img",
      "description": "A stylish black leather jacket.",
      "imageUrl": "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwamFja2V0fGVufDB8fHx8MTc2MjI0NjA4NHww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "leather jacket"
    }
  ];

// Data from products.ts
const originalProducts = [
  {
    id: 'prod_1',
    name: 'Denim Jacket',
    category: 'Jackets',
    description: 'A timeless denim jacket that adds a cool, casual layer to any outfit. Made from 100% durable cotton, it features classic button-front styling, chest pockets, and a comfortable fit that gets better with every wear.',
    originalPrice: 3499,
    salePrice: 2999,
    images: [{ id: 'prod_1_img' }],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod_2',
    name: 'Classic White Tee',
    category: 'T-Shirts',
    description: 'The perfect wardrobe essential. Our Classic White Tee is crafted from ultra-soft premium cotton for a breathable, comfortable feel. Its versatile design makes it ideal for layering or wearing on its own.',
    originalPrice: 1299,
    salePrice: 899,
    images: [{ id: 'prod_2_img' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod_3',
    name: 'Black Skinny Jeans',
    category: 'Jeans',
    description: 'Elevate your style with our Black Skinny Jeans. Designed to flatter, these jeans offer a sleek, modern silhouette with just the right amount of stretch for all-day comfort. A versatile staple for any wardrobe.',
    originalPrice: 2999,
    salePrice: 2499,
    images: [{ id: 'prod_3_img' }],
    sizes: ['28', '30', '32', '34', '36'],
  },
  {
    id: 'prod_4',
    name: 'Floral Summer Dress',
    category: 'Dresses',
    description: 'Embrace the sunshine in our beautiful Floral Summer Dress. Featuring a vibrant floral print, a lightweight and breezy fabric, and a flattering A-line cut, this dress is perfect for picnics, parties, or a day out.',
    originalPrice: 2499,
    salePrice: 1999,
    images: [{ id: 'prod_4_img' }],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'prod_5',
    name: 'Leather Biker Jacket',
    category: 'Jackets',
    description: 'Channel your inner rebel with this classic leather biker jacket. Crafted from genuine leather, it features an asymmetric zip, multiple pockets, and a tailored fit for a sharp, edgy look.',
    originalPrice: 5999,
    salePrice: 4999,
    images: [{ id: 'prod_5_img' }],
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

const getImageData = (id: string) => {
    const img = placeholderImages.find(p => p.id === id);
    if (!img) {
        return {
            id: 'fallback',
            url: 'https://picsum.photos/seed/fallback/600/800',
            alt: 'Fallback image',
            hint: 'product photo'
        };
    }
    return {
        id: img.id,
        url: img.imageUrl,
        alt: img.description,
        hint: img.imageHint,
    }
}

const products = originalProducts.map(p => ({
    ...p,
    priceFormatted: `₹${p.salePrice}`,
    images: p.images.map(i => getImageData(i.id)),
}));

async function seedDatabase() {
    try {
        console.log('Initializing Firebase...');
        const firebaseApp = initializeApp(firebaseConfig);
        const db = getFirestore(firebaseApp);
        console.log('Firebase initialized.');

        const productsCollection = collection(db, 'products');
        const batch = writeBatch(db);

        console.log('Starting to seed products...');
        products.forEach(product => {
            const docRef = doc(db, 'products', product.id);
            batch.set(docRef, product);
        });

        await batch.commit();
        console.log('Successfully seeded database with', products.length, 'products.');
        // The script will exit automatically if there are no more async operations.
        // If it hangs, we can force exit, but it's better to let it close naturally.
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
