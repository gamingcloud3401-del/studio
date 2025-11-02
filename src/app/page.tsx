
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product } from '@/lib/products';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram, Search } from 'lucide-react';
import type { SiteSetting } from '@/lib/settings';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

function SiteFooter() {
  const firestore = useFirestore();
  const footerDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'footer');
  }, [firestore]);

  const { data: footerData } = useDoc<SiteSetting>(footerDocRef);

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>{footerData?.content || `© ${new Date().getFullYear()} Darpan Wears. All rights reserved.`}</p>
      </div>
    </footer>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);


  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center sm:justify-start h-20">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                <span>Darpan Wears</span>
                </Link>
                <Link
                    href="https://www.instagram.com/darpan_wears?igsh=a2pkYXhpajVwNnR3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    >
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-8 text-center font-headline">
            Our Collection
          </h2>
          <div className="mb-12 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="group block">
                    <Card className="h-full overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="aspect-[3/4] overflow-hidden">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                        </CardContent>
                    </Card>
                </div>
            ))}
            {!isLoading && filteredProducts.map((product) => (
              <ProductDetailsDialog key={product.id} product={product}>
                <div className="group block cursor-pointer">
                  <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                    <CardHeader className="p-0">
                      <div className="aspect-[3/4] overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                           <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt}
                            width={600}
                            height={800}
                            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                            data-ai-hint={product.images[0].hint}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-xl font-headline mb-2 line-clamp-2">{product.name}</CardTitle>
                      <p className="text-xl font-bold text-primary">{product.priceFormatted}</p>
                    </CardContent>
                  </Card>
                </div>
              </ProductDetailsDialog>
            ))}
          </div>
           {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <h3 className="text-2xl font-semibold">No Products Found</h3>
              <p className="mt-2">
                {searchTerm 
                    ? `Your search for "${searchTerm}" did not match any products.`
                    : "It looks like there are no products in the store."
                }
                </p>
                {!products && (
                    <p className="mt-1">Try running <code className="bg-muted px-2 py-1 rounded">npm run db:seed</code> in the terminal to add them.</p>
                )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
