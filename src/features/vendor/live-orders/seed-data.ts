import type { Order, OrderItem } from './order-cards';

export function makeSeedOrders(): Order[] {
  const now = Date.now();
  return [
    {
      id: 'o1',
      token: 'A25',
      tableNo: '4',
      placedAt: new Date(now - 12 * 60000),
      items: [
        { name: 'Chicken Rice', qty: 2, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Egg Rice', qty: 1, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Paneer Tikka', qty: 2, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Butter Naan', qty: 4, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Dal Makhani', qty: 1, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Veg Manchurian', qty: 1, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Spring Roll', qty: 2, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Gulab Jamun', qty: 4, image: 'https://images.unsplash.com/photo-1629851897368-2b814a0a4c28?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Mango Lassi', qty: 2, image: 'https://images.unsplash.com/photo-1571006682858-a458b8a69288?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Coke', qty: 3, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      notes: 'Less spicy, Extra cutlery',
      total: 1240,
      status: 'new',
    },
    {
      id: 'o2',
      token: 'B07',
      tableNo: '2',
      placedAt: new Date(now - 4 * 60000),
      items: [
        { name: 'Paneer Butter Masala', qty: 1, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Naan', qty: 3, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Mango Lassi', qty: 2, image: 'https://images.unsplash.com/photo-1571006682858-a458b8a69288?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 520,
      status: 'new',
    },
    {
      id: 'o3',
      token: 'C12',
      tableNo: '7',
      placedAt: new Date(now - 17 * 60000),
      items: [
        { name: 'Veg Biryani', qty: 1, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Raita', qty: 1, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      notes: 'No onion',
      total: 280,
      status: 'new',
    },
    {
      id: 'o4',
      token: 'E09',
      tableNo: '3',
      placedAt: new Date(now - 2 * 60000),
      items: [
        { name: 'Pav Bhaji', qty: 2, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Chaas', qty: 2, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      notes: 'Extra butter on pav',
      total: 310,
      status: 'new',
    },
    {
      id: 'o5',
      token: 'F21',
      tableNo: '5',
      placedAt: new Date(now - 8 * 60000),
      items: [
        { name: 'Chole Bhature', qty: 2, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Sweet Lassi', qty: 2, image: 'https://images.unsplash.com/photo-1571006682858-a458b8a69288?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 450,
      status: 'new',
    },
    {
      id: 'o6',
      token: 'G14',
      tableNo: '8',
      placedAt: new Date(now - 15 * 60000),
      items: [
        { name: 'Special North Thali', qty: 1, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Gulab Jamun', qty: 2, image: 'https://images.unsplash.com/photo-1629851897368-2b814a0a4c28?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 340,
      status: 'new',
    },
    {
      id: 'o7',
      token: 'H33',
      tableNo: '9',
      placedAt: new Date(now - 6 * 60000),
      items: [
        { name: 'Hakka Noodles', qty: 1, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Veg Manchurian', qty: 1, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Fried Rice', qty: 1, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      notes: 'Make it spicy',
      total: 580,
      status: 'new',
    },
    {
      id: 'o8',
      token: 'J05',
      tableNo: '10',
      placedAt: new Date(now - 22 * 60000),
      items: [
        { name: 'Masala Dosa', qty: 2, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Cold Coffee', qty: 2, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 390,
      status: 'new',
    },
    {
      id: 'o9',
      token: 'K18',
      tableNo: '12',
      placedAt: new Date(now - 11 * 60000),
      items: [
        { name: 'Paneer Tikka', qty: 1, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Rumali Roti', qty: 4, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Fresh Lemonade', qty: 2, image: 'https://images.unsplash.com/photo-1571006682858-a458b8a69288?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 490,
      status: 'new',
    },
    {
      id: 'o10',
      token: 'L02',
      tableNo: '15',
      placedAt: new Date(now - 1 * 60000),
      items: [
        { name: 'Samosa Chaat', qty: 2, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Masala Chai', qty: 2, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 210,
      status: 'new',
    },
    {
      id: 'o11',
      token: 'A18',
      tableNo: '1',
      placedAt: new Date(now - 25 * 60000),
      items: [
        { name: 'Dal Makhani', qty: 1, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Jeera Rice', qty: 2, image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Butter Naan', qty: 4, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      total: 460,
      status: 'ready',
      readyAt: new Date(now - 5 * 60000),
      collected: false,
    },
    {
      id: 'o12',
      token: 'D03',
      tableNo: '6',
      placedAt: new Date(now - 30 * 60000),
      items: [
        { name: 'Masala Dosa', qty: 2, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=150&h=150' },
        { name: 'Filter Coffee', qty: 2, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=150&h=150' },
      ],
      notes: 'Extra chutney',
      total: 320,
      status: 'ready',
      readyAt: new Date(now - 10 * 60000),
      collected: false,
    },
  ];
}

const TOKENS  = ['E09', 'F21', 'G14', 'H33', 'J05', 'K18'];
const TABLES  = ['3', '5', '8', '9', '10'];
const SAMPLE_ITEMS: OrderItem[][] = [
  [
    { name: 'Pav Bhaji', qty: 2, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=150&h=150' },
    { name: 'Butter', qty: 1, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=150&h=150' }
  ],
  [
    { name: 'Thali', qty: 1, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=150&h=150' },
    { name: 'Chaas', qty: 2, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=150&h=150' }
  ],
];

export function generateDemoOrder(): Order {
  const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
  return {
    id: `demo-${Date.now()}`,
    token,
    tableNo: TABLES[Math.floor(Math.random() * TABLES.length)],
    placedAt: new Date(),
    items: SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)],
    total: Math.floor(Math.random() * 300 + 100),
    status: 'new',
  };
}
