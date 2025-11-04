'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Pencil, Trash2, Search, PlusCircle, Instagram, Calendar, CheckCircle, Clock, Settings, LogOut, Megaphone, Image as ImageIcon, Shield, Bot, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { Order } from '@/lib/orders';
import type { PaymentSetting, SiteSetting, AnnouncementSetting, HeroImage } from '@/lib/settings';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(3, 'Category is required'),
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

const privacyPolicySchema = z.object({
    content: z.string().min(1, "Privacy Policy content cannot be empty."),
});

const announcementSchema = z.object({
  content: z.string().optional(),
});

const paymentSchema = z.object({
  isCashOnDeliveryEnabled: z.boolean(),
});

const heroImageSchema = z.object({
  imageUrl: z.string().url('Please enter a valid image URL.'),
});


type ProductFormData = z.infer<typeof productSchema>;
type FooterFormData = z.infer<typeof footerSchema>;
type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;
type AnnouncementFormData = z.infer<typeof announcementSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;
type HeroImageFormData = z.infer<typeof heroImageSchema>;

function AdminGuide() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
             <div>
                <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8" />
                    How to Use This Admin Panel
                </h1>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Managing Orders</AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                            <p>This section shows all incoming orders from customers. You can see customer details, the product they ordered, and the date.</p>
                            <p>Use the toggle switch to mark an order as 'Completed'. This will help you keep track of your fulfillment process. Use the trash icon to delete an order entirely.</p>
                            <p>You can also search for specific orders using the search bar.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Site Settings</AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                             <p>Here you can control global settings for your website:</p>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                <li><strong>Payment Settings:</strong> Globally enable or disable Cash on Delivery.</li>
                                <li><strong>Announcement Bar:</strong> Set a promotional message that appears on your homepage. Leave it blank to hide the bar.</li>
                                <li><strong>Footer Content:</strong> Change the text that appears at the bottom of every page.</li>
                                <li><strong>Privacy Policy:</strong> Edit the content of your privacy policy page.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Manage Hero Section</AccordionTrigger>
                        <AccordionContent>
                            <p>This section allows you to manage the big image carousel on your homepage. You can add new images by providing a URL. You can also see a list of current images and delete any you no longer want.</p>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>Darpan 2.0 AI Assistant</AccordionTrigger>
                        <AccordionContent>
                           <p>The AI assistant automatically learns from your product list. To provide it with more business-specific information (like shipping policies, return information, etc.), you can edit its core prompt in the file: <code className='bg-muted px-2 py-1 rounded-md'>src/ai/flows/darpan-flow.ts</code>.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>Adding & Editing Products</AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                             <p>Use the "Add New Product" form to add items to your store. Fill in all the details, including name, price, description, sizes, and at least one image URL.</p>
                             <p>The "Manage Products" section below shows all your current products. You can click "Edit" to go to a separate page to update a product's details, or "Delete" to remove it permanently.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
             </div>
        </div>
    )
}

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

  // Announcement Form
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const announcementDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'announcement') : null, [firestore]);
  const { data: announcementData, isLoading: isLoadingAnnouncement } = useDoc<AnnouncementSetting>(announcementDocRef);
  const announcementForm = useForm<AnnouncementFormData>({ resolver: zodResolver(announcementSchema) });
  useEffect(() => {
    if (announcementData) {
      announcementForm.reset({ content: announcementData.content });
    }
  }, [announcementData, announcementForm]);

  const onAnnouncementSubmit: SubmitHandler<AnnouncementFormData> = async (data) => {
    if (!firestore || !announcementDocRef) return;
    setIsSubmittingAnnouncement(true);
    try {
      await setDoc(announcementDocRef, data, { merge: true });
      toast({ title: 'Announcement Updated!', description: 'Your announcement bar has been saved.' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update announcement.' });
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };


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

  // Privacy Policy Form
  const [isSubmittingPrivacy, setIsSubmittingPrivacy] = useState(false);
  const privacyDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'privacyPolicy') : null, [firestore]);
  const { data: privacyData, isLoading: isLoadingPrivacy } = useDoc<SiteSetting>(privacyDocRef);
  const privacyForm = useForm<PrivacyPolicyFormData>({ resolver: zodResolver(privacyPolicySchema) });
  useEffect(() => {
    if (privacyData) {
        privacyForm.reset({ content: privacyData.content });
    } else {
        privacyForm.reset({ content: `Welcome to Darpan Wears. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.` });
    }
  }, [privacyData, privacyForm]);
  
  const onPrivacySubmit: SubmitHandler<PrivacyPolicyFormData> = async (data) => {
    if (!firestore || !privacyDocRef) return;
    setIsSubmittingPrivacy(true);
    try {
      await setDoc(privacyDocRef, data, { merge: true });
      toast({ title: 'Privacy Policy Updated!', description: 'Your privacy policy has been saved.' });
    } catch (error) {
      console.error('Error updating privacy policy:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update privacy policy.' });
    } finally {
      setIsSubmittingPrivacy(false);
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
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Announcement Bar</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingAnnouncement ? <Skeleton className="h-40 w-full" /> : (
                <Form {...announcementForm}>
                    <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-4">
                    <FormField
                        control={announcementForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Announcement Text</FormLabel>
                            <FormDescription>
                                This text will appear in a special bar on your homepage. Leave it empty to hide the bar.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="e.g., ✨ Diwali Sale is LIVE! ✨" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingAnnouncement} className="w-full">
                        {isSubmittingAnnouncement ? 'Saving Announcement...' : 'Save Announcement'}
                    </Button>
                    </form>
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

        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingPrivacy ? <Skeleton className="h-40 w-full" /> : (
                <Form {...privacyForm}>
                    <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-4">
                    <FormField
                        control={privacyForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Policy Content</FormLabel>
                            <FormDescription>
                                This content will be displayed on your Privacy Policy page.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="Enter your privacy policy text here..." {...field} rows={10} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingPrivacy} className="w-full">
                        {isSubmittingPrivacy ? 'Saving Policy...' : 'Save Privacy Policy'}
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

function HeroImageManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const heroImagesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'heroImages');
    }, [firestore]);

    const { data: heroImages, isLoading } = useCollection<HeroImage>(heroImagesCollection);

    const form = useForm<HeroImageFormData>({
        resolver: zodResolver(heroImageSchema),
        defaultValues: {
            imageUrl: '',
        },
    });

    const onSubmit: SubmitHandler<HeroImageFormData> = async (data) => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const newDocRef = doc(heroImagesCollection!);
            const newHeroImage = {
                id: newDocRef.id,
                imageUrl: data.imageUrl,
            };
            await addDocumentNonBlocking(newDocRef, newHeroImage);
            toast({
                title: 'Hero Image Added!',
                description: 'The new image has been added to your homepage carousel.',
            });
            form.reset();
        } catch (error) {
            console.error('Error adding hero image:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add the hero image.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (imageId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'heroImages', imageId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Hero Image Deleted',
            description: `The image has been removed.`,
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
                    <ImageIcon className="h-8 w-8" />
                    Manage Hero Section
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Hero Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Adding Image...' : 'Add Hero Image'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Current Hero Images</h2>
                <div className="space-y-4">
                    {isLoading && Array.from({length: 1}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    {heroImages && heroImages.length > 0 ? (
                        heroImages.map(image => (
                            <Card key={image.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Image src={image.imageUrl} alt="Hero Image" width={80} height={80} className="rounded-md object-cover aspect-square" />
                                        <div>
                                            <p className="text-xs text-muted-foreground truncate max-w-xs">{image.imageUrl}</p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove the image from your hero section. This cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(image.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No hero images have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminAIDetails() {

    return(
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
                    <Bot className="h-8 w-8" />
                    Darpan 2.0 AI Assistant
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                The AI assistant (Darpan 2.0) automatically learns from your product list. To provide it with more business-specific information (like shipping policies, return information, etc.), you can edit its core prompt.
                            </p>
                            <p className='text-sm text-muted-foreground'>
                                The AI prompt can be found and edited in the file: <code className='bg-muted px-2 py-1 rounded-md'>src/ai/flows/darpan-flow.ts</code>
                            </p>
                            <Button disabled>Edit AI Prompt (Coming Soon)</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


export default function AdminPage() {
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check for auth token in sessionStorage
    const authToken = sessionStorage.getItem('darpan-admin-auth');
    if (authToken === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
  }, [router]);


  const { toast } = useToast();
  const firestore = useFirestore();

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
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
            category: data.category,
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

  const handleLogout = () => {
    sessionStorage.removeItem('darpan-admin-auth');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-4">
                <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
        </div>
    );
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
            <div className='flex items-center gap-4'>
                <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
                <Button asChild>
                    <Link href="/">View Shop</Link>
                </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        <AdminGuide />

        <Separator />
        
        <OrderList />

        <Separator />

        <SiteSettings />

        <Separator />

        <HeroImageManager />

        <Separator />

        <AdminAIDetails />

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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., T-Shirts, Jackets" {...field} />
                    </FormControl>
                     <FormDescription>
                        Assign a category to this product (e.g., Jackets, T-Shirts).
                    </FormDescription>
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
