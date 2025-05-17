import { create } from 'zustand';

import * as GeminiActions from '@/actions/gemini/image-generation.action';

import { FileType } from '@/actions/helpers/prompt-with-images';
import { ImagePickerAsset } from 'expo-image-picker';

interface ImagePlaygroundState {
  // State
  isGenerating: boolean;
  images: string[];
  history: string[];

  previousPrompt: string;
  previousImages: (FileType | ImagePickerAsset)[];

  selectedStyle: string;

  // Actions
  generateImage: (
    prompt: string,
    images: (FileType | ImagePickerAsset)[]
  ) => Promise<void>;

  generateNextImage: () => Promise<void>;
  setSelectedStyle: (style: string) => void;
}

export const usePlaygroundStore = create<ImagePlaygroundState>()(
  (set, get) => ({
    // State
    isGenerating: false,
    images: [],
    history: [],

    previousPrompt: '',
    previousImages: [],

    selectedStyle: '',

    // Actions
    generateImage: async (
      prompt: string,
      images: (FileType | ImagePickerAsset)[]
    ): Promise<void> => {
      set({
        isGenerating: true,
        images: [],
        previousPrompt: prompt,
        previousImages: images,
      });

      // TODO: aplicar estilo seleccionado

      const { imageUrl } = await GeminiActions.getImageGeneration(
        prompt,
        images
      );

      if (imageUrl === '') {
        set({
          isGenerating: false,
        });
        return;
      }

      const currentImages = [imageUrl, ...get().history];

      set({
        isGenerating: false,
        images: [imageUrl],
        history: currentImages,
      });

      setTimeout(() => {
        get().generateNextImage();
      }, 500);
    },

    generateNextImage: async (): Promise<void> => {
      const currentImages = get().images;
      const currentHistory = get().history;
      let previousPrompt = get().previousPrompt;
      const previousImages = get().previousImages;

      // TODO: aplicar estilo seleccionado

      set({
        isGenerating: true,
      });

      const { imageUrl } = await GeminiActions.getImageGeneration(
        previousPrompt,
        previousImages
      );

      if (imageUrl === '') {
        set({ isGenerating: false });
        return;
      }

      set({
        isGenerating: false,
        images: [...currentImages, imageUrl],
        history: [imageUrl, ...currentHistory],
      });
    },
    setSelectedStyle: (style: string) => {
      if (style === get().selectedStyle) {
        set({ selectedStyle: '' });
        return;
      }

      set({ selectedStyle: style });
    },
  })
);
