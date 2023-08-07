const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// meddleWare
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p3ia7dw.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db('toyMarket').collection('services')

        app.post('/services', async (req, res) => {
            try {
                const newService = await toyCollection.insertOne(req.body)
                console.log(newService);
                res.send(newService)
            } catch (error) {
                res.send(error)
            }
        })

        app.get('/services', async (req, res) => {
            try {
                const result = await toyCollection.find()
                const data = await result.toArray()
                res.send(data)
            } catch (error) {
                res.send(error)
            }
        })

        app.get('/services/:category', async (req, res) => {
            const category = req.params.category
            try {
                const result = await toyCollection.find({ category: category })
                const data = await result.toArray()
                res.send(data)
            } catch (error) {
                res.send(error)
            }
        })

        app.get('/allToys/findById/:id', async (req, res) => {
            const result = await toyCollection.findOne({ _id: new ObjectId(req.params.id) })
            console.log(result);
            res.send(result);
        })

        // search fiend
        app.get('/allToys/findByCategory/:category', async (req, res) => {
            const category = req.params.category;
            const searchResult = await toyCollection.find({ category: category }).toArray();
            res.send(searchResult);
        })

        // all toys
        app.get('/allToys', async (req, res) => {
            const result = await toyCollection.find({}).toArray();
            res.send(result);
        });


        // find my toys
        app.get('/allToys/:email', async (req, res) => {
            const { sortType, limit = 10 } = req.query
            const result = await toyCollection
                .find({ sellerEmail: req.params.email })
                .sort({ quantity: sortType == 'asc' ? 1 : -1 })
                .limit(parseInt(limit))
                .toArray();
            res.send(result);
        });


        // update toys
        app.put('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const toys = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedToys = {
                $set: {
                    ...req.body
                }
            }
            const result = await toyCollection.updateOne(filter, updatedToys, options);
            res.send(result);
        })

        // delete toys
        app.delete('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);

        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Toy market please is running')

})

app.listen(port, () => {
    console.log(`Toy Server is running on port:${port}`);
})