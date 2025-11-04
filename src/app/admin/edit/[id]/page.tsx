
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Instagram, PlusCircle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  originalPrice: z.coerce.number().min(0, 'Original price must be a positive number'),
  salePrice: z.coerce.number().min(0, 'Sale price must be a positive number'),
  images: z.array(z.object({ url: z.string().url('Please enter a valid image URL') })).min(1, 'Please add at least one image.'),
  sizes: z.string().min(1, 'Please enter at least one size (comma-separated)'),
  isCashOnDeliveryAvailable: z.boolean(),
  productLink: z.string().url('Please enter a valid URL for the product link').optional().or(z.literal('')),
  videoUrl: z.string().url('Please enter a valid video URL').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const firestore = useFirestore();
  const productRef = useMemoFirebase(() => {
      if (!firestore || !id) return null;
      return doc(firestore, 'products', id);
  }, [firestore, id]);

  const { data: product, isLoading } = useDoc<Product>(productRef);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'images'
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        originalPrice: product.originalPrice,
        salePrice: product.salePrice,
        images: product.images.map(img => ({ url: img.url })),
        sizes: product.sizes.join(', '),
        isCashOnDeliveryAvailable: product.isCashOnDeliveryAvailable ?? true,
        productLink: product.productLink || '',
        videoUrl: product.videoUrl || '',
      });
    }
  }, [product, form]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!firestore || !id) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const docRef = doc(firestore, 'products', id);
        
        const updatedProduct = {
            name: data.name,
            description: data.description,
            originalPrice: data.originalPrice,
            salePrice: data.salePrice,
            priceFormatted: `₹${data.salePrice}`,
            images: data.images.map((img, index) => (
                {
                    id: `${id}_img_${index}`,
                    url: img.url,
                    alt: data.name,
                    hint: 'product photo',
                }
            )),
            sizes: data.sizes.split(',').map(s => s.trim()),
            isCashOnDeliveryAvailable: data.isCashOnDeliveryAvailable,
            productLink: data.productLink || '',
            videoUrl: data.videoUrl || '',
        };

      await setDoc(docRef, updatedProduct, { merge: true });

      toast({
        title: 'Product Updated!',
        description: `${data.name} has been successfully updated.`,
      });
      router.push('/admin');
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not update the product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="bg-background min-h-screen">
             <header className="bg-card border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                        <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                        <span>Darpan Wears - Admin</span>
                    </Link>
                </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-40 mb-8" />
                    <div className="space-y-6">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </main>
        </div>
    )
  }

  if (!product) {
     return (
        <div className="bg-background min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <p className="text-muted-foreground mb-6">The product you're trying to edit doesn't exist.</p>
                <Button asChild>
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
            </div>
        </div>
     )
  }


  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                    <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                    <span>Darpan Wears - Admin</span>
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
            <Button asChild>
                <Link href="/">View Shop</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Button asChild variant="ghost">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Product List
                    </Link>
                </Button>
            </div>
          <h1 className="text-3xl font-bold font-headline mb-8">Edit Product</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cool T-Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the product..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Original Price (₹)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 1299" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sale Price (₹)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 999" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <div>
                <FormLabel>Images</FormLabel>
                <div className="space-y-4 pt-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`images.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ url: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </div>
              <FormField
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sizes (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., S, M, L, XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isCashOnDeliveryAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Cash on Delivery</FormLabel>
                      <FormDescription>
                        Is COD available for this specific product?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/video.mp4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Link (Admin only)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product-link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
