
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PackageSearch, XCircle, Search, Clock, CheckCircle, Trash2, Instagram } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/orders';
import { format } from 'date-fns';
import type { SiteSetting } from '@/lib/settings';

const searchSchema = z.object({
  phone: z.string().regex(/^\+?[1-9][0-9]{7,14}$/, { message: "Please enter a valid phone number (e.g., +919876543210)." }),
});
type SearchFormData = z.infer<typeof searchSchema>;

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


export default function TrackOrderPage() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { phone: '' },
  });

  const onSearchSubmit: SubmitHandler<SearchFormData> = (data) => {
    setPhoneNumber(data.phone);
  };
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !phoneNumber) return null;
    return query(collection(firestore, 'orders'), where('customerContact', '==', phoneNumber));
  }, [firestore, phoneNumber]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
  
  const sortedOrders = useMemo(() => {
      return orders ? [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) : [];
  }, [orders]);


  const handleCancelOrder = (order: Order) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'orders', order.id);
      deleteDocumentNonBlocking(docRef);
      
      const audio = document.getElementById('cancel-sound') as HTMLAudioElement;
      if (audio) {
          audio.play().catch(e => console.error("Audio play failed", e));
      }

      toast({
          title: 'Order Cancelled',
          description: `Your order for ${order.productDetails?.name || 'an item'} has been cancelled.`,
          duration: 3000,
      });
  };

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
             <Button asChild variant="outline">
                <Link href="/">
                    Shop All
                </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="text-4xl font-bold font-headline mt-4">Track Your Order</h1>
            <p className="text-muted-foreground mt-2">Enter your phone number to find your orders and manage them.</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <Form {...searchForm}>
                <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="flex items-start gap-2">
                  <FormField
                    control={searchForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className="sr-only">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number (e.g., +91...)" {...field} />
                        </FormControl>
                        <FormMessage className="pt-1" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="h-10">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
              {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
              
              {phoneNumber && !isLoading && sortedOrders.length > 0 && (
                  <h2 className="text-2xl font-bold font-headline">Your Orders</h2>
              )}
              
              {!isLoading && sortedOrders.map(order => (
                  <Card key={order.id} className={`w-full ${order.isCompleted ? 'border-green-500/30' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className='font-semibold text-lg'>{order.productDetails?.name || `Product ID: ${order.productId}`}</p>
                                  <p className='text-sm text-muted-foreground'>Size: {order.productDetails?.size}</p>
                              </div>
                              {!order.isCompleted && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently cancel your order for {order.productDetails?.name || 'this item'}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCancelOrder(order)}>
                                                Yes, Cancel Order
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                              )}
                          </div>
                          <Separator/>
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

              {phoneNumber && !isLoading && sortedOrders.length === 0 && (
                  <div className="text-center py-12">
                      <p className="text-muted-foreground">No orders found for this phone number.</p>
                      <p className="text-sm text-muted-foreground mt-1">Please check the number and try again.</p>
                  </div>
              )}
          </div>
        </div>
      </main>
       <SiteFooter />
    </div>
  );
}
