import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/product.model.js';
import Brand from '../models/brand.model.js';
import Category from '../models/category.model.js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const generateChatResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const keywords = message
    .split(' ')
    .filter((word) => word.length > 2)
    .join('|');
  const searchRegex = keywords ? new RegExp(keywords, 'i') : null;

  const [products, brands, categories] = await Promise.all([
    searchRegex
      ? Product.find({
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .limit(50)
          .populate('brand category', 'name')
      : Promise.resolve([]),

    Brand.find().select('name'),

    Category.find().select('name'),
  ]);

  let fallbackProducts = [];
  if (products.length === 0) {
    fallbackProducts = await Product.find()
      .sort({ averageRating: -1, sold: -1 })
      .limit(5)
      .populate('brand category', 'name');
  }

  const allProducts = products.length > 0 ? products : fallbackProducts;

  let contextData =
    'Here is the currently available store data to answer the customer:\n';

  if (categories.length > 0) {
    contextData += `\nAvailable categories: ${categories.map((c) => c.name).join(', ')}.`;
  }

  if (brands.length > 0) {
    contextData += `\nAvailable brands: ${brands.map((b) => b.name).join(', ')}.`;
  }

  if (allProducts.length > 0) {
    contextData += `\nProducts:\n`;
    allProducts.forEach((p) => {
      const brandName = p.brand ? p.brand.name : 'N/A';
      const categoryName = p.category ? p.category.name : 'N/A';
      contextData += `- ${p.title} (Brand: ${brandName} | Category: ${categoryName} | Price: ${p.price} EGP | Rating: ${p.averageRating}/5 | Sold: ${p.sold} | Stock: ${p.quantity > 0 ? 'In stock' : 'Out of stock'})\n`;
    });
  }

  const prompt = `
    You are a smart, friendly assistant for an online store. Your job is to answer customer questions in a concise and helpful way based ONLY on the provided store data.
    If the customer asks about something not found in the provided data, politely let them know it's not currently available.
    Do NOT make up any prices or products outside of the provided data.
    Always respond in English.
    Store data:
    ${contextData}
    Customer question: "${message}"
    `;

  // 5. Send request to Gemini
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(prompt);

  return res.status(200).json({ reply: result.response.text() });
});
