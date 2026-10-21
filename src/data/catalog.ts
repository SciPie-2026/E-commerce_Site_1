/**
 * AIDAH — Authentic Product Catalogue
 * Hand-finished designer wear from Aidah The Label / Aidah Designer House & Boutique.
 * Studio: Baani City Centre, Sector 63, Gurugram, India.
 */

import heroImg from "@/assets/hero-campaign.jpg";
import floralImg from "@/assets/category-floral.jpg";
import ethnicImg from "@/assets/category-ethnic.jpg";
import editorialImg from "@/assets/lookbook-editorial.jpg";
import logoImg from "@/assets/aidah-logo.jpg";

import seraphinaGown from "@/assets/catalog/seraphina-ice-gown.jpg";
import auroraSage from "@/assets/catalog/aurora-sage-coord.jpg";
import celesteBlue from "@/assets/catalog/celeste-powder-blue.jpg";
import marianaMustard from "@/assets/catalog/mariana-mustard-silk.jpg";
import valeriaCape from "@/assets/catalog/valeria-ice-cape.jpg";
import opheliaKaftan from "@/assets/catalog/ophelia-gold-kaftan.jpg";
import begumPurple from "@/assets/catalog/begum-purple-rawsilk.jpg";
import gulabiLehenga from "@/assets/catalog/gulabi-floral-lehenga.jpg";
import handloomIkat from "@/assets/catalog/handloom-ikat-weaves.jpg";
import camilleMaxi from "@/assets/catalog/camille-blush-maxi.jpg";
import linenGurugram from "@/assets/catalog/luxury-linen-gurugram.jpg";
import ivoryHighTea from "@/assets/catalog/ivory-hightea-kaftan.jpg";
import atelierFlatlay from "@/assets/catalog/atelier-flatlay-kurta.jpg";

export { logoImg, heroImg, floralImg, ethnicImg, editorialImg };

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  fabric: string;
  occasion: string;
  categorySlugs: string[];
  badge?: "New" | "Sale" | "Bestseller" | "Limited Edition";
  rating: number;
  reviewCount: number;
  description: string;
  care: string;
  fit: string;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image?: string;
};

export const collections: Collection[] = [
  {
    slug: "ethnic-wear",
    name: "Ethnic Wear",
    tagline: "Hand-finished Indian craft",
    description: "Lehengas, anarkalis and celebratory kurta sets worked with zari, gota patti and resham by our karigar partners.",
    image: ethnicImg,
  },
  {
    slug: "co-ord-sets",
    name: "Co-ord Sets",
    tagline: "Effortless luxury pairs",
    description: "Matching two-piece ensembles in textured silk, organic linen and artisanal handloom weaves — one decision, endless polish.",
    image: auroraSage,
  },
  {
    slug: "evening-wear",
    name: "Evening & Gowns",
    tagline: "Quietly dramatic",
    description: "Pre-draped saree gowns, metallic jacquards and liquid silks for galas, receptions and red-carpet moments.",
    image: seraphinaGown,
  },
  {
    slug: "party-wear",
    name: "Party Wear & Capes",
    tagline: "Dressed for celebration",
    description: "Draped dhoti skirts, crystal-fringed bustiers and floor-length sheer embroidered cape jackets.",
    image: valeriaCape,
  },
  {
    slug: "floral-dresses",
    name: "Floral & Resort",
    tagline: "Petals, printed and embroidered",
    description: "Hand-drawn blooms across mulmul, organza and silk crepe for sunlit afternoons and resort getaways.",
    image: camilleMaxi,
  },
  {
    slug: "wedding-guest",
    name: "Wedding Guest",
    tagline: "For every celebration on the card",
    description: "Festive-but-considered looks for mehendis, sangeets and weddings — radiant, refined and memorable.",
    image: begumPurple,
  },
  {
    slug: "casual-dresses",
    name: "Casual Dresses",
    tagline: "Everyday ease, softly tailored",
    description: "Light, wearable dresses cut in breathable natural fabrics with an effortless, romantic finish.",
    image: floralImg,
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    tagline: "Fresh from the Gurugram atelier",
    description: "The newest styles from our studio at Baani City Centre, Sector 63, Gurugram — restocked weekly.",
    image: atelierFlatlay,
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    tagline: "Loved by our patrons",
    description: "The timeless pieces our community cherishes season after season.",
    image: gulabiLehenga,
  },
  {
    slug: "sale",
    name: "Curated Sale",
    tagline: "Archival favourites at gentle prices",
    description: "Selected styles from previous drops, lovingly crafted and available while stocks last.",
    image: linenGurugram,
  },
  {
    slug: "seasonal-collections",
    name: "The Ivory Hour",
    tagline: "Our festive capsule edit",
    description: "Champagne golds, blush organzas and candlelight shimmer made for evenings that run long.",
    image: opheliaKaftan,
  },
];

