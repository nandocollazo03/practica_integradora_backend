const { MongoClient, ObjectId } = require('mongodb');

class CartManager {
  constructor(mongoUrl, dbName, collectionName) {
    this.mongoUrl = mongoUrl;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.client = new MongoClient(mongoUrl, { useUnifiedTopology: true });
    this.cartsCollection = null;
  }

  async connectToMongo() {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      this.cartsCollection = db.collection(this.collectionName);
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
    }
  }

  async disconnectFromMongo() {
    try {
      await this.client.close();
    } catch (error) {
      console.error('Error cerrando conexión a MongoDB:', error);
    }
  }

  async createCart() {
    const newCart = {
      products: []
    };

    try {
      const result = await this.cartsCollection.insertOne(newCart);
      newCart.id = result.insertedId.toString();
      return newCart;
    } catch (error) {
      console.error('Error al crear el carrito:', error);
      return null;
    }
  }

  async getCartById(cartId) {
    try {
      const cart = await this.cartsCollection.findOne({ _id: new ObjectId(cartId) });
      if (cart) {
        cart.id = cart._id.toString();
        return cart;
      } else {
        console.error("Carrito no encontrado.");
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      return null;
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.getCartById(cartId);
    if (cart) {
      const existingProduct = cart.products.find(product => product.id === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ id: productId, quantity });
      }

      try {
        await this.cartsCollection.updateOne(
          { _id: new ObjectId(cartId) },
          { $set: { products: cart.products } }
        );
        return cart;
      } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        return null;
      }
    }
  }
}

module.exports = CartManager;

/*
const fs = require('fs').promises;

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.loadCartsFromFile();
  }

  async loadCartsFromFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
    } catch (error) {
      this.carts = [];
    }
  }

  async saveCartsToFile() {
    try {
      await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error guardando carritos en el archivo:', error);
    }
  }

  generateID() {
    return Date.now().toString();
  }

  createCart() {
    const newCart = {
      id: this.generateID(),
      products: []
    };
    this.carts.push(newCart);
    this.saveCartsToFile();
    return newCart;
  }

  getCartById(id) {
    return this.carts.find(cart => cart.id === id);
  }

  addProductToCart(cartId, productId, quantity) {
    const cart = this.getCartById(cartId);
    if (cart) {
      const existingProduct = cart.products.find(product => product.id === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ id: productId, quantity });
      }
      this.saveCartsToFile();
    }
  }
}

module.exports = CartManager;
*/