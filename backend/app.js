import fs from 'node:fs/promises';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors'; // Import the cors package

const app = express();

// Use CORS middleware
app.use(cors({
  origin: '*', // Allow all origins (you can specify specific origins if needed)
  methods: ['GET', 'POST'], // Allow specific methods
  allowedHeaders: ['Content-Type'], // Allow specific headers
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/meals', async (req, res) => {
  const meals = await fs.readFile('./data/available-meals.json', 'utf8');
  res.json(JSON.parse(meals));
});

app.post('/orders', async (req, res) => {
  const orderData = req.body.order;

  if (orderData === null || orderData.items === null || orderData.items.length === 0) {
    return res
      .status(400)
      .json({ message: 'Missing data.' });
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes('@') ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === '' ||
    orderData.customer.street === null ||
    orderData.customer.street.trim() === '' ||
    orderData.customer['postal-code'] === null ||
    orderData.customer['postal-code'].trim() === '' ||
    orderData.customer.city === null ||
    orderData.customer.city.trim() === ''
  ) {
    return res.status(400).json({
      message:
        'Missing data: Email, name, street, postal code or city is missing.',
    });
  }

  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
  };
  const orders = await fs.readFile('./data/orders.json', 'utf8');
  const allOrders = JSON.parse(orders);
  allOrders.push(newOrder);
  await fs.writeFile('./data/orders.json', JSON.stringify(allOrders));
  res.status(201).json({ message: 'Order created!' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});