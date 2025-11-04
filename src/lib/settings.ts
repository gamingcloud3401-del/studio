
export type SiteSetting = {
    id: string;
    content: string;
};

export type PaymentSetting = {
    id: string;
    isCashOnDeliveryEnabled: boolean;
};

export type AnnouncementSetting = {
    id: string;
    content: string;
};

export type HeroImage = {
    id: string;
    imageUrl: string;
    title: string;
    subtitle?: string;
};
