const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Comprehensive translation keys for the entire OnsiShop application
const allTranslations = [
  // =================
  // AUTHENTICATION
  // =================
  { key: 'auth_sign_in', fr: 'Se Connecter', en: 'Sign In', ar: 'تسجيل الدخول' },
  { key: 'auth_create_account', fr: 'Créer un Compte', en: 'Create Account', ar: 'إنشاء حساب' },
  { key: 'auth_email_address', fr: 'Adresse e-mail', en: 'Email address', ar: 'عنوان البريد الإلكتروني' },
  { key: 'auth_password', fr: 'Mot de passe', en: 'Password', ar: 'كلمة المرور' },
  { key: 'auth_confirm_password', fr: 'Confirmer le mot de passe', en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  { key: 'auth_signing_in', fr: 'Connexion...', en: 'Signing in...', ar: 'جاري تسجيل الدخول...' },
  { key: 'auth_creating_account', fr: 'Création du compte...', en: 'Creating account...', ar: 'جاري إنشاء الحساب...' },
  { key: 'auth_create_new_account', fr: 'créer un nouveau compte', en: 'create a new account', ar: 'إنشاء حساب جديد' },
  { key: 'auth_sign_existing_account', fr: 'se connecter au compte existant', en: 'sign in to existing account', ar: 'تسجيل الدخول للحساب الموجود' },
  { key: 'auth_demo_credentials', fr: 'Identifiants de démonstration :', en: 'Demo Credentials:', ar: 'بيانات اعتماد التجريب:' },
  { key: 'auth_admin', fr: 'Administrateur', en: 'Admin', ar: 'مدير' },
  { key: 'auth_user', fr: 'Utilisateur', en: 'User', ar: 'مستخدم' },
  { key: 'auth_back_to_store', fr: '← Retour au magasin', en: '← Back to store', ar: '← العودة للمتجر' },
  { key: 'auth_continue_checkout', fr: 'Veuillez vous connecter pour continuer vers le paiement', en: 'Please sign in to continue to checkout', ar: 'يرجى تسجيل الدخول للمتابعة للدفع' },
  { key: 'auth_continue_checkout_register', fr: 'Créez un compte pour continuer vers le paiement', en: 'Create an account to continue to checkout', ar: 'قم بإنشاء حساب للمتابعة للدفع' },
  { key: 'auth_password_min_chars', fr: 'Mot de passe (min 6 caractères)', en: 'Password (min 6 characters)', ar: 'كلمة المرور (6 أحرف على الأقل)' },
  { key: 'auth_confirm_password_placeholder', fr: 'Confirmer le mot de passe', en: 'Confirm password', ar: 'تأكيد كلمة المرور' },
  { key: 'auth_passwords_not_match', fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' },
  { key: 'auth_password_min_length', fr: 'Le mot de passe doit contenir au moins 6 caractères', en: 'Password must be at least 6 characters long', ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' },
  { key: 'auth_network_error', fr: 'Erreur réseau. Veuillez réessayer.', en: 'Network error. Please try again.', ar: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' },

  // =================
  // PRODUCTS & CART
  // =================
  { key: 'product_quantity', fr: 'Quantité :', en: 'Quantity:', ar: 'الكمية:' },
  { key: 'product_available', fr: 'disponible', en: 'available', ar: 'متوفر' },
  { key: 'product_out_of_stock', fr: 'Rupture de stock', en: 'Out of Stock', ar: 'نفدت الكمية' },
  { key: 'product_adding', fr: 'Ajout...', en: 'Adding...', ar: 'جاري الإضافة...' },
  { key: 'product_add_to_cart', fr: 'Ajouter au panier', en: 'Add to Cart', ar: 'إضافة للسلة' },
  { key: 'product_added_to_cart', fr: '✓ Ajouté au panier !', en: '✓ Added to Cart!', ar: '✓ تمت الإضافة للسلة!' },
  { key: 'product_only_left', fr: 'Il ne reste que', en: 'Only', ar: 'يتبقى فقط' },
  { key: 'product_in_stock', fr: 'en stock !', en: 'left in stock!', ar: 'في المخزون!' },
  { key: 'product_related', fr: 'Produits associés', en: 'Related Products', ar: 'منتجات ذات صلة' },
  { key: 'product_you_might_like', fr: 'Vous pourriez aussi aimer', en: 'You might also like', ar: 'قد تعجبك أيضاً' },
  { key: 'product_view_details', fr: 'Voir les détails', en: 'View Details', ar: 'عرض التفاصيل' },
  { key: 'product_quick_view', fr: 'Aperçu rapide', en: 'Quick View', ar: 'عرض سريع' },

  // =================
  // SEARCH & FILTERS
  // =================
  { key: 'search_showing_results', fr: 'Affichage de', en: 'Showing', ar: 'عرض' },
  { key: 'search_results_for', fr: 'résultats pour', en: 'results for', ar: 'نتائج للبحث عن' },
  { key: 'search_result_for', fr: 'résultat pour', en: 'result for', ar: 'نتيجة للبحث عن' },
  { key: 'search_no_products', fr: 'Aucun produit ne correspond à', en: 'There are no products that match', ar: 'لا توجد منتجات تطابق' },
  { key: 'search_sort_by', fr: 'Trier par', en: 'Sort by', ar: 'ترتيب حسب' },
  { key: 'search_filter_by', fr: 'Filtrer par', en: 'Filter by', ar: 'تصفية حسب' },
  { key: 'search_all_products', fr: 'Tous les produits', en: 'All Products', ar: 'جميع المنتجات' },
  { key: 'search_clear_filters', fr: 'Effacer les filtres', en: 'Clear Filters', ar: 'مسح المرشحات' },
  { key: 'search_apply_filters', fr: 'Appliquer les filtres', en: 'Apply Filters', ar: 'تطبيق المرشحات' },

  // =================
  // SORTING OPTIONS
  // =================
  { key: 'sort_relevance', fr: 'Pertinence', en: 'Relevance', ar: 'الصلة' },
  { key: 'sort_trending', fr: 'Tendances', en: 'Trending', ar: 'الشائع' },
  { key: 'sort_latest', fr: 'Plus récents', en: 'Latest arrivals', ar: 'الأحدث وصولاً' },
  { key: 'sort_price_low_high', fr: 'Prix : croissant', en: 'Price: Low to high', ar: 'السعر: من الأقل للأعلى' },
  { key: 'sort_price_high_low', fr: 'Prix : décroissant', en: 'Price: High to low', ar: 'السعر: من الأعلى للأقل' },

  // =================
  // CART & CHECKOUT
  // =================
  { key: 'cart_title', fr: 'Votre panier', en: 'Your Cart', ar: 'سلة التسوق' },
  { key: 'cart_empty', fr: 'Votre panier est vide', en: 'Your cart is empty', ar: 'سلة التسوق فارغة' },
  { key: 'cart_continue_shopping', fr: 'Continuer les achats', en: 'Continue Shopping', ar: 'متابعة التسوق' },
  { key: 'cart_subtotal', fr: 'Sous-total', en: 'Subtotal', ar: 'المجموع الفرعي' },
  { key: 'cart_shipping', fr: 'Livraison', en: 'Shipping', ar: 'الشحن' },
  { key: 'cart_tax', fr: 'Taxes', en: 'Tax', ar: 'الضريبة' },
  { key: 'cart_total', fr: 'Total', en: 'Total', ar: 'المجموع' },
  { key: 'cart_checkout', fr: 'Finaliser la commande', en: 'Checkout', ar: 'إتمام الطلب' },
  { key: 'cart_update', fr: 'Mettre à jour', en: 'Update', ar: 'تحديث' },
  { key: 'cart_remove', fr: 'Supprimer', en: 'Remove', ar: 'إزالة' },
  { key: 'cart_item_removed', fr: 'Article supprimé du panier', en: 'Item removed from cart', ar: 'تم حذف العنصر من السلة' },
  { key: 'cart_item_updated', fr: 'Panier mis à jour', en: 'Cart updated', ar: 'تم تحديث السلة' },

  // =================
  // CHECKOUT PROCESS
  // =================
  { key: 'checkout_title', fr: 'Finaliser la commande', en: 'Checkout', ar: 'إتمام الطلب' },
  { key: 'checkout_shipping_info', fr: 'Informations de livraison', en: 'Shipping Information', ar: 'معلومات الشحن' },
  { key: 'checkout_payment_info', fr: 'Informations de paiement', en: 'Payment Information', ar: 'معلومات الدفع' },
  { key: 'checkout_order_summary', fr: 'Résumé de la commande', en: 'Order Summary', ar: 'ملخص الطلب' },
  { key: 'checkout_place_order', fr: 'Passer la commande', en: 'Place Order', ar: 'تأكيد الطلب' },
  { key: 'checkout_processing', fr: 'Traitement...', en: 'Processing...', ar: 'جاري المعالجة...' },
  { key: 'checkout_first_name', fr: 'Prénom', en: 'First Name', ar: 'الاسم الأول' },
  { key: 'checkout_last_name', fr: 'Nom de famille', en: 'Last Name', ar: 'اسم العائلة' },
  { key: 'checkout_address', fr: 'Adresse', en: 'Address', ar: 'العنوان' },
  { key: 'checkout_city', fr: 'Ville', en: 'City', ar: 'المدينة' },
  { key: 'checkout_postal_code', fr: 'Code postal', en: 'Postal Code', ar: 'الرمز البريدي' },
  { key: 'checkout_country', fr: 'Pays', en: 'Country', ar: 'البلد' },
  { key: 'checkout_phone', fr: 'Téléphone', en: 'Phone', ar: 'رقم الهاتف' },

  // =================
  // NAVIGATION & MENU
  // =================
  { key: 'nav_home', fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
  { key: 'nav_shop', fr: 'Boutique', en: 'Shop', ar: 'تسوق' },
  { key: 'nav_products', fr: 'Produits', en: 'Products', ar: 'المنتجات' },
  { key: 'nav_categories', fr: 'Catégories', en: 'Categories', ar: 'الفئات' },
  { key: 'nav_cart', fr: 'Panier', en: 'Cart', ar: 'السلة' },
  { key: 'nav_account', fr: 'Compte', en: 'Account', ar: 'الحساب' },
  { key: 'nav_login', fr: 'Se connecter', en: 'Login', ar: 'تسجيل الدخول' },
  { key: 'nav_register', fr: 'S\'inscrire', en: 'Register', ar: 'التسجيل' },
  { key: 'nav_logout', fr: 'Se déconnecter', en: 'Logout', ar: 'تسجيل الخروج' },
  { key: 'nav_orders', fr: 'Mes commandes', en: 'My Orders', ar: 'طلباتي' },
  { key: 'nav_wishlist', fr: 'Liste de souhaits', en: 'Wishlist', ar: 'قائمة الأمنيات' },
  { key: 'nav_profile', fr: 'Profil', en: 'Profile', ar: 'الملف الشخصي' },

  // =================
  // COMMON UI ELEMENTS
  // =================
  { key: 'common_loading', fr: 'Chargement...', en: 'Loading...', ar: 'جاري التحميل...' },
  { key: 'common_save', fr: 'Enregistrer', en: 'Save', ar: 'حفظ' },
  { key: 'common_cancel', fr: 'Annuler', en: 'Cancel', ar: 'إلغاء' },
  { key: 'common_delete', fr: 'Supprimer', en: 'Delete', ar: 'حذف' },
  { key: 'common_edit', fr: 'Modifier', en: 'Edit', ar: 'تعديل' },
  { key: 'common_add', fr: 'Ajouter', en: 'Add', ar: 'إضافة' },
  { key: 'common_view', fr: 'Voir', en: 'View', ar: 'عرض' },
  { key: 'common_close', fr: 'Fermer', en: 'Close', ar: 'إغلاق' },
  { key: 'common_open', fr: 'Ouvrir', en: 'Open', ar: 'فتح' },
  { key: 'common_submit', fr: 'Soumettre', en: 'Submit', ar: 'إرسال' },
  { key: 'common_search', fr: 'Rechercher', en: 'Search', ar: 'بحث' },
  { key: 'common_filter', fr: 'Filtrer', en: 'Filter', ar: 'تصفية' },
  { key: 'common_reset', fr: 'Réinitialiser', en: 'Reset', ar: 'إعادة تعيين' },
  { key: 'common_confirm', fr: 'Confirmer', en: 'Confirm', ar: 'تأكيد' },
  { key: 'common_error', fr: 'Erreur', en: 'Error', ar: 'خطأ' },
  { key: 'common_success', fr: 'Succès', en: 'Success', ar: 'نجح' },
  { key: 'common_warning', fr: 'Avertissement', en: 'Warning', ar: 'تحذير' },
  { key: 'common_info', fr: 'Information', en: 'Info', ar: 'معلومات' },
  { key: 'common_yes', fr: 'Oui', en: 'Yes', ar: 'نعم' },
  { key: 'common_no', fr: 'Non', en: 'No', ar: 'لا' },
  { key: 'common_next', fr: 'Suivant', en: 'Next', ar: 'التالي' },
  { key: 'common_previous', fr: 'Précédent', en: 'Previous', ar: 'السابق' },
  { key: 'common_back', fr: 'Retour', en: 'Back', ar: 'رجوع' },
  { key: 'common_continue', fr: 'Continuer', en: 'Continue', ar: 'متابعة' },

  // =================
  // SECTIONS & PAGES
  // =================
  { key: 'section_best_sellers', fr: 'Meilleures ventes', en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
  { key: 'section_new_arrivals', fr: 'Nouveautés', en: 'New Arrivals', ar: 'وصل حديثاً' },
  { key: 'section_featured', fr: 'Produits vedettes', en: 'Featured Products', ar: 'المنتجات المميزة' },
  { key: 'section_trending', fr: 'Tendances', en: 'Trending Now', ar: 'الشائع الآن' },
  { key: 'section_sale', fr: 'En solde', en: 'On Sale', ar: 'في التخفيضات' },
  { key: 'section_about_us', fr: 'À propos de nous', en: 'About Us', ar: 'معلومات عنا' },
  { key: 'section_contact', fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
  { key: 'section_faq', fr: 'FAQ', en: 'FAQ', ar: 'الأسئلة الشائعة' },
  { key: 'section_terms', fr: 'Conditions d\'utilisation', en: 'Terms of Service', ar: 'شروط الخدمة' },
  { key: 'section_privacy', fr: 'Politique de confidentialité', en: 'Privacy Policy', ar: 'سياسة الخصوصية' },

  // =================
  // PROMOTIONAL
  // =================
  { key: 'promo_free_shipping', fr: 'LIVRAISON GRATUITE sur toutes les commandes supérieures à ¥20000', en: 'FREE SHIPPING on all orders above ¥20000', ar: 'شحن مجاني على جميع الطلبات فوق ¥20000' },
  { key: 'promo_limited_time', fr: 'Offre limitée', en: 'Limited Time Offer', ar: 'عرض لفترة محدودة' },
  { key: 'promo_sale', fr: 'SOLDES', en: 'SALE', ar: 'تخفيضات' },
  { key: 'promo_discount', fr: 'Réduction', en: 'Discount', ar: 'خصم' },
  { key: 'promo_off', fr: 'de réduction', en: 'off', ar: 'خصم' },

  // =================
  // BUTTONS & ACTIONS
  // =================
  { key: 'button_view_more', fr: 'Voir plus', en: 'View More', ar: 'عرض المزيد' },
  { key: 'button_view_all', fr: 'Voir tout', en: 'View All', ar: 'عرض الكل' },
  { key: 'button_view_collection', fr: 'Voir la collection', en: 'View Collection', ar: 'عرض المجموعة' },
  { key: 'button_shop_now', fr: 'Acheter maintenant', en: 'Shop Now', ar: 'تسوق الآن' },
  { key: 'button_learn_more', fr: 'En savoir plus', en: 'Learn More', ar: 'اعرف المزيد' },
  { key: 'button_get_started', fr: 'Commencer', en: 'Get Started', ar: 'ابدأ' },
  { key: 'button_contact_us', fr: 'Nous contacter', en: 'Contact Us', ar: 'اتصل بنا' },

  // =================
  // ADMIN INTERFACE
  // =================
  { key: 'admin_dashboard', fr: 'Tableau de bord', en: 'Dashboard', ar: 'لوحة التحكم' },
  { key: 'admin_total_products', fr: 'Total produits', en: 'Total Products', ar: 'إجمالي المنتجات' },
  { key: 'admin_total_categories', fr: 'Total catégories', en: 'Total Categories', ar: 'إجمالي الفئات' },
  { key: 'admin_content_items', fr: 'Éléments de contenu', en: 'Content Items', ar: 'عناصر المحتوى' },
  { key: 'admin_available_products', fr: 'Produits disponibles', en: 'Available Products', ar: 'المنتجات المتاحة' },
  { key: 'admin_translation_keys', fr: 'Clés de traduction', en: 'Translation Keys', ar: 'مفاتيح الترجمة' },
  { key: 'admin_quick_actions', fr: 'Actions rapides', en: 'Quick Actions', ar: 'الإجراءات السريعة' },
  { key: 'admin_recent_products', fr: 'Produits récents', en: 'Recent Products', ar: 'المنتجات الحديثة' },
  { key: 'admin_no_products_yet', fr: 'Aucun produit pour le moment. Créez votre premier produit pour commencer !', en: 'No products yet. Create your first product to get started!', ar: 'لا توجد منتجات حتى الآن. قم بإنشاء منتجك الأول للبدء!' },
  { key: 'admin_add_product', fr: 'Ajouter un produit', en: 'Add Product', ar: 'إضافة منتج' },
  { key: 'admin_add_category', fr: 'Ajouter une catégorie', en: 'Add Category', ar: 'إضافة فئة' },
  { key: 'admin_manage_content', fr: 'Gérer le contenu', en: 'Manage Content', ar: 'إدارة المحتوى' },
  { key: 'admin_manage_products', fr: 'Gérer les produits', en: 'Manage Products', ar: 'إدارة المنتجات' },
  { key: 'admin_manage_categories', fr: 'Gérer les catégories', en: 'Manage Categories', ar: 'إدارة الفئات' },
  { key: 'admin_manage_translations', fr: 'Gérer les traductions', en: 'Manage Translations', ar: 'إدارة الترجمات' },
  { key: 'admin_category', fr: 'Catégorie', en: 'Category', ar: 'الفئة' },
  { key: 'admin_status', fr: 'Statut', en: 'Status', ar: 'الحالة' },

  // =================
  // STATUS & STATES
  // =================
  { key: 'status_available', fr: 'Disponible', en: 'Available', ar: 'متوفر' },
  { key: 'status_unavailable', fr: 'Indisponible', en: 'Unavailable', ar: 'غير متوفر' },
  { key: 'status_active', fr: 'Actif', en: 'Active', ar: 'نشط' },
  { key: 'status_inactive', fr: 'Inactif', en: 'Inactive', ar: 'غير نشط' },
  { key: 'status_published', fr: 'Publié', en: 'Published', ar: 'منشور' },
  { key: 'status_draft', fr: 'Brouillon', en: 'Draft', ar: 'مسودة' },
  { key: 'status_pending', fr: 'En attente', en: 'Pending', ar: 'في الانتظار' },
  { key: 'status_processing', fr: 'En cours de traitement', en: 'Processing', ar: 'قيد المعالجة' },
  { key: 'status_completed', fr: 'Terminé', en: 'Completed', ar: 'مكتمل' },
  { key: 'status_cancelled', fr: 'Annulé', en: 'Cancelled', ar: 'ملغي' },

  // =================
  // FOOTER
  // =================
  { key: 'footer_about', fr: 'À propos', en: 'About', ar: 'حول' },
  { key: 'footer_contact', fr: 'Contact', en: 'Contact', ar: 'اتصال' },
  { key: 'footer_privacy', fr: 'Confidentialité', en: 'Privacy', ar: 'الخصوصية' },
  { key: 'footer_terms', fr: 'Conditions', en: 'Terms', ar: 'الشروط' },
  { key: 'footer_follow_us', fr: 'Suivez-nous', en: 'Follow Us', ar: 'تابعنا' },
  { key: 'footer_newsletter', fr: 'Newsletter', en: 'Newsletter', ar: 'النشرة الإخبارية' },
  { key: 'footer_subscribe', fr: 'S\'abonner', en: 'Subscribe', ar: 'اشتراك' },
  { key: 'footer_email_placeholder', fr: 'Votre adresse e-mail', en: 'Your email address', ar: 'عنوان بريدك الإلكتروني' },

  // =================
  // CATEGORIES (COMMON)
  // =================
  { key: 'category_clothing', fr: 'Vêtements', en: 'Clothing', ar: 'ملابس' },
  { key: 'category_shoes', fr: 'Chaussures', en: 'Shoes', ar: 'أحذية' },
  { key: 'category_bags', fr: 'Sacs', en: 'Bags', ar: 'حقائب' },
  { key: 'category_accessories', fr: 'Accessoires', en: 'Accessories', ar: 'إكسسوارات' },
  { key: 'category_jewelry', fr: 'Bijoux', en: 'Jewelry', ar: 'مجوهرات' },
  { key: 'category_watches', fr: 'Montres', en: 'Watches', ar: 'ساعات' },
  { key: 'category_electronics', fr: 'Électronique', en: 'Electronics', ar: 'إلكترونيات' },
  { key: 'category_home', fr: 'Maison', en: 'Home', ar: 'المنزل' },
  { key: 'category_beauty', fr: 'Beauté', en: 'Beauty', ar: 'جمال' },
  { key: 'category_sports', fr: 'Sport', en: 'Sports', ar: 'رياضة' },

  // =================
  // MESSAGES & NOTIFICATIONS
  // =================
  { key: 'msg_welcome', fr: 'Bienvenue dans notre boutique !', en: 'Welcome to our store!', ar: 'أهلاً بك في متجرنا!' },
  { key: 'msg_login_success', fr: 'Connexion réussie', en: 'Login successful', ar: 'تم تسجيل الدخول بنجاح' },
  { key: 'msg_logout_success', fr: 'Déconnexion réussie', en: 'Logout successful', ar: 'تم تسجيل الخروج بنجاح' },
  { key: 'msg_item_added_cart', fr: 'Article ajouté au panier', en: 'Item added to cart', ar: 'تمت إضافة العنصر للسلة' },
  { key: 'msg_order_placed', fr: 'Commande passée avec succès', en: 'Order placed successfully', ar: 'تم تقديم الطلب بنجاح' },
  { key: 'msg_error_occurred', fr: 'Une erreur s\'est produite', en: 'An error occurred', ar: 'حدث خطأ' },
  { key: 'msg_try_again', fr: 'Veuillez réessayer', en: 'Please try again', ar: 'يرجى المحاولة مرة أخرى' },
  { key: 'msg_no_items_found', fr: 'Aucun élément trouvé', en: 'No items found', ar: 'لا توجد عناصر' },
  { key: 'msg_page_not_found', fr: 'Page non trouvée', en: 'Page not found', ar: 'الصفحة غير موجودة' },
  { key: 'msg_loading_content', fr: 'Chargement du contenu...', en: 'Loading content...', ar: 'جاري تحميل المحتوى...' },
];

async function seedAllTranslations() {
  console.log('🌱 Seeding comprehensive translation system...');
  console.log(`📊 Total translation keys: ${allTranslations.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const translation of allTranslations) {
    try {
      for (const lang of ['fr', 'en', 'ar']) {
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO Translation (id, key, language, text, createdAt, updatedAt) 
          VALUES (lower(hex(randomblob(12))), ${translation.key}, ${lang}, ${translation[lang]}, datetime('now'), datetime('now'))
        `;
      }
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding translation: ${translation.key}`, error);
      errorCount++;
    }
  }
  
  console.log(`✅ Successfully seeded: ${successCount} translation keys`);
  if (errorCount > 0) {
    console.log(`❌ Failed to seed: ${errorCount} translation keys`);
  }
  console.log(`🌍 Total translations in database: ${successCount * 3} (French, English, Arabic)`);
}

seedAllTranslations()
  .then(() => {
    console.log('🎉 Comprehensive translation system seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding comprehensive translations:', error);
    process.exit(1);
  });
