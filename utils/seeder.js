import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import Category from '../models/category.model.js';
import { Subcategory } from '../models/subcategory.model.js';
import Brand from '../models/brand.model.js';
import Product from '../models/product.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mongoUrl = (process.env.MONGO_URL || '').trim().replace(/;$/, '');

const products = JSON.parse(
  readFileSync(join(__dirname, 'dummyData/products.json'), 'utf-8')
);

const brandsFromFile = JSON.parse(
  readFileSync(join(__dirname, 'dummyData/brands.json'), 'utf-8')
);

const categoriesFromFile = JSON.parse(
  readFileSync(join(__dirname, 'dummyData/categories.json'), 'utf-8')
);

const seedCategoriesFromFile = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    await Category.bulkWrite(
      categoriesFromFile.map((c) => ({
        updateOne: {
          filter: { slug: c.slug },
          update: { $set: { name: c.name, slug: c.slug, image: c.image } },
          upsert: true,
        },
      }))
    );
    console.log(`Upserted ${categoriesFromFile.length} categories from categories.json`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
};

const seedBrandsFromFile = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    await Brand.bulkWrite(
      brandsFromFile.map((b) => ({
        updateOne: {
          filter: { slug: b.slug },
          update: { $set: { name: b.name, slug: b.slug, image: b.image } },
          upsert: true,
        },
      }))
    );
    console.log(`Upserted ${brandsFromFile.length} brands from brands.json`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding brands:', err);
    process.exit(1);
  }
};

const seedProductsFromFile = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const categories = await Category.find();
    const brands = await Brand.find();
    const subcategories = await Subcategory.find();

    const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c._id]));
    const brandByName = Object.fromEntries(brands.map((b) => [b.name, b._id]));

    const subByCategoryAndName = new Map();
    for (const s of subcategories) {
      subByCategoryAndName.set(`${String(s.category)}:${s.name}`, s._id);
    }

    const bulkOps = products.map((p) => {
      const catId = categoryByName[p.category];
      if (!catId) {
        throw new Error(
          `Category not found in DB: "${p.category}". Run: node utils/seeder.js --categories`
        );
      }

      let brandId;
      if (p.brand != null && p.brand !== '') {
        brandId = brandByName[p.brand];
        if (!brandId) {
          throw new Error(
            `Brand not found in DB: "${p.brand}". Run: node utils/seeder.js --brands`
          );
        }
      }

      let subId;
      if (p.subcategory) {
        subId = subByCategoryAndName.get(`${String(catId)}:${p.subcategory}`);
        if (!subId) {
          throw new Error(
            `Subcategory not found: "${p.subcategory}" under category "${p.category}".`
          );
        }
      }

      const doc = {
        title: p.title,
        description: p.description,
        price: p.price,
        quantity: p.quantity,
        imageCover: p.imageCover,
        images: p.images ?? [],
        colors: p.colors ?? [],
        category: catId,
        averageRating: p.averageRating ?? 4,
      };
      if (p.priceAfterDiscount != null) doc.priceAfterDiscount = p.priceAfterDiscount;
      if (p.sold != null) doc.sold = p.sold;
      if (p.ratingsQuantity != null) doc.ratingsQuantity = p.ratingsQuantity;
      if (brandId) doc.brand = brandId;
      if (subId) doc.subcategory = subId;

      return {
        updateOne: {
          filter: { title: p.title, category: catId },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    if (bulkOps.length) {
      await Product.bulkWrite(bulkOps);
    }
    console.log(`Upserted ${products.length} products from products.json`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Brand.deleteMany();
    console.log('Existing data cleared');

    // --- 1. Create unique Categories ---
    const categoryNames = [...new Set(products.map((p) => p.category))];
    const categoryDocs = await Category.insertMany(
      categoryNames.map((name) => ({ name, slug: name.toLowerCase() }))
    );
    const categoryMap = Object.fromEntries(
      categoryDocs.map((c) => [c.name, c._id])
    );
    console.log(`Inserted ${categoryDocs.length} categories`);

    // --- 2. Create unique Subcategories (linked to their category) ---
    const subcategoryEntries = [
      ...new Map(
        products
          .filter((p) => p.subcategory)
          .map((p) => [p.subcategory, { name: p.subcategory, category: p.category }])
      ).values(),
    ];
    const subcategoryDocs =
      subcategoryEntries.length > 0
        ? await Subcategory.insertMany(
            subcategoryEntries.map(({ name, category }) => ({
              name,
              slug: name.toLowerCase(),
              category: categoryMap[category],
            }))
          )
        : [];
    const subcategoryMap = Object.fromEntries(
      subcategoryDocs.map((s) => [s.name, s._id])
    );
    console.log(`Inserted ${subcategoryDocs.length} subcategories`);

    // --- 3. Create unique Brands ---
    const brandNames = [...new Set(products.map((p) => p.brand))];
    const brandDocs = await Brand.insertMany(
      brandNames.map((name) => ({ name, slug: name.toLowerCase() }))
    );
    const brandMap = Object.fromEntries(brandDocs.map((b) => [b.name, b._id]));
    console.log(`Inserted ${brandDocs.length} brands`);

    // --- 4. Insert Products with resolved ObjectIds ---
    const resolvedProducts = products.map((p) => ({
      ...p,
      category: categoryMap[p.category],
      subcategory: p.subcategory ? subcategoryMap[p.subcategory] : undefined,
      brand: brandMap[p.brand],
    }));

    await Product.insertMany(resolvedProducts);
    console.log(`Inserted ${resolvedProducts.length} products`);

    console.log('\nData imported successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    await Product.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Brand.deleteMany();

    console.log('All data destroyed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error destroying data:', err);
    process.exit(1);
  }
};

// Run with: node utils/seeder.js --import | --destroy | --brands | --categories | --products
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--destroy') {
  destroyData();
} else if (process.argv[2] === '--brands') {
  seedBrandsFromFile();
} else if (process.argv[2] === '--categories') {
  seedCategoriesFromFile();
} else if (process.argv[2] === '--products') {
  seedProductsFromFile();
} else {
  console.log('Usage:');
  console.log('  node utils/seeder.js --import   (seed the database)');
  console.log('  node utils/seeder.js --destroy  (clear the database)');
  console.log('  node utils/seeder.js --brands   (import utils/dummyData/brands.json)');
  console.log('  node utils/seeder.js --categories   (import utils/dummyData/categories.json)');
  console.log('  node utils/seeder.js --products   (import utils/dummyData/products.json)');
  process.exit(0);
}