const XS_XL = ["XS", "S", "M", "L", "XL"];

export const products: Product[] = [
  {
    id: "p1",
    slug: "gulabi-bagh-embroidered-lehenga",
    name: "Gulabi Bagh Embroidered Lehenga Set",
    sku: "AID-LEH-001",
    price: 18499,
    images: [gulabiLehenga, ethnicImg],
    categorySlugs: ["ethnic-wear", "wedding-guest", "seasonal-collections", "best-sellers"],
    colors: [
      { name: "Blush Rose", hex: "#D99BAA" },
      { name: "Ivory Gold", hex: "#FFF9F4" },
    ],
    sizes: XS_XL,
    stock: { XS: 3, S: 5, M: 6, L: 4, XL: 2 },
    fabric: "Fine Silk Organza with Multicolor Resham & Sequin Craft",
    occasion: "Wedding / Sangeet",
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 94,
    description: "A dream in motion — voluminous twirling kalidar lehenga scattered with heritage floral motifs, paired with a sweetheart neckline blouse and a diaphanous organza dupatta edged in playful handcrafted tassels.",
    care: "Dry clean only. Store wrapped in muslin cloth.",
    fit: "Fitted bustier blouse with full flare twirl skirt; true to size.",
  },
  {
    id: "p2",
    slug: "noor-peach-organza-kurta-set",
    name: "Noor Peach Organza Kurta Set",
    sku: "AID-KRT-002",
    price: 8999,
    images: [atelierFlatlay, heroImg],
    categorySlugs: ["ethnic-wear", "new-arrivals", "seasonal-collections"],
    colors: [
      { name: "Peach Coral", hex: "#E8B298" },
      { name: "Ivory", hex: "#FFF9F4" },
    ],
    sizes: XS_XL,
    stock: { XS: 4, S: 7, M: 8, L: 5, XL: 3 },
    fabric: "Pure Silk Organza with Delicate Chikankari Threadwork",
    occasion: "Festive Daywear",
    badge: "New",
    rating: 4.8,
    reviewCount: 52,
    description: "Hand-finished at our Gurugram atelier — pure peach organza kurta detailed with intricate white chikankari floral neck embroidery, styled with a gossamer lace-bordered dupatta and straight trousers.",
    care: "Dry clean or gentle hand wash cold. Dry in shade.",
    fit: "Classic straight silhouette; true to size.",
  },
  {
    id: "p3",
    slug: "seraphina-draped-saree-gown",
    name: "Seraphina Draped Saree Gown",
    sku: "AID-GWN-003",
    price: 14999,
    images: [seraphinaGown],
    categorySlugs: ["evening-wear", "party-wear", "wedding-guest", "new-arrivals"],
    colors: [
      { name: "Ice Silver", hex: "#BAC7D5" },
      { name: "Slate Grey", hex: "#7E8B99" },
    ],
    sizes: XS_XL,
    stock: { XS: 2, S: 4, M: 5, L: 3, XL: 2 },
    fabric: "Textured Jacquard Silk with Crystal & Zari Borders",
    occasion: "Reception / Cocktail",
    badge: "New",
    rating: 4.9,
    reviewCount: 46,
    description: "Sculpted modern couture — pre-pleated draped saree gown cut from luxurious ice-silver jacquard silk, accentuated with an asymmetric crystal-encrusted border embroidery and sleek fitted sleeves.",
    care: "Dry clean only.",
    fit: "Fitted waist with pre-stitched flowing drape; true to size.",
  },
  {
    id: "p4",
    slug: "valeria-draped-dhoti-cape-set",
    name: "Valeria Draped Dhoti & Lace Cape Set",
    sku: "AID-CAP-004",
    price: 13499,
    images: [valeriaCape, editorialImg],
    categorySlugs: ["party-wear", "evening-wear", "seasonal-collections"],
    colors: [
      { name: "Crystal Mist", hex: "#D4E6F1" },
      { name: "Blush", hex: "#F4DDE3" },
    ],
    sizes: XS_XL,
    stock: { XS: 3, S: 6, M: 5, L: 4, XL: 1 },
    fabric: "Liquid Satin Crepe with Hand-Embroidered Sheer Lace",
    occasion: "Cocktail / Mehendi",
    badge: "Limited Edition",
    rating: 4.8,
    reviewCount: 68,
    description: "Statement party silhouette — pre-draped liquid satin dhoti skirt paired with a crystal bead-fringed sweetheart bustier and a floor-sweeping sheer embroidered lace cape jacket.",
    care: "Dry clean only. Steam gently.",
    fit: "Structured cropped bustier with relaxed draped dhoti skirt.",
  },
  {
    id: "p5",
    slug: "aurora-sage-silk-coord-set",
    name: "Aurora Sage Textured Silk Co-ord Set",
    sku: "AID-CRD-005",
    price: 6499,
    images: [auroraSage],
    categorySlugs: ["co-ord-sets", "best-sellers"],
    colors: [
      { name: "Sage Grey", hex: "#8A9A86" },
      { name: "Muted Olive", hex: "#707B64" },
    ],
    sizes: XS_XL,
    stock: { XS: 5, S: 8, M: 9, L: 6, XL: 4 },
    fabric: "Textured Tussar Silk with Wine Geometric Threadwork",
    occasion: "Day Soirée / Luncheon",
    badge: "Bestseller",
    rating: 4.8,
    reviewCount: 118,
    description: "Understated luxury for intimate gatherings — softly tailored long-line tunic in textured sage silk with contrast wine-red geometric embroidery on the cuffs and V-neckline, paired with matching cigarette trousers.",
    care: "Machine wash cold on gentle cycle or dry clean.",
    fit: "Relaxed silhouette; true to size.",
  },
  {
    id: "p6",
    slug: "begum-jamuni-zari-anarkali-set",
    name: "Begum Jamuni Zari Anarkali Set",
    sku: "AID-ETH-006",
    price: 11999,
    images: [begumPurple],
    categorySlugs: ["ethnic-wear", "wedding-guest", "new-arrivals"],
    colors: [
      { name: "Royal Jamuni", hex: "#4B2E58" },
      { name: "Deep Plum", hex: "#381E43" },
    ],
    sizes: XS_XL,
    stock: { XS: 2, S: 5, M: 5, L: 3, XL: 2 },
    fabric: "Handwoven Raw Silk with Antique Silver Zari Booti",
    occasion: "Wedding / Sangeet",
    badge: "New",
    rating: 4.9,
    reviewCount: 39,
    description: "Timeless royal heirloom — deep violet raw silk angrakha-cut anarkali kurta embellished with shimmering silver zari booti work, paired with a silver border-edged palazzo and dupatta.",
    care: "Dry clean only.",
    fit: "A-line flared kurta; true to size.",
  },
  {
    id: "p7",
    slug: "camille-tiered-resort-maxi-dress",
    name: "Camille Tiered Resort Maxi Dress",
    sku: "AID-DRS-007",
    price: 4999,
    images: [camilleMaxi, floralImg],
    categorySlugs: ["floral-dresses", "casual-dresses", "best-sellers"],
    colors: [
      { name: "Blush Rose", hex: "#D99BAA" },
      { name: "Vanilla Cream", hex: "#FFF8F0" },
    ],
    sizes: XS_XL,
    stock: { XS: 6, S: 10, M: 12, L: 8, XL: 4 },
    fabric: "Mulmul Cotton & Silk Crepe with Shadow Stripes",
    occasion: "Resort / Vacation",
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 142,
    description: "Romantic and breezy — tiered sunlit maxi dress with balloon sleeves, an open V-neckline, and subtle floral shadow stripes crafted for slow vacations and seaside getaways.",
    care: "Gentle machine wash cold. Line dry in shade.",
    fit: "Fluid, tiered drape; true to size.",
  },
  {
    id: "p8",
    slug: "ophelia-gold-jacquard-kaftan-gown",
    name: "Ophelia Gold Jacquard Kaftan Gown",
    sku: "AID-KFT-008",
    price: 10499,
    images: [opheliaKaftan],
    categorySlugs: ["evening-wear", "party-wear", "seasonal-collections"],
    colors: [
      { name: "Champagne Gold", hex: "#C8A56A" },
      { name: "Rose Quartz", hex: "#E8C4CD" },
    ],
    sizes: XS_XL,
    stock: { XS: 3, S: 4, M: 5, L: 3, XL: 2 },
    fabric: "Woven Gold Brocade Jacquard with Pearl-Beaded Tassels",
    occasion: "Festive Evening",
    badge: "Limited Edition",
    rating: 4.7,
    reviewCount: 31,
    description: "Majestic floor-sweeping silhouette — woven gold jacquard kaftan with an intricately embroidered rose-pink yoke, pearl-bead tassel fringe on bell sleeves, and dramatic side slits.",
    care: "Dry clean only.",
    fit: "Graceful relaxed kaftan cut; fits XS through XL comfortably.",
  },
  {
    id: "p9",
    slug: "celeste-embroidered-chanderi-suit",
    name: "Celeste Embroidered Chanderi Kurta Set",
    sku: "AID-ETH-009",
    price: 7999,
    images: [celesteBlue],
    categorySlugs: ["ethnic-wear", "new-arrivals", "wedding-guest"],
    colors: [
      { name: "Powder Blue", hex: "#A8C3D8" },
      { name: "Misty Silver", hex: "#D6DEE5" },
    ],
    sizes: XS_XL,
    stock: { XS: 4, S: 6, M: 7, L: 5, XL: 3 },
    fabric: "Fine Chanderi Silk with Cutwork Lace & Resham Borders",
    occasion: "Festive Soirée",
    badge: "New",
    rating: 4.8,
    reviewCount: 44,
    description: "Serene and refined — straight-cut chanderi tunic with mandarin collar and delicate tone-on-tone resham embroidery, paired with cigarette trousers and an artisanal scalloped cutwork dupatta.",
    care: "Dry clean recommended.",
    fit: "Tailored straight fit; true to size.",
  },
  {
    id: "p10",
    slug: "mariana-mustard-rani-silk-set",
    name: "Mariana Mustard & Rani Silk Kalidar Set",
    sku: "AID-ETH-010",
    price: 5999,
    compareAtPrice: 7499,
    images: [marianaMustard],
    categorySlugs: ["ethnic-wear", "seasonal-collections", "sale"],
    colors: [
      { name: "Golden Mustard", hex: "#D49826" },
      { name: "Rani Pink", hex: "#C71585" },
    ],
    sizes: XS_XL,
    stock: { XS: 3, S: 4, M: 5, L: 3, XL: 1 },
    fabric: "Pure Raw Silk with Contrast Colorblock Borders",
    occasion: "Mehendi / Haldi",
    badge: "Sale",
    rating: 4.7,
    reviewCount: 63,
    description: "Vibrant celebratory palette — lustrous golden-mustard raw silk A-line kurta featuring bold rani-pink and tangerine contrast hem accents, finished with matching flared palazzo pants.",
    care: "Dry clean only.",
    fit: "Relaxed A-line; true to size.",
  },
  {
    id: "p11",
    slug: "aadila-hightea-draped-tulip-set",
    name: "Aadila High-Tea Draped Tulip Set",
    sku: "AID-PRT-011",
    price: 9499,
    images: [ivoryHighTea],
    categorySlugs: ["party-wear", "co-ord-sets", "seasonal-collections"],
    colors: [
      { name: "Pure Ivory", hex: "#FFFDF9" },
      { name: "Fuchsia", hex: "#D91B5C" },
    ],
    sizes: XS_XL,
    stock: { XS: 3, S: 5, M: 4, L: 3, XL: 2 },
    fabric: "Pure Silk Georgette with Fuchsia Floral Appliqué",
    occasion: "High Tea / Reception",
    badge: "New",
    rating: 4.8,
    reviewCount: 29,
    description: "Chic luxury — high-low cape poncho in pure ivory georgette with hand-embroidered fuchsia floral borders, paired with a draped satin tulip skirt designed for garden afternoon tea.",
    care: "Dry clean only.",
    fit: "Flowing cape overlay with draped wrap tulip skirt.",
  },
  {
    id: "p12",
    slug: "gurugram-luxury-linen-coord",
    name: "The Gurugram Atelier Pure Linen Co-ord",
    sku: "AID-CRD-012",
    price: 4499,
    compareAtPrice: 5999,
    images: [linenGurugram, handloomIkat],
    categorySlugs: ["co-ord-sets", "casual-dresses", "sale"],
    colors: [
      { name: "Earthy Terracotta", hex: "#B85D3B" },
      { name: "Flax Natural", hex: "#D6C7B2" },
      { name: "Forest Olive", hex: "#4A5D43" },
    ],
    sizes: XS_XL,
    stock: { XS: 5, S: 7, M: 8, L: 5, XL: 4 },
    fabric: "100% Certified European Flax Linen",
    occasion: "Everyday Luxury",
    badge: "Sale",
    rating: 4.9,
    reviewCount: 88,
    description: "Tailored directly from the hand-curated fabric rolls at our Baani City Centre boutique in Gurugram — breathable, sustainable pure linen cut for effortless all-day polish.",
    care: "Machine wash gentle cold. Iron slightly damp.",
    fit: "Relaxed tailored fit.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const productsInCollection = (slug: string) => {
  if (slug === "new-arrivals") return products.filter((p) => p.badge === "New");
  if (slug === "best-sellers") return products.filter((p) => p.badge === "Bestseller" || p.rating >= 4.8);
  if (slug === "sale") return products.filter((p) => p.compareAtPrice);
  return products.filter((p) => p.categorySlugs.includes(slug));
};

export const allFabrics = [...new Set(products.map((p) => p.fabric))];
export const allOccasions = [...new Set(products.map((p) => p.occasion))];
export const allSizes = XS_XL;
export const allColors: ProductColor[] = [
  { name: "Peach Coral", hex: "#E8B298" },
  { name: "Blush Rose", hex: "#D99BAA" },
  { name: "Ice Silver", hex: "#BAC7D5" },
  { name: "Crystal Mist", hex: "#D4E6F1" },
  { name: "Sage Grey", hex: "#8A9A86" },
  { name: "Powder Blue", hex: "#A8C3D8" },
  { name: "Royal Jamuni", hex: "#4B2E58" },
  { name: "Golden Mustard", hex: "#D49826" },
  { name: "Champagne Gold", hex: "#C8A56A" },
  { name: "Pure Ivory", hex: "#FFFDF9" },
  { name: "Earthy Terracotta", hex: "#B85D3B" },
];
