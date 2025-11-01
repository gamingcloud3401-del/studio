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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const message = `
New Order from Darpan Wears!
-------------------------
Product ID: ${product.id}
Product: ${product.name}
Size: ${selectedSize}
Price (INR): ${product.priceFormatted}
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
    
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
                <p><strong>Product:</strong> {product.name}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                <p><strong>Price (INR):</strong> <span className="font-bold text-primary">{product.priceFormatted}</span></p>
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cash on Delivery
                        </FormLabel>
                      </FormItem>
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
