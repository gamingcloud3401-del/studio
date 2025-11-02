
"use client";

import * as React from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import ProductDetailsClient from '@/components/product-details-client';
import type { Product } from "@/lib/products";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "./ui/scroll-area";


interface ProductDetailsDialogProps {
  product: Product;
  children: React.ReactNode;
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
    return url;
}


function ProductContent({ product }: { product: Product }) {
    const hasMedia = (product.videoUrl && product.videoUrl.length > 0) || product.images.length > 0;

    return (
        <>
            <div className="md:w-1/2 flex-shrink-0 relative">
                 {hasMedia ? (
                    <Carousel className="w-full h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                        <CarouselContent>
                            {product.videoUrl && (
                                <CarouselItem>
                                    <div className="aspect-video w-full bg-black">
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
                                <div className="aspect-[3/4] w-full relative">
                                    <Image
                                        src={image.url}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={image.hint}
                                        priority={index === 0}
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
                    <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Media</span>
                    </div>
                 )}
            </div>
            <ScrollArea className="md:w-1/2 w-full">
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline text-foreground mb-3">{product.name}</h1>
                    <p className="text-2xl font-bold text-primary mb-4">{product.priceFormatted}</p>
                    <Separator className="my-4" />
                    <div className="prose prose-sm text-muted-foreground leading-relaxed mb-6 max-w-none">
                    <p className="line-clamp-4 md:line-clamp-none">{product.description}</p>
                    </div>
                    
                    <ProductDetailsClient product={product} />
                </div>
            </ScrollArea>
        </>
    )
}

export function ProductDetailsDialog({ product, children }: ProductDetailsDialogProps) {
  const isMobile = useIsMobile();

  const hasMedia = (product.videoUrl && product.videoUrl.length > 0) || product.images.length > 0;

  if (isMobile) {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="bottom" className="w-full h-[90%] p-0 flex flex-col">
                <ScrollArea className="flex-1">
                    <div className="w-full max-w-md mx-auto">
                        {hasMedia ? (
                            <Carousel className="w-full">
                                <CarouselContent>
                                     {product.videoUrl && (
                                        <CarouselItem>
                                            <div className="aspect-video w-full bg-black">
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
                                        <div className="aspect-[3/4] w-full relative">
                                            <Image
                                                src={image.url}
                                                alt={image.alt}
                                                fill
                                                className="object-cover"
                                                data-ai-hint={image.hint}
                                                priority={index === 0}
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
                             <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">No Media</span>
                            </div>
                        )}
                         <div className="p-6">
                            <h1 className="text-2xl font-bold font-headline text-foreground mb-2">{product.name}</h1>
                            <p className="text-xl font-bold text-primary mb-4">{product.priceFormatted}</p>
                            <Separator className="my-4" />
                            <div className="prose prose-sm text-muted-foreground leading-relaxed mb-6 max-w-none">
                                <p>{product.description}</p>
                            </div>
                            
                            <ProductDetailsClient product={product} />
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row p-0">
        <ProductContent product={product} />
      </DialogContent>
    </Dialog>
  );
}
