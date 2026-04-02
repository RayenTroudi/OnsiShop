export interface SubCategory {
  handle: string;
  label: string;
}

export interface Category {
  handle: string;
  label: string;
  highlight?: boolean;
  subcategories?: SubCategory[];
}

/** SHEIN-mirrored women's category structure */
export const WOMEN_CATEGORIES: Category[] = [
  {
    handle: 'new-in',
    label: 'New In',
  },
  {
    handle: 'clothing',
    label: 'Clothing',
    subcategories: [
      { handle: 'dresses',    label: 'Dresses'         },
      { handle: 'tops',       label: 'Tops & Blouses'  },
      { handle: 'bottoms',    label: 'Bottoms'         },
      { handle: 'outerwear',  label: 'Outerwear'       },
      { handle: 'co-ords',    label: 'Co-ord Sets'     },
      { handle: 'activewear', label: 'Activewear'      },
      { handle: 'swimwear',   label: 'Swimwear'        },
      { handle: 'lingerie',   label: 'Lingerie'        },
    ],
  },
  {
    handle: 'shoes',
    label: 'Shoes',
  },
  {
    handle: 'bags',
    label: 'Bags',
  },
  {
    handle: 'accessories',
    label: 'Accessories',
  },
  {
    handle: 'beauty',
    label: 'Beauty',
  },
  {
    handle: 'sale',
    label: 'Sale',
    highlight: true,
  },
];

/** Flat list used for mobile accordion & SEO */
export const ALL_CATEGORIES: SubCategory[] = [
  { handle: 'new-in',     label: 'New In'        },
  { handle: 'dresses',    label: 'Dresses'       },
  { handle: 'tops',       label: 'Tops & Blouses'},
  { handle: 'bottoms',    label: 'Bottoms'       },
  { handle: 'outerwear',  label: 'Outerwear'     },
  { handle: 'co-ords',    label: 'Co-ord Sets'   },
  { handle: 'activewear', label: 'Activewear'    },
  { handle: 'swimwear',   label: 'Swimwear'      },
  { handle: 'shoes',      label: 'Shoes'         },
  { handle: 'bags',       label: 'Bags'          },
  { handle: 'accessories',label: 'Accessories'   },
  { handle: 'beauty',     label: 'Beauty'        },
  { handle: 'sale',       label: 'Sale'          },
];
