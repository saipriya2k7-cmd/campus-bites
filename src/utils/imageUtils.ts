import { Category, DietaryType } from '../types';

// Guaranteed reliable 200 OK Unsplash food photos mapped by category and dietary
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Snacks-veg': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'Snacks-egg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  'Snacks-non_veg': 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
  
  'South Indian-veg': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  'South Indian-egg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  'South Indian-non_veg': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',

  'Fast Food-veg': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
  'Fast Food-egg': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
  'Fast Food-non_veg': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken-kathi-roll-recipe.jpg',

  'Beverages-veg': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  
  // Distinct photos for meals: Veg Dum Biryani vs Chicken Biryani
  'Meals-veg': 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80',
  'Meals-egg': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  'Meals-non_veg': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',

  'Breakfast-veg': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  'Breakfast-egg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  'Breakfast-non_veg': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken-kathi-roll-recipe.jpg',

  'Desserts-veg': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
};

// Verified distinct authentic URLs for dishes
export const DISH_URLS = {
  gulabJamun: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
  chickenTikkaRoll: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chicken-kathi-roll-recipe.jpg',
  chickenBiryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  vegBiryani: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80',
  choleBhature: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
};

// Known broken or mismatched URLs from prior builds to actively heal
export const KNOWN_BROKEN_URLS: Record<string, string> = {
  // previous local relative assets that fail on GitHub Pages
  '/assets/gulab_jamun.jpg': DISH_URLS.gulabJamun,
  '/assets/smoked_chicken_tikka.jpg': DISH_URLS.chickenTikkaRoll,
  '/assets/chicken_biryani.jpg': DISH_URLS.chickenBiryani,
  '/assets/veg_biryani.jpg': DISH_URLS.vegBiryani,
  'assets/gulab_jamun.jpg': DISH_URLS.gulabJamun,
  'assets/smoked_chicken_tikka.jpg': DISH_URLS.chickenTikkaRoll,
  'assets/chicken_biryani.jpg': DISH_URLS.chickenBiryani,
  'assets/veg_biryani.jpg': DISH_URLS.vegBiryani,

  // previous chicken roll URLs mapped to authentic kathi roll photo
  'https://images.unsplash.com/photo-1625398407796-82650a8c135f': DISH_URLS.chickenTikkaRoll,
  'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80': DISH_URLS.chickenTikkaRoll,
  'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f': DISH_URLS.chickenTikkaRoll,
  // broken paneer roll -> working delicious kathi roll
  'https://images.unsplash.com/photo-1626777553635-be325e839556?auto=format&fit=crop&w=600&q=80': 
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  // broken peri peri fries -> working crisp golden fries
  'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80':
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
  // mismatched fish photo mapped to gulab jamun -> authentic warm gulab jamun
  'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80': DISH_URLS.gulabJamun,
  'https://images.unsplash.com/photo-1601050690113-d49cb376e1a9?auto=format&fit=crop&w=600&q=80': DISH_URLS.gulabJamun
};

export function getFallbackImage(category: Category = 'Snacks', dietary: DietaryType = 'veg'): string {
  const key = `${category}-${dietary}`;
  return CATEGORY_FALLBACK_IMAGES[key] || CATEGORY_FALLBACK_IMAGES['default'];
}

export function sanitizeFoodImageUrl(
  url: string | undefined, 
  category: Category = 'Snacks', 
  dietary: DietaryType = 'veg',
  foodName?: string
): string {
  if (foodName) {
    const nameLower = foodName.toLowerCase();
    if (nameLower.includes('jamun') || nameLower.includes('gulab')) {
      return DISH_URLS.gulabJamun;
    }
    if (nameLower.includes('smoked chicken') || (nameLower.includes('chicken') && (nameLower.includes('tikka') || nameLower.includes('roll') || nameLower.includes('kathi')))) {
      return DISH_URLS.chickenTikkaRoll;
    }
    // Dedicated distinct photos for Veg Biryani vs Amritsari Chole vs Non-Veg Biryani
    if (nameLower.includes('chole') || nameLower.includes('bhature')) {
      return DISH_URLS.choleBhature;
    }
    if (nameLower.includes('biryani') || nameLower.includes('biriyani') || nameLower.includes('pulao')) {
      if (dietary === 'veg' || nameLower.includes('veg') || nameLower.includes('paneer') || nameLower.includes('soya')) {
        return DISH_URLS.vegBiryani;
      }
      return DISH_URLS.chickenBiryani;
    }
  }

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getFallbackImage(category, dietary);
  }
  
  // Clean fish photo if assigned to jamun or dessert
  if (url.includes('1599488615731')) {
    return DISH_URLS.gulabJamun;
  }

  // Active separation for Biryani photos: ensure Veg Biryani never uses Chicken Biryani or Chole Bhature photo
  if (dietary === 'veg' && (url.includes('1563379091339') || url.includes('chicken_biryani'))) {
    return DISH_URLS.vegBiryani;
  }
  if ((dietary === 'non_veg' || foodName?.toLowerCase().includes('chicken')) && (url.includes('1645177628172') || url.includes('veg_biryani'))) {
    return DISH_URLS.chickenBiryani;
  }

  // Heal local /assets paths that fail on GitHub Pages
  if (url.includes('gulab_jamun')) return DISH_URLS.gulabJamun;
  if (url.includes('smoked_chicken_tikka')) return DISH_URLS.chickenTikkaRoll;
  if (url.includes('chicken_biryani')) return DISH_URLS.chickenBiryani;
  if (url.includes('veg_biryani')) return DISH_URLS.vegBiryani;

  // Previous chicken roll URLs mapped to authentic photo
  if (url.includes('1625398407796') || url.includes('1627308595229')) {
    return DISH_URLS.chickenTikkaRoll;
  }

  // Check known broken URLs
  for (const [broken, fixed] of Object.entries(KNOWN_BROKEN_URLS)) {
    if (url.includes(broken) || broken.includes(url)) {
      return fixed;
    }
  }

  return url;
}

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category: Category = 'Snacks',
  dietary: DietaryType = 'veg'
) => {
  const target = e.currentTarget;
  const fallback = getFallbackImage(category, dietary);
  if (target.src !== fallback) {
    target.onerror = null; // prevent infinite loops
    target.src = fallback;
  }
};

