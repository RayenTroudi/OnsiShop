// Seed cart and product translations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cart and Product translation keys
const translations = [
  // Product translations
  {
    key: 'product_add_to_cart_error',
    fr: 'Échec de l\'ajout au panier. Veuillez réessayer.',
    en: 'Failed to add item to cart. Please try again.',
    ar: 'فشل في إضافة العنصر إلى السلة. يرجى المحاولة مرة أخرى.'
  },
  {
    key: 'product_quantity',
    fr: 'Quantité',
    en: 'Quantity',
    ar: 'الكمية'
  },
  {
    key: 'product_available',
    fr: 'disponible',
    en: 'available',
    ar: 'متوفر'
  },
  {
    key: 'product_out_of_stock',
    fr: 'En rupture de stock',
    en: 'Out of stock',
    ar: 'نفد من المخزن'
  },
  {
    key: 'product_adding_to_cart',
    fr: 'Ajout en cours...',
    en: 'Adding...',
    ar: 'جاري الإضافة...'
  },
  {
    key: 'product_added_to_cart',
    fr: 'Ajouté au panier !',
    en: 'Added to Cart!',
    ar: 'تم الإضافة إلى السلة!'
  },
  {
    key: 'product_add_to_cart',
    fr: 'Ajouter au panier',
    en: 'Add to Cart',
    ar: 'إضافة إلى السلة'
  },
  {
    key: 'product_only_left_in_stock',
    fr: 'Il ne reste que {stock} en stock !',
    en: 'Only {stock} left in stock!',
    ar: 'متبقي {stock} فقط في المخزن!'
  },

  // Search translations
  {
    key: 'search_results',
    fr: 'résultats',
    en: 'results',
    ar: 'نتائج'
  },
  {
    key: 'search_result',
    fr: 'résultat',
    en: 'result',
    ar: 'نتيجة'
  },
  {
    key: 'search_no_products_match',
    fr: 'Aucun produit ne correspond à',
    en: 'There are no products that match',
    ar: 'لا توجد منتجات تطابق'
  },
  {
    key: 'search_showing',
    fr: 'Affichage de',
    en: 'Showing',
    ar: 'عرض'
  },
  {
    key: 'search_for',
    fr: 'pour',
    en: 'for',
    ar: 'لـ'
  },
  {
    key: 'search_sort_by',
    fr: 'Trier par',
    en: 'Sort by',
    ar: 'ترتيب حسب'
  },

  // Cart translations
  {
    key: 'cart_loading',
    fr: 'Chargement du panier...',
    en: 'Loading cart...',
    ar: 'جاري تحميل السلة...'
  },
  {
    key: 'cart_title',
    fr: 'Panier d\'achat',
    en: 'Shopping Cart',
    ar: 'سلة التسوق'
  },
  {
    key: 'cart_empty',
    fr: 'Votre panier est vide',
    en: 'Your cart is empty',
    ar: 'سلتك فارغة'
  },
  {
    key: 'cart_continue_shopping',
    fr: 'Continuer les achats',
    en: 'Continue Shopping',
    ar: 'متابعة التسوق'
  },
  {
    key: 'cart_stock',
    fr: 'Stock',
    en: 'Stock',
    ar: 'المخزن'
  },
  {
    key: 'cart_available',
    fr: 'disponible',
    en: 'available',
    ar: 'متوفر'
  },
  {
    key: 'cart_total_items',
    fr: 'Total des articles',
    en: 'Total Items',
    ar: 'إجمالي العناصر'
  },
  {
    key: 'cart_total',
    fr: 'Total',
    en: 'Total',
    ar: 'المجموع'
  },
  {
    key: 'cart_login_to_checkout',
    fr: 'Se connecter pour passer commande',
    en: 'Login to Checkout',
    ar: 'تسجيل الدخول للدفع'
  },
  {
    key: 'cart_checkout',
    fr: 'Passer commande',
    en: 'Checkout',
    ar: 'الدفع'
  },

  // Common loading
  {
    key: 'common_loading',
    fr: 'Chargement...',
    en: 'Loading...',
    ar: 'جاري التحميل...'
  }
];

async function seedTranslations() {
  try {
    console.log('🌱 Seeding cart and product translations...');

    for (const translation of translations) {
      // Insert French translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'fr'
          }
        },
        update: {
          text: translation.fr
        },
        create: {
          key: translation.key,
          language: 'fr',
          text: translation.fr
        }
      });

      // Insert English translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'en'
          }
        },
        update: {
          text: translation.en
        },
        create: {
          key: translation.key,
          language: 'en',
          text: translation.en
        }
      });

      // Insert Arabic translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'ar'
          }
        },
        update: {
          text: translation.ar
        },
        create: {
          key: translation.key,
          language: 'ar',
          text: translation.ar
        }
      });
    }

    console.log(`✅ Successfully seeded: ${translations.length} translation keys`);
  } catch (error) {
    console.error('❌ Error seeding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTranslations();
