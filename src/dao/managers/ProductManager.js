const { MongoClient, ObjectId } = require('mongodb');

class ProductManager {
  constructor(mongoUrl) {
    this.mongoUrl = mongoUrl;
    this.client = new MongoClient(mongoUrl, { useUnifiedTopology: true });
    this.productsCollection = null;
  }

  async connectToMongo() {
    try {
      await this.client.connect();
      this.productsCollection = this.client.db().collection('products');
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

  async addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    try {
      const result = await this.productsCollection.insertOne(product);
      console.log('Producto agregado con ID:', result.insertedId);
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  }

  async getProducts() {
    try {
      const products = await this.productsCollection.find().toArray();
      return products;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return [];
    }
  }

  async getProductById(id) {
    try {
      const product = await this.productsCollection.findOne({ _id: new ObjectId(id) });
      if (product) {
        return product;
      } else {
        console.error("Producto no encontrado.");
      }
    } catch (error) {
      console.error('Error al obtener el producto:', error);
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      const result = await this.productsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFields }
      );
      if (result.matchedCount === 0) {
        console.error("Producto no encontrado.");
      } else {
        console.log('Producto actualizado con éxito.');
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
  }

  async deleteProduct(id) {
    try {
      const result = await this.productsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        console.error("Producto no encontrado.");
      } else {
        console.log('Producto eliminado con éxito.');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  }
}

module.exports = ProductManager;

/*
const fs = require('fs').promises;

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.loadProductsFromFile();
  }

  async loadProductsFromFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
    } catch (error) {
      this.products = [];
    }
  }

  async saveProductsToFile() {
    try {
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error guardando productos en el archivo:', error);
    }
  }

  generateID() {
    return this.products.length + 1;
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    if (this.products.some(p => p.code === product.code)) {
      console.error("El código del producto ya existe.");
      return;
    }

    product.id = this.generateID();
    this.products.push(product);
    this.saveProductsToFile();
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      return product;
    } else {
      console.error("Producto no encontrado.");
    }
  }

  updateProduct(id, updatedFields) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedFields };
      this.saveProductsToFile();
    } else {
      console.error("Producto no encontrado.");
    }
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProductsToFile();
    } else {
      console.error("Producto no encontrado.");
    }
  }
}

module.exports = ProductManager;
*/