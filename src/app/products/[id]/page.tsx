
'use client';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Product } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import ProductDetailsClient from '@/components/product-details-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Instagram } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { SiteSetting } from '@/lib/settings';

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

export default function ProductPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const productRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'products', params.id);
  }, [firestore, params.id]);

  const { data: product, isLoading } = useDoc<Product>(productRef);

  if (isLoading) {
    return (
        <div className="bg-background min-h-screen flex flex-col">
            <header className="bg-card border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                    <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                    <span>Darpan Wears</span>
                    </Link>
                </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
                 <div className="mb-6">
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                    <div className="flex justify-center items-start">
                        <div className="aspect-[3/4] w-full max-w-md rounded-lg overflow-hidden shadow-lg sticky top-28">
                           <Skeleton className="w-full h-full" />
                        </div>
                    </div>
                    <div className="flex flex-col pt-4 space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-8 w-1/4" />
                        <Separator className="my-6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                         <div className="pt-8 space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-16" />
                                <Skeleton className="h-10 w-16" />
                                <Skeleton className="h-10 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full mt-8" />
                    </div>
                </div>
            </main>
             <SiteFooter />
        </div>
    )
  }

  if (!product) {
    notFound();
  }

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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-6">
            <Button asChild variant="ghost">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="flex justify-center items-start">
             <div className="w-full max-w-md sticky top-28">
                <Carousel className="rounded-lg overflow-hidden shadow-lg">
                    <CarouselContent>
                    {product.images.map((image) => (
                        <CarouselItem key={image.id}>
                        <div className="aspect-[3/4]">
                            <Image
                            src={image.url}
                            alt={image.alt}
                            width={600}
                            height={800}
                            className="object-cover w-full h-full"
                            data-ai-hint={image.hint}
                            priority={product.images.indexOf(image) === 0}
                            />
                        </div>
                        </CarouselItem>
                    ))}
                    </CarouselContent>
                    {product.images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </>
                    )}
                </Carousel>
             </div>
          </div>
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-foreground mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">{product.priceFormatted}</p>
            <Separator className="my-6" />
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            
            <ProductDetailsClient product={product} />

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

    
