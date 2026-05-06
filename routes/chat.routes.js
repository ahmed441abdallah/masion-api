import express from 'express';
import { generateChatResponse } from '../controllers/chat.controller.js';
const chatRouter = express.Router();
chatRouter.post('/', generateChatResponse);
export default chatRouter;
