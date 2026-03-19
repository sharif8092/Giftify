import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wooCommerceRoutes from './routes/wooCommerce';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/woo', wooCommerceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Giftify Express Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
