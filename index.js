import axios from 'axios';
import { MongoClient } from "mongodb";

const dbName = "friedChicken"

function callGetAllProductsAPI() {
    return axios({
        method: "get",
        url: `http://phungmaianh.ddns.net/pfc/biz/products`
    })
}

async function getAllProducts() {
    try {
        const res = await callGetAllProductsAPI();
        return res.data;

    } catch (err) {
        console.log(err);
    }
}

const convertToMongoDb = (data) => {
    return data.map(e => {
        return {
            productId: e.id,
            description: e.description,
            imageUrl: e.imageUrl,
            point: e.point,
            categoryId: e.categoryId,
            subDesc: e.units.VN.map(v => {
                 return { 
                     text: v.text, 
                     point: v.point 
                    } 
                }),
            price: e.prices.VND.price
        }
    })
}

async function connectMongoDb() {
    try {
        const uri = "mongodb://admin:maianh93@maianh-mongo.ddns.net/friedChicken";
        const client = new MongoClient(uri);
        await client.connect();
        return client.db(dbName);
    } catch (error) {
        console.log(error);
    }
}

async function deleteOldProducts(db) {
    await db.collection("product").deleteMany({});
}

async function saveNewProducts(db, newProducts) {
    await db.collection("product").insertMany(
        newProducts
    )
}

async function main() {
    const db = await connectMongoDb();
    await deleteOldProducts(db);
    const oldProducts = await getAllProducts();
    const newProducts = convertToMongoDb(oldProducts);
    await saveNewProducts(db, newProducts);
    console.log(newProducts)
}


main()

