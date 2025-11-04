
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

function AdminGuide() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
             <div>
                <h1 className="text-3xl font-bold font-headline mb-8 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8" />
                    How to Use This Admin Panel
                </h1>
                <p className="text-muted-foreground mb-6">
                    Welcome to your control center! Use the navigation menu on the left to manage your store.
                </p>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div>
                                <p>Managing Orders</p>
                                <p className='text-primary font-normal'>ऑर्डर प्रबंधित करना</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                            <p>This section shows all incoming orders from customers. You can see customer details, the product they ordered, and the date.</p>
                            <p className='text-sm text-muted-foreground'>यह अनुभाग ग्राहकों से आने वाले सभी ऑर्डर दिखाता है। आप ग्राहक विवरण, उनके द्वारा ऑर्डर किया गया उत्पाद और तारीख देख सकते हैं।</p>
                            <p>Use the toggle switch to mark an order as 'Completed'. This will help you keep track of your fulfillment process. Use the trash icon to delete an order entirely.</p>
                            <p className='text-sm text-muted-foreground'>किसी ऑर्डर को 'पूर्ण' के रूप में चिह्नित करने के लिए टॉगल स्विच का उपयोग करें। यह आपको अपनी पूर्ति प्रक्रिया पर नज़र रखने में मदद करेगा। किसी ऑर्डर को पूरी तरह से हटाने के लिए ट्रैश आइकन का उपयोग करें।</p>
                            <p>You can also search for specific orders using the search bar.</p>
                            <p className='text-sm text-muted-foreground'>आप खोज बार का उपयोग करके विशिष्ट ऑर्डर भी खोज सकते हैं।</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                         <AccordionTrigger>
                            <div>
                                <p>Managing Products</p>
                                <p className='text-primary font-normal'>उत्पाद प्रबंधित करना</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                             <p>Use the "Add New Product" form to add items to your store. Fill in all the details, including name, price, description, sizes, and at least one image URL.</p>
                             <p className='text-sm text-muted-foreground'>अपने स्टोर में आइटम जोड़ने के लिए "नया उत्पाद जोड़ें" फ़ॉर्म का उपयोग करें। नाम, मूल्य, विवरण, आकार और कम से कम एक छवि URL सहित सभी विवरण भरें।</p>
                             <p>The "Manage Products" section below the form shows all your current products. You can click "Edit" to go to a separate page to update a product's details, or "Delete" to remove it permanently.</p>
                              <p className='text-sm text-muted-foreground'>फ़ॉर्म के नीचे "उत्पाद प्रबंधित करें" अनुभाग आपके सभी वर्तमान उत्पादों को दिखाता है। आप किसी उत्पाद के विवरण को अपडेट करने के लिए एक अलग पृष्ठ पर जाने के लिए "संपादित करें" पर क्लिक कर सकते हैं, या इसे स्थायी रूप से हटाने के लिए "हटाएं" पर क्लिक कर सकते हैं।</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                         <AccordionTrigger>
                            <div>
                                <p>Site & Page Settings</p>
                                <p className='text-primary font-normal'>साइट और पेज सेटिंग्स</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className='space-y-2'>
                             <p>Here you can control global settings for your website:</p>
                             <p className='text-sm text-muted-foreground'>यहां आप अपनी वेबसाइट के लिए वैश्विक सेटिंग्स को नियंत्रित कर सकते हैं:</p>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li><strong>Payment Settings (भुगतान सेटिंग्स):</strong> Globally enable or disable Cash on Delivery (विश्व स्तर पर कैश ऑन डिलीवरी सक्षम या अक्षम करें).</li>
                                <li><strong>Announcement Bar (घोषणा बार):</strong> Set a promotional message that appears on your homepage. Leave it blank to hide the bar (एक प्रचार संदेश सेट करें जो आपके होमपेज पर दिखाई दे। बार छिपाने के लिए इसे खाली छोड़ दें).</li>
                                <li><strong>Hero Section (हीरो अनुभाग):</strong> Manage the large image carousel on your homepage. You can add new images or delete existing ones.</li>
                                <li><strong>Footer Content (फुटर सामग्री):</strong> Change the text that appears at the bottom of every page (हर पृष्ठ के नीचे दिखाई देने वाले टेक्स्ट को बदलें).</li>
                                <li><strong>Privacy Policy (गोपनीयता नीति):</strong> Edit the content of your privacy policy page (अपने गोपनीयता नीति पृष्ठ की सामग्री संपादित करें).</li>
                                <li><strong>AI Assistant (एआई सहायक):</strong> Customize the core instructions for the Darpan 2.0 AI to better assist your customers.</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
             </div>
        </div>
    )
}

export default function AdminPage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <AdminGuide />
      </main>
    </div>
  );
}
