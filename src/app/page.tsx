
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product } from '@/lib/products';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram, Search, PackageSearch, Megaphone, ShoppingCart, HelpCircle, Shield } from 'lucide-react';
import type { SiteSetting, AnnouncementSetting, HeroImage } from '@/lib/settings';
import { useState, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { Button } from '@/components/ui/button';


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
        <p className="whitespace-pre-wrap">{footerData?.content || `© ${new Date().getFullYear()} Darpan Wears. All rights reserved.`}</p>
      </div>
    </footer>
  );
}

function AnnouncementBar() {
  const firestore = useFirestore();
  const announcementDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'announcement');
  }, [firestore]);

  const { data: announcementData, isLoading } = useDoc<AnnouncementSetting>(announcementDocRef);

  if (isLoading) {
    return <Skeleton className="h-12 w-full mb-8" />;
  }

  if (!announcementData || !announcementData.content) {
    return null;
  }

  return (
    <div className="mb-8 border-2 border-dashed border-primary/50 rounded-lg p-4 bg-primary/5 text-center">
        <div className="flex items-center justify-center gap-3">
            <Megaphone className="h-6 w-6 text-primary" />
            <p className="font-headline text-lg font-semibold text-primary">{announcementData.content}</p>
        </div>
    </div>
  )
}

function HeroCarousel() {
    const plugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    const firestore = useFirestore();
    const heroImagesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'heroImages');
    }, [firestore]);

    const { data: heroImages, isLoading } = useCollection<HeroImage>(heroImagesCollection);

    const scrollToProducts = () => {
        document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
    }

    const renderContent = (image?: HeroImage) => (
        <div className="w-full aspect-square relative">
            {image && (
                <Image
                    src={image.imageUrl}
                    alt={image.title}
                    fill
                    className="object-cover"
                    priority
                />
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white p-4 flex flex-col items-center">
                    <h2 
                        className="text-5xl sm:text-6xl md:text-7xl font-headline font-bold" 
                        style={{ textShadow: '2px 4px 10px rgba(0,0,0,0.8)' }}
                    >
                        {image ? image.title : "Welcome to Darpan Wears"}
                    </h2>
                    <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg transform transition-transform hover:scale-105" onClick={scrollToProducts}>
                            <ShoppingCart className="mr-3" />
                            Shop Now
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 text-white border-white border-2 text-lg px-8 py-6 rounded-full shadow-lg transform transition-transform hover:scale-105" asChild>
                            <Link href="/how-to-order">
                                <HelpCircle className="mr-3" />
                                How to Order
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <section className="w-full mb-12">
                <Skeleton className="w-full aspect-square" />
            </section>
        )
    }

    if (!heroImages || heroImages.length === 0) {
        return (
             <section className="w-full mb-12 border rounded-lg overflow-hidden shadow-lg relative bg-muted">
                {renderContent()}
            </section>
        );
    }

    return (
        <section className="w-full mb-12 border rounded-lg overflow-hidden shadow-lg relative">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent>
                    {heroImages.map((image, index) => (
                        <CarouselItem key={index}>
                           {renderContent(image)}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
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
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                <span>Darpan Wears</span>
                </Link>
                <Image src="https://i.postimg.cc/wTjXzYpT/indian-flag-waving.gif" alt="Indian Flag" width={40} height={27} className="hidden sm:block" />
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
             <div className="flex items-center gap-2">
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
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
          
          <HeroCarousel />
          <AnnouncementBar />
          
          <h2 id="product-grid" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-8 text-center font-headline scroll-mt-24">
            Our Collection
          </h2>


          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="group block">
                    <Card className="h-full overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="aspect-square overflow-hidden">
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
                      <div className="aspect-square overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                           <Image
                            src={product.images[0].url}
                            alt={product.images[0].alt}
                            width={600}
                            height={600}
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
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-primary">₹{product.salePrice}</p>
                        <p className="text-md text-muted-foreground line-through">₹{product.originalPrice}</p>
                      </div>
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
