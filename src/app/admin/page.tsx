
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Search, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { Order } from '@/lib/orders';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  images: z.array(z.object({ url: z.string().url('Please enter a valid image URL') })).min(1, 'Please add at least one image.'),
  sizes: z.string().min(1, 'Please enter at least one size (comma-separated)'),
  productLink: z.string().url('Please enter a valid URL for the product link').optional().or(z.literal('')),
});

const orderSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    customerName: z.string().min(2, 'Customer name is required'),
    customerContact: z.string().min(10, 'A valid contact number is required'),
    customerAddress: z.string().min(10, 'A valid address is required'),
});

type ProductFormData = z.infer<typeof productSchema>;
type OrderFormData = z.infer<typeof orderSchema>;

function ProductSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [foundProduct, setFoundProduct] = useState<Product | null>(null);
    const [searched, setSearched] = useState(false);

    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearched(true);
        if (!products || !searchTerm) {
            setFoundProduct(null);
            return;
        }
        const result = products.find(p => p.id === searchTerm.trim());
        setFoundProduct(result || null);
    };

    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold font-headline">Find Product by ID</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Enter Product ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button type="submit" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </form>
            {searched && (
                <div className="pt-4">
                    {foundProduct ? (
                         <Card>
                            <CardContent className="p-4">
                               <p className="font-bold">{foundProduct.name}</p>
                               <p className="text-sm text-muted-foreground">ID: {foundProduct.id}</p>
                               {foundProduct.productLink ? (
                                   <a href={foundProduct.productLink} target="_blank" rel="noopener noreferrer" className="text-primary underline mt-2 inline-block">
                                        {foundProduct.productLink}
                                   </a>
                               ) : (
                                  <p className="text-sm text-muted-foreground mt-2">No product link available.</p>
                               )}
                            </CardContent>
                         </Card>
                    ) : (
                        <p className="text-muted-foreground text-center">Product not found.</p>
                    )}
                </div>
            )}
        </div>
    )
}

function ProductList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const productsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const handleDelete = (productId: string, productName: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'products', productId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Product Deleted',
            description: `${productName} has been removed from your store.`,
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-headline">Manage Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                     <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="aspect-square w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /><div className="flex justify-end gap-2 pt-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div></CardContent></Card>
                ))}
                {products?.map((product) => (
                    <Card key={product.id} className="flex flex-col">
                        <CardHeader className="p-0">
                             <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt}
                                width={400}
                                height={400}
                                className="object-cover aspect-square rounded-t-lg"
                             />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                            <p className="text-primary font-semibold">{product.priceFormatted}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/edit/${product.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the product
                                            "{product.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(product.id, product.name)}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {!isLoading && products?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No products found.</p>
            )}
        </div>
    );
}

function OrderList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const ordersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'orders');
    }, [firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersCollection);

    const handleStatusChange = (order: Order) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'orders', order.id);
        const newStatus = !order.isCompleted;
        updateDocumentNonBlocking(docRef, { isCompleted: newStatus });
        toast({
            title: `Order ${newStatus ? 'Completed' : 'Marked as Pending'}`,
            description: `Order for ${order.customerName} has been updated.`,
        });
    };

    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold font-headline">Manage Orders</h2>
             <div className="border rounded-lg">
                <div className="grid grid-cols-[1fr,1fr,2fr,1fr] p-4 font-semibold border-b bg-muted/50">
                    <div>Product ID</div>
                    <div>Customer</div>
                    <div>Address</div>
                    <div className='text-center'>Status</div>
                </div>
                {isLoading && <div className='p-4 text-center'>Loading orders...</div>}
                {!isLoading && orders?.map(order => (
                    <div key={order.id} className={`grid grid-cols-[1fr,1fr,2fr,1fr] p-4 items-center border-b last:border-b-0 ${order.isCompleted ? 'bg-green-100/50 dark:bg-green-900/20' : ''}`}>
                        <div className='font-mono text-sm'>{order.productId}</div>
                        <div>
                            <p className='font-semibold'>{order.customerName}</p>
                            <p className='text-sm text-muted-foreground'>{order.customerContact}</p>
                        </div>
                        <div className='text-sm text-muted-foreground'>{order.customerAddress}</div>
                        <div className='flex justify-center'>
                            <Switch 
                                checked={order.isCompleted}
                                onCheckedChange={() => handleStatusChange(order)}
                                aria-label='Toggle order status'
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-yellow-500"
                            />
                        </div>
                    </div>
                ))}
                 {!isLoading && orders?.length === 0 && (
                    <p className="text-muted-foreground text-center p-8">No orders found.</p>
                )}
             </div>
        </div>
    )
}

