import Silky from './assets/Silkycoolproducts.jpeg';
import Gold from './assets/Goldproducts.jpeg';
import HairCream from './assets/HairCream.jpeg';
import Cleanser from './assets/Cleanser.jpeg';
import Detox from './assets/Detox.jpeg';
import Nails from './assets/Nails.jpeg';
import VitaminC from './assets/VitaminC.jpeg';
import Herbal from './assets/HerbalEssence.jpeg';
import Mijan from './assets/Mijan.jpeg';
import Himalaya from './assets/himalaya.jpeg';

export const availableProductAssets: Record<string, { src: string; label: string }> = {
  silky: { src: Silky, label: 'Silky Collection' },
  gold: { src: Gold, label: 'Gold Collection' },
  hairCream: { src: HairCream, label: 'Hair Cream' },
  cleanser: { src: Cleanser, label: 'Cleanser' },
  detox: { src: Detox, label: 'Detox' },
  nails: { src: Nails, label: 'Nails Kit' },
  vitaminC: { src: VitaminC, label: 'Vitamin C Serum' },
  herbal: { src: Herbal, label: 'Herbal Essence' },
  mijan: { src: Mijan, label: 'Mijan Product' },
  himalaya: { src: Himalaya, label: 'Himalaya' },
};

export const availableAssetKeys = Object.keys(availableProductAssets);

export default availableProductAssets;
