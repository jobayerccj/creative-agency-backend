const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('images'));
app.use(fileUpload());

const ObjectId = require('mongodb').ObjectId;

const dotenv = require('dotenv');
dotenv.config();


app.get('/', (req, res) => {
    res.send('Hello World from nodemon')
});

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jobayer:"+process.env.DBPASSWORD+"@cluster0.4ao7n.mongodb.net/creative-agency?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const services = client.db("creative-agency").collection("services");
    const submittedOrder = client.db("creative-agency").collection("submittedOrders");
    const reviews = client.db("creative-agency").collection("reviews");
    const admin = client.db("creative-agency").collection("admin");

    app.get('/services', (req, res) => {
        services.find({})
        .toArray((err, documents) => {
            res.status(200).send(documents);
        });
    });

    app.get('/reviews', (req, res) => {
        reviews.find({})
            .toArray((err, documents) => {
                res.status(200).send(documents);
            });
    });

    app.post('/submitOrder', (req, res)=>{
        const newOrder = req.body;
        submittedOrder.insertOne(newOrder)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/submittedOrderList', (req, res) => {
        console.log(req.body.adminType);

        if(req.body.adminType){
            submittedOrder.find({})
                .toArray((err, documents) => {
                    res.status(200).send(documents);
                });
        }else{
            submittedOrder.find({email: req.body.email})
                .toArray((err, documents) => {
                    res.status(200).send(documents);
                });
        }

    });

    app.post('/submitService', (req, res)=>{

        const file = req.files.image;
        const name = req.body.name;
        const details = req.body.details;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        const status='pending';

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        services.insertOne({
            name, email, details, image, status})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/submitreviews', (req, res)=>{
        const newReview = req.body;
        reviews.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        admin.find({ email: email })
            .toArray((err, admins) => {
                console.log(admins);
                res.send(admins.length > 0);
            })
    })

    // perform actions on the collection object
    //client.close();
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`app listening at http://localhost:${port}`)
});