
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/products";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { addDocumentNonBlocking, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { PaymentSetting } from "@/lib/settings";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9][0-9]{7,14}$/, { message: "Please enter a valid phone number (e.g., +919876543210)." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
  paymentMethod: z.enum(["cash", "online"], {
    required_error: "You need to select a payment method.",
  }),
});

interface OrderFormProps {
    product: Product;
    selectedSize: string;
    setDialogOpen: (open: boolean) => void;
}

export function OrderForm({ product, selectedSize, setDialogOpen }: OrderFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const paymentSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'paymentOptions');
  }, [firestore]);

  const { data: paymentSettings, isLoading: isLoadingPaymentSettings } = useDoc<PaymentSetting>(paymentSettingsRef);

  // Combines global setting with product-specific setting.
  const isGlobalCodEnabled = paymentSettings?.isCashOnDeliveryEnabled ?? true; // Default to true if not set
  const isProductCodAvailable = product.isCashOnDeliveryAvailable ?? true;
  const isFinalCodEnabled = isGlobalCodEnabled && isProductCodAvailable;


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      paymentMethod: isFinalCodEnabled ? undefined : "online",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
     // 1. Save order to Firestore
    if (firestore) {
        try {
            const ordersCollectionRef = collection(firestore, 'orders');
            const newDocRef = doc(ordersCollectionRef);
            const newOrder = {
                id: newDocRef.id,
                productId: product.id,
                customerName: values.name,
                customerContact: values.phone,
                customerAddress: values.address,
                orderDate: new Date().toISOString(),
                isCompleted: false,
                completedDate: "",
                productDetails: { // Optional: for easier reference in admin panel
                    name: product.name,
                    price: product.salePrice,
                    size: selectedSize
                }
            };
            // Use a non-blocking write
            await addDocumentNonBlocking(newDocRef, newOrder);
        } catch (error) {
            console.error("Error saving order to Firestore:", error);
            // Optionally notify user of failure, though we proceed to WhatsApp anyway
            toast({
                variant: 'destructive',
                title: 'Order could not be saved automatically',
                description: 'Please ensure you send the WhatsApp message.'
            });
        }
    }


    // 2. Open WhatsApp
    const message = `
New Order from Darpan Wears!
-------------------------
Product ID: ${product.id}
Product: ${product.name}
Size: ${selectedSize}
Price: ₹${product.salePrice}
Payment Method: ${values.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
-------------------------
Customer Details:
Name: ${values.name}
Phone: ${values.phone}
Address: ${values.address}
    `;

    const whatsappNumber = "919332307996";
    const encodedMessage = encodeURIComponent(message.trim());
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    // 3. Close the dialog
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
                <p><strong>Product:</strong> {product.name}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                 <div className="flex items-baseline gap-2">
                    <p><strong>Price:</strong></p>
                    <p className="font-bold text-primary">₹{product.salePrice}</p>
                    <p className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</p>
                </div>
            </div>

            {isLoadingPaymentSettings ? (
                <Skeleton className="h-20 w-full" />
            ) : (
                 <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={(value) => {
                                field.onChange(value);
                                if (value === 'online') {
                                    // You can add logic here if needed for online payments
                                }
                            }}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            {isFinalCodEnabled && (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="cash" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    Cash on Delivery
                                </FormLabel>
                                </FormItem>
                            )}
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="online" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Online Payment
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            )}

           

            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Ramesh Kumar" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., +919876543210" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., House No, Street, City, State, Pincode" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Send Order on WhatsApp
        </Button>
      </form>
    </Form>
  );
}