export default function AdminPage() {
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      images: [{ url: '' }],
      sizes: '',
      productLink: '',
    },
  });

  const orderForm = useForm<OrderFormData>({
      resolver: zodResolver(orderSchema),
      defaultValues: {
          productId: '',
          customerName: '',
          customerContact: '',
          customerAddress: ''
      }
  })

  const { fields, append, remove } = useFieldArray({
    control: productForm.control,
    name: 'images'
  });

  const onProductSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not available. Please try again later.",
        });
        return;
    }

    setIsSubmittingProduct(true);
    
    try {
        const productsCollectionRef = collection(firestore, 'products');
        const newDocRef = doc(productsCollectionRef); 
        const productId = newDocRef.id;

        const newProduct = {
            id: productId,
            name: data.name,
            description: data.description,
            price: data.price,
            priceFormatted: `${data.price}rs`,
            images: data.images.map((img, index) => (
                {
                    id: `${productId}_img_${index}`,
                    url: img.url,
                    alt: data.name,
                    hint: 'product photo',
                }
            )),
            sizes: data.sizes.split(',').map(s => s.trim()),
            productLink: data.productLink || '',
        };

      await addDocumentNonBlocking(newDocRef, newProduct);
      
      toast({
        title: 'Product Added!',
        description: `${data.name} has been successfully added to your store.`,
      });
      productForm.reset();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not add the product. Please try again.',
      });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const onOrderSubmit: SubmitHandler<OrderFormData> = async (data) => {
      if(!firestore) {
          toast({ variant: "destructive", title: "Error", description: "Database not available." });
          return;
      }
      setIsSubmittingOrder(true);
      try {
          const ordersCollectionRef = collection(firestore, 'orders');
          const newDocRef = doc(ordersCollectionRef);
          const newOrder = {
              id: newDocRef.id,
              ...data,
              orderDate: new Date().toISOString(),
              isCompleted: false,
          }
          await addDocumentNonBlocking(newDocRef, newOrder);
          toast({ title: "Order Added!", description: `Order for ${data.customerName} has been saved.` });
          orderForm.reset();
      } catch (error) {
          console.error("Error adding order:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not save the order."});
      } finally {
          setIsSubmittingOrder(false);
      }
  }

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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-headline mb-8">Add New Order</h1>
             <Form {...orderForm}>
                <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-6">
                    <FormField control={orderForm.control} name="productId" render={({field}) => (
                        <FormItem><FormLabel>Product ID</FormLabel><FormControl><Input placeholder="e.g., prod_1" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={orderForm.control} name="customerName" render={({field}) => (
                        <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={orderForm.control} name="customerContact" render={({field}) => (
                        <FormItem><FormLabel>Customer Contact</FormLabel><FormControl><Input placeholder="e.g., 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={orderForm.control} name="customerAddress" render={({field}) => (
                        <FormItem><FormLabel>Customer Address</FormLabel><FormControl><Textarea placeholder="Full shipping address" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmittingOrder} className="w-full">
                        {isSubmittingOrder ? 'Saving Order...' : 'Save Order'}
                    </Button>
                </form>
             </Form>
        </div>

        <Separator />

        <OrderList />

        <Separator />
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold font-headline mb-8">Add New Product</h1>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6">
              <FormField
                control={productForm.control}
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
                control={productForm.control}
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
                control={productForm.control}
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
              
              <div>
                <FormLabel>Images</FormLabel>
                <div className="space-y-4 pt-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={productForm.control}
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
                control={productForm.control}
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
                control={productForm.control}
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
              <Button type="submit" disabled={isSubmittingProduct} className="w-full">
                {isSubmittingProduct ? 'Adding Product...' : 'Add Product'}
              </Button>
            </form>
          </Form>
        </div>

        <Separator />

        <div className="max-w-2xl mx-auto">
            <ProductSearch />
        </div>

        <Separator />

        <ProductList />

      </main>
    </div>
  );
}
