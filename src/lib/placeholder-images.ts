import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This is now empty, as data is seeded into firestore.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
