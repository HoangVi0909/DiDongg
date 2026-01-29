const http = require('http');

const mockData = {
  products: [
    { id: 1, name: 'Candy A', price: 10000, image: 'candy1.jpg', rating: 4.5 },
    { id: 2, name: 'Candy B', price: 15000, image: 'candy2.jpg', rating: 4.8 },
    { id: 3, name: 'Candy C', price: 20000, image: 'candy3.jpg', rating: 4.2 },
  ],
  vouchers: [
    { id: 1, code: 'SAVE10', discount: 10, description: '10% off' },
    { id: 2, code: 'SAVE20', discount: 20, description: '20% off' },
  ],
  categories: [
    { id: 1, name: 'Chocolate', description: 'Chocolate candies' },
    { id: 2, name: 'Hard Candy', description: 'Hard candies' },
  ],
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  if (url === '/api/products' || url === '/api/products/') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.products));
  } else if (url === '/api/vouchers' || url === '/api/vouchers/') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.vouchers));
  } else if (url === '/api/categories' || url === '/api/categories/') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.categories));
  } else if (url === '/health' || url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'UP' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 Mock Backend running on http://localhost:${PORT}`);
  console.log(`✅ Endpoints:`);
  console.log(`   - GET /api/products`);
  console.log(`   - GET /api/vouchers`);
  console.log(`   - GET /api/categories`);
  console.log(`   - GET /api/health\n`);
});
