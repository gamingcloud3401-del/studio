
"use client";

import type { Product } from '@/lib/products';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OrderForm } from './order-form';
import { ShoppingCart, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailsClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleOrderClick = () => {
    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Size not selected",
        description: "Please select a size before ordering.",
      });
      return;
    }
    setIsDialogOpen(true);
  }

  const isCodAvailable = product.isCashOnDeliveryAvailable ?? true;


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Select Size:</h3>
        <RadioGroup
          value={selectedSize}
          onValueChange={setSelectedSize}
          className="flex flex-wrap gap-2"
          aria-label="Select size"
        >
          {product.sizes.map((size) => (
            <div key={size} className="flex items-center">
              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
              <Label
                htmlFor={`size-${size}`}
                className={`flex items-center justify-center rounded-md border text-xs font-medium h-8 w-12 cursor-pointer transition-colors
                  ${selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1'
                    : 'bg-card hover:bg-accent/80'
                  }`}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

       {!isCodAvailable && (
         <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border border-dashed">
            <Truck className="h-5 w-5 text-destructive" />
            <span>Cash on Delivery is not available for this product.</span>
         </div>
       )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-md py-6 shadow-lg transform transition-transform hover:scale-105"
            onClick={handleOrderClick}
            aria-label="Order now"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Order Now
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Confirm Your Order</DialogTitle>
          </DialogHeader>
          {selectedSize && <OrderForm product={product} selectedSize={selectedSize} setDialogOpen={setIsDialogOpen} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
