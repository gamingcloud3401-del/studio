
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Search, PlusCircle, Instagram, Calendar, CheckCircle, Clock, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { Order } from '@/lib/orders';
import type { PaymentSetting, SiteSetting } from '@/lib/settings';
import { format } from 'date-fns';

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

const footerSchema = z.object({
  content: z.string().min(1, "Footer content cannot be empty."),
});

const paymentSchema = z.object({
  isCashOnDeliveryEnabled: z.boolean(),
});


type ProductFormData = z.infer<typeof productSchema>;
type FooterFormData = z.infer<typeof footerSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;

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
                            <div className="flex items-baseline gap-2">
                                <p className="text-primary font-semibold">₹{product.salePrice}</p>
                                <p className="text-muted-foreground line-through text-sm">₹{product.originalPrice}</p>
                            </div>
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
    const [searchTerm, setSearchTerm] = useState('');

    const ordersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        // Query to sort by order date descending
        const q = collection(firestore, 'orders');
        return q; // Later we can add: query(q, orderBy('orderDate', 'desc'));
    }, [firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersCollection);
    
    const sortedOrders = useMemo(() => {
        return orders ? [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) : [];
    }, [orders]);


    const filteredOrders = useMemo(() => {
        if (!sortedOrders) return [];
        if (!searchTerm) return sortedOrders;
        return sortedOrders.filter(order => 
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerContact.includes(searchTerm) ||
            order.productId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedOrders, searchTerm]);


    const handleStatusChange = (order: Order) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'orders', order.id);
        const newStatus = !order.isCompleted;
        const updateData: { isCompleted: boolean; completedDate?: string } = { isCompleted: newStatus };
        if (newStatus) {
            updateData.completedDate = new Date().toISOString();
        } else {
            updateData.completedDate = '';
        }
        updateDocumentNonBlocking(docRef, updateData);
        toast({
            title: `Order ${newStatus ? 'Completed' : 'Marked as Pending'}`,
            description: `Order for ${order.customerName} has been updated.`,
        });
    };
    
    const handleDeleteOrder = (order: Order) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'orders', order.id);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Order Deleted',
            description: `Order for ${order.customerName} has been deleted.`,
        });
    }

    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold font-headline">Manage Orders</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by customer, contact, or Product ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
             <div className="space-y-4">
                {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                
                {!isLoading && filteredOrders && filteredOrders.map(order => (
                    <Card key={order.id} className={`w-full ${order.isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className='font-semibold text-lg'>{order.customerName}</p>
                                    <p className='text-sm text-muted-foreground'>{order.customerContact}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Switch 
                                        checked={order.isCompleted}
                                        onCheckedChange={() => handleStatusChange(order)}
                                        aria-label='Toggle order status'
                                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-yellow-500"
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the order for {order.customerName}. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteOrder(order)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <Separator/>
                             <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">{order.customerAddress}</p>
                                <p><strong>Product ID:</strong> <span className='font-mono'>{order.productId}</span></p>
                                {order.productDetails && (
                                    <p><strong>Item:</strong> {order.productDetails.name} (Size: {order.productDetails.size})</p>
                                )}
                             </div>
                             <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                                 <div className='flex items-center gap-1.5'>
                                     <Clock className="h-3 w-3" />
                                     <span>Ordered: {format(new Date(order.orderDate), "PPp")}</span>
                                 </div>
                                 {order.isCompleted && order.completedDate && (
                                     <div className='flex items-center gap-1.5 text-green-600 font-medium'>
                                         <CheckCircle className="h-3 w-3" />
                                         <span>Completed: {format(new Date(order.completedDate), "PPp")}</span>
                                     </div>
                                 )}
                             </div>

                        </CardContent>
                    </Card>
                ))}
                 {!isLoading && filteredOrders?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No orders found.</p>
                         {searchTerm && <p className="text-sm text-muted-foreground">Try clearing your search.</p>}
                    </div>
                )}
             </div>
        </div>
    )
}

function SiteSettings() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Footer Form
  const [isSubmittingFooter, setIsSubmittingFooter] = useState(false);
  const footerDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'footer') : null, [firestore]);
  const { data: footerData, isLoading: isLoadingFooter } = useDoc<SiteSetting>(footerDocRef);
  const footerForm = useForm<FooterFormData>({ resolver: zodResolver(footerSchema) });
  useEffect(() => {
    if (footerData) {
      footerForm.reset({ content: footerData.content });
    } else {
        footerForm.reset({ content: `© ${new Date().getFullYear()} Darpan Wears. All rights reserved.` })
    }
  }, [footerData, footerForm]);

  const onFooterSubmit: SubmitHandler<FooterFormData> = async (data) => {
    if (!firestore || !footerDocRef) return;
    setIsSubmittingFooter(true);
    try {
      await setDoc(footerDocRef, data, { merge: true });
      toast({ title: 'Footer Updated!', description: 'Your website footer has been saved.' });
    } catch (error) {
      console.error('Error updating footer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update footer.' });
    } finally {
      setIsSubmittingFooter(false);
    }
  };

  // Payment Form
  const paymentDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'paymentOptions') : null, [firestore]);
  const { data: paymentData, isLoading: isLoadingPayment } = useDoc<PaymentSetting>(paymentDocRef);
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (paymentData) {
        paymentForm.reset({ isCashOnDeliveryEnabled: paymentData.isCashOnDeliveryEnabled });
    } else {
        paymentForm.reset({ isCashOnDeliveryEnabled: true });
    }
  }, [paymentData, paymentForm]);

  const handlePaymentSettingChange = async (checked: boolean) => {
    if (!firestore || !paymentDocRef) return;
    paymentForm.setValue('isCashOnDeliveryEnabled', checked);
    try {
      await setDoc(paymentDocRef, { isCashOnDeliveryEnabled: checked }, { merge: true });
      toast({ title: 'Payment Settings Updated', description: `Cash on Delivery has been ${checked ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update payment settings.' });
      // Revert UI on error
      paymentForm.setValue('isCashOnDeliveryEnabled', !checked);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                Site Settings
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPayment ? <Skeleton className="h-20 w-full" /> : (
                    <Form {...paymentForm}>
                        <FormField
                            control={paymentForm.control}
                            name="isCashOnDeliveryEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Global Cash on Delivery</FormLabel>
                                        <FormDescription>
                                            Enable or disable COD for all products by default.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={handlePaymentSettingChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                    </Form>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Footer Content</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingFooter ? <Skeleton className="h-40 w-full" /> : (
                <Form {...footerForm}>
                    <form onSubmit={footerForm.handleSubmit(onFooterSubmit)} className="space-y-4">
                    <FormField
                        control={footerForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Footer Text</FormLabel>
                            <FormDescription>
                                This content will appear in your site's footer. You can use this for copyright, contact info, or other details.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="Enter footer text here..." {...field} rows={5} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingFooter} className="w-full">
                        {isSubmittingFooter ? 'Saving Footer...' : 'Save Footer'}
                    </Button>
                    </form>
                </Form>
                )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

export default function AdminPage() {
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      originalPrice: 0,
      salePrice: 0,
      images: [{ url: '' }],
      sizes: '',
      isCashOnDeliveryAvailable: true,
      productLink: '',
      videoUrl: '',
    },
  });


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
            originalPrice: data.originalPrice,
            salePrice: data.salePrice,
            priceFormatted: `₹${data.salePrice}`,
            images: data.images.map((img, index) => (
                {
                    id: `${productId}_img_${index}`,
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
            <Button asChild>
                <Link href="/">View Shop</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        <OrderList />

        <Separator />

        <SiteSettings />

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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={productForm.control}
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
                    control={productForm.control}
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
                control={productForm.control}
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
