
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
        <p className="whitespace-pre-wrap">{footerData?.content || `© ${new Date().getFullYear()} Darpan Wears. All rights reserved.`}</p>
      </div>
    </footer>
  );
}

const getYouTubeEmbedUrl = (url: string) => {
    let videoId;
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    if(videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    // Return original url if not a youtube link, maybe it's a direct video file.
    return url;
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
                        <div className="aspect-square w-full max-w-md rounded-lg overflow-hidden shadow-lg sticky top-28">
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
  
  const hasMedia = (product.videoUrl && product.videoUrl.length > 0) || product.images.length > 0;

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
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-8">
            <Button asChild size="lg" variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Products
                </Link>
            </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="flex justify-center items-start">
             <div className="w-full max-w-md sticky top-28">
                {hasMedia ? (
                    <Carousel className="rounded-lg overflow-hidden shadow-lg">
                        <CarouselContent>
                        {product.videoUrl && (
                             <CarouselItem>
                                <div className="aspect-video w-full">
                                    <iframe
                                        className="w-full h-full"
                                        src={getYouTubeEmbedUrl(product.videoUrl)}
                                        title="Product Video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </CarouselItem>
                        )}
                        {product.images.map((image, index) => (
                            <CarouselItem key={image.id}>
                            <div className="aspect-square">
                                <Image
                                src={image.url}
                                alt={image.alt}
                                width={600}
                                height={600}
                                className="object-contain w-full h-full"
                                data-ai-hint={image.hint}
                                priority={index === 0 && !product.videoUrl}
                                />
                            </div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        {(product.images.length + (product.videoUrl ? 1 : 0)) > 1 && (
                            <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>
                        )}
                    </Carousel>
                ) : (
                    <div className="aspect-square w-full max-w-md rounded-lg overflow-hidden shadow-lg sticky top-28 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Media</span>
                    </div>
                )}
             </div>
          </div>
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-foreground mb-4">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-6">
                <p className="text-3xl font-bold text-primary">₹{product.salePrice}</p>
                <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</p>
            </div>
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
