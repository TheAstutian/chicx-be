import {MongoClient, ServerApiVersion} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

const URI = process.env.URI

const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

try{
  await client.connect();
  await client.db("gdvsta").command({ping:1})
  console.log("Pinged DB. Successful")
} catch(err){
  console.log(err)
}

let db = client.db('gdvsta')



export const database = [
    {
      id: 1,
      name: 'Samsung Galaxy S21',
      description: 'Latest model with advanced features',
      price: 450000.00,
      primaryCategory: 'Electronics',
      secondaryCategory: 'Mobile Phones',
      imageUrl: 'https://m.media-amazon.com/images/I/81Eq44u+pJL._AC_UF1000,1000_QL80_.jpg',
      details: 'The Samsung Galaxy S21 offers a new camera design, a faster processor, and better software features.',
      date: '2024-02-15',
    },
    {
      id: 2,
      name: 'Apple iPhone 12',
      description: 'Smartphone with A14 Bionic chip',
      price: 550000.00,
      primaryCategory: 'Electronics',
      secondaryCategory: 'Mobile Phones',
      imageUrl: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/refurb-iphone-12-pro-graphite-2020',
      details: 'The Apple iPhone 12 features 5G speed, A14 Bionic, the fastest chip in a smartphone, and a Ceramic Shield front cover.',
      date: '2024-03-20',
    },
    {
      id: 3,
      name: 'HP Spectre x360',
      description: 'Convertible laptop with touch screen',
      price: 750000.00,
      primaryCategory: 'Computers',
      secondaryCategory: 'Laptops',
      imageUrl: 'https://www.hp.com/gb-en/shop/Html/Merch/Images/7K833EA-ABU_14_1750x1285.jpg',
      details: 'The HP Spectre x360 is a premium 2-in-1 device with a sleek design, long battery life, and powerful performance.',
      date: '2024-04-05',
    },
    {
      id: 4,
      name: 'Dell XPS 13',
      description: 'Ultrabook with InfinityEdge display',
      price: 680000.00,
      primaryCategory: 'Computers',
      secondaryCategory: 'Laptops',
      imageUrl: 'https://cdn.arstechnica.net/wp-content/uploads/2018/02/xps13_2018laptop17-800x533.jpg',
      details: 'The Dell XPS 13 offers a stunning display, excellent build quality, and a powerful Intel processor.',
      date: '2024-05-10',
    },
    {
      id: 5,
      name: 'Sony WH-1000XM4',
      description: 'Noise cancelling wireless headphones',
      price: 150000.00,
      primaryCategory: 'Audio',
      secondaryCategory: 'Headphones',
      imageUrl: 'https://www.sony.co.uk/image/5d02da5df552836db894cead8a68f5f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF',
      details: 'The Sony WH-1000XM4 headphones provide exceptional noise cancellation, high-quality sound, and comfortable design.',
      date: '2024-06-15',
    },
    {
      id: 6,
      name: 'Bose SoundLink Revolve',
      description: 'Portable Bluetooth speaker',
      price: 100000.00,
      primaryCategory: 'Audio',
      secondaryCategory: 'Speakers',
      imageUrl: 'https://assets.bose.com/content/dam/Bose_DAM/Web/consumer_electronics/global/products/speakers/soundlink_revolve_plus_ii/product_silo_images/SoundLink_Revolve_Plus_II_Black_Ecom_1.png/jcr:content/renditions/cq5dam.web.320.320.png',
      details: 'The Bose SoundLink Revolve delivers deep, loud, and immersive sound in every direction.',
      date: '2024-07-05',
    },
    {
      id: 7,
      name: 'Nike Air Max 270',
      description: 'Comfortable and stylish sneakers',
      price: 65000.00,
      primaryCategory: 'Footwear',
      secondaryCategory: 'Sneakers',
      imageUrl: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/37fbe91f-8dd7-490e-85c6-c8c6c481f709/air-max-270-older-shoes-XnBv12.png',
      details: 'The Nike Air Max 270 features the first-ever Max Air unit created for lifestyle wear, with a design inspired by icons of the big Air era.',
      date: '2024-02-22',
    },
    {
      id: 8,
      name: 'Adidas Ultraboost',
      description: 'Running shoes with Boost cushioning',
      price: 70000.00,
      primaryCategory: 'Footwear',
      secondaryCategory: 'Running Shoes',
      imageUrl: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/ca5f722d3ce847a59d11577d051ce05a_9366/Ultraboost_Light_Shoes_White_GY9352.jpg',
      details: 'The Adidas Ultraboost offers responsive Boost cushioning and a Primeknit upper for adaptive support and comfort.',
      date: '2024-03-30',
    },
    {
      id: 9,
      name: 'Samsung QLED TV',
      description: 'Smart TV with 4K resolution',
      price: 1200000.00,
      primaryCategory: 'Electronics',
      secondaryCategory: 'Televisions',
      imageUrl: 'https://media.4rgos.it/i/Argos/2078250_R_Z001A',
      details: 'The Samsung QLED TV offers stunning 4K picture quality with vibrant colors and smart TV features.',
      date: '2024-04-10',
    },
    {
      id: 10,
      name: 'Apple MacBook Air',
      description: 'Lightweight laptop with M1 chip',
      price: 850000.00,
      primaryCategory: 'Computers',
      secondaryCategory: 'Laptops',
      imageUrl: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034',
      details: 'The Apple MacBook Air features the new M1 chip, delivering exceptional performance and long battery life in a sleek design.',
      date: '2024-05-22',
    },
    {
      id: 11,
      name: 'Sony PlayStation 5',
      description: 'Next-generation gaming console',
      price: 400000.00,
      primaryCategory: 'Gaming',
      secondaryCategory: 'Consoles',
      imageUrl: 'https://media.direct.playstation.com/is/image/psdglobal/PS5-Slim-Hero-4',
      details: 'The Sony PlayStation 5 offers lightning-fast loading, a new generation of PlayStation games, and immersive gaming experiences.',
      date: '2024-06-12',
    },
    {
      id: 12,
      name: 'Microsoft Xbox Series X',
      description: 'Powerful gaming console',
      price: 420000.00,
      primaryCategory: 'Gaming',
      secondaryCategory: 'Consoles',
      imageUrl: 'https://assets.xboxservices.com/assets/fb/d2/fbd2cb56-5c25-414d-9f46-e6a164cdf5be.png?n=XBX_A-BuyBoxBGImage01-D.png',
      details: 'The Xbox Series X is the most powerful Xbox ever, with faster load times, higher frame rates, and more dynamic worlds.',
      date: '2024-07-01',
    },
    {
      id: 13,
      name: 'Canon EOS R5',
      description: 'Professional mirrorless camera',
      price: 1500000.00,
      primaryCategory: 'Cameras',
      secondaryCategory: 'Mirrorless',
      imageUrl: 'https://i1.adis.ws/i/canon/eos-r5-c-fsl_range-page_06_306bc724fef64cc5a06bc8e97299cd91',
      details: 'The Canon EOS R5 offers high-resolution images, 8K video recording, and exceptional autofocus performance.',
      date: '2024-02-25',
    },
    {
      id: 14,
      name: 'Sony A7 III',
      description: 'Versatile full-frame mirrorless camera',
      price: 1000000.00,
      primaryCategory: 'Cameras',
      secondaryCategory: 'Mirrorless',
      imageUrl: 'https://www.mpb.com/media-service/16c9be86-bb41-4d13-a50e-6a7feb8e8d9d',
      details: 'The Sony A7 III offers a superb blend of resolution, speed, and features in a compact body.',
      date: '2024-03-18',
    },
    {
      id: 15,
      name: 'Apple iPad Pro',
      description: 'High-performance tablet with M1 chip',
      price: 500000.00,
      primaryCategory: 'Tablets',
      secondaryCategory: 'iOS Tablets',
      imageUrl: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/refurb-ipad-pro-12-wifi-silver-2021?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1674663706497',
      details: 'The Apple iPad Pro features the powerful M1 chip, a stunning Liquid Retina display, and advanced cameras.',
      date: '2024-04-28',
    },
    {
      id: 16,
      name: 'Samsung Galaxy Tab S7',
      description: 'High-end Android tablet',
      price: 350000.00,
      primaryCategory: 'Tablets',
      secondaryCategory: 'Android Tablets',
      imageUrl: 'https://www.manuals.co.uk/thumbs/products/l/1260236-samsung-galaxy-tab-s7.webp',
      details: 'The Samsung Galaxy Tab S7 offers a high-refresh-rate display, powerful performance, and an S Pen for productivity.',
      date: '2024-05-15', 
    },
    {
      id: 17,
      name: 'Amazon Kindle Paperwhite',
      description: 'E-reader with high-resolution display',
      price: 90000.00,
      primaryCategory: 'E-readers',
      secondaryCategory: 'Tablets',
      imageUrl: 'https://m.media-amazon.com/images/I/41a5x19L6mL._AC_.jpg',
      details: 'The Kindle Paperwhite offers a high-resolution display, waterproof design, and adjustable warm light.',
      date: '2024-06-20',
    },
    {
      id: 18,
      name: 'Fitbit Charge 5',
      description: 'Advanced fitness and health tracker',
      price: 120000.00,
      primaryCategory: 'Wearables',
      secondaryCategory: 'Fitness Trackers',
      imageUrl: 'https://store.ee.co.uk/images/product/uni2/DigitalContent/600x450/gj/GJBY_51E34B32-BDF0-4799-99CE-E9DC3F736989_large.jpg',
      details: 'The Fitbit Charge 5 offers advanced fitness and health tracking features, including GPS, heart rate monitoring, and stress management tools.',
      date: '2024-07-10',
    },
  ]

  export default db; 