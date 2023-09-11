import productsModel from "../dao/models/products.schema.js";
import { productRepository } from "../repositories/index.js";
import { faker } from "@faker-js/faker";
import CustomError from '../utils/errors/CustomError.js';

export const getProducts = async (req, res) => {
    const { page, query, limit, order } = req.query;
    let sortBy;
    if (order === "desc") {
        sortBy = -1;
    } else if (order === "asc") {
        sortBy = 1;
    }
    let products;
    if (!query) {
        products = await productsModel.paginate(
            {},
            {
                limit: limit ?? 3,
                lean: true,
                page: page ?? 1,
                sort: { price: sortBy },
            }
        );
    } else {
        products = await productsModel.paginate(
            { category: query },
            {
                limit: limit ?? 3,
                lean: true,
                page: page ?? 1,
                sort: { price: sortBy },
            }
        );
    }
    res.render("products", { products, query, order, user: req.session.user });
};

export const getProductById = async (req, res) => {
    try {
        const pID = req.params.pid;
        const pFound = await productRepository.getProductById(pID);
        res.send(pFound);
    } catch (error) {
        res.status(500).send("Error");
    }
};

export const mockingProducts = async (req, res) => {
    const mockProducts = [];
    const product = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        status: faker.datatype.boolean(),
        stock: faker.number.int({ min: 0, max: 50 }),
        category: faker.commerce.productAdjective(),
        thumbnails: [],
        code: faker.string.uuid(),
    };

    for (let i = 0; i < 100; i++) {
        mockProducts.push(product);
    }

    res.send (mockProducts);
};

export const addProduct = async (req, res) => {
    const product = req.body;
    await productRepository.addProduct(product);
    res.send({ status: "success" });
};

export const updateProduct = async (req, res) => {
    const prodID = req.params.pid;
    const prodToAdd = req.body;
    const prodToUpdate = await productRepository.updateProduct(
        prodID,
        prodToAdd
    );
    res.send(prodToUpdate);
};

export const deleteProduct = async (req, res) => {
    try {
        const prodID = req.params.pid;
        const productToDelete = await productRepository.deleteProduct(prodID);
        res.send(productToDelete);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting data.");
    }
};
