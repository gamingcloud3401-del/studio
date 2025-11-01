
"use client";

import * as React from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import ProductDetailsClient from '@/components/product-details-client';
import type { Product } from "@/lib/products";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

interface ProductDetailsDialogProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductDetailsDialog({ product, children }: ProductDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row p-0">
        <div className="w-full md:w-1/2 flex-shrink-0">
             <Carousel className="w-full h-full">
                <CarouselContent>
                    {product.images.map((image) => (
                    <CarouselItem key={image.id}>
                        <div className="aspect-[3/4] w-full relative">
                            <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover md:rounded-l-lg"
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
        <div className="flex flex-col p-6 sm:p-8 overflow-y-auto flex-grow">
            <h1 className="text-3xl lg:text-4xl font-bold font-headline text-foreground mb-3">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-4">{product.priceFormatted}</p>
            <Separator className="my-4" />
            <div className="prose prose-sm text-muted-foreground leading-relaxed mb-6 max-w-none">
              <p>{product.description}</p>
            </div>
            
            <ProductDetailsClient product={product} />

          </div>
      </DialogContent>
    </Dialog>
  );
}
