'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  imageUrl: z.string().url('Please enter a valid image URL'),
  sizes: z.string().min(1, 'Please enter at least one size (comma-separated)'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      sizes: '',
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not available. Please try again later.",
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
        const productsCollection = collection(firestore, 'products');
        const newDocRef = doc(productsCollection);
        const productId = newDocRef.id;

        const newProduct = {
            id: productId,
            name: data.name,
            description: data.description,
            price: data.price,
            priceFormatted: `₹${data.price.toLocaleString('en-IN')}`,
            images: [
                {
                    id: `${productId}_img`,
                    url: data.imageUrl,
                    alt: data.name,
                    hint: 'product photo',
                },
            ],
            sizes: data.sizes.split(',').map(s => s.trim()),
        };

      await addDocumentNonBlocking(productsCollection, newProduct);

      toast({
        title: 'Product Added!',
        description: `${data.name} has been successfully added to your store.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not add the product. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
                <span>Darpan Wears - Admin</span>
            </Link>
            <Button asChild>
                <Link href="/">View Shop</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-headline mb-8">Add New Product</h1>
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
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
