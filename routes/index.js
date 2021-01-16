var express = require('express');
var router = express.Router();

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51I9opSDtYlEV8acy7Ycgs6TT5Gzr1s3MCgDUaXSSrpAx2xGvzBRrrq6KNoZe4VUw1fDrqC3OeOP6YohBO9Y012QZ00q6nDuoh8');


var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price: 679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price: 999},
  {name:"TITANS", url:"/images/bike-3.jpg", price: 799},
  {name:"CEWO", url:"/images/bike-4.jpg", price: 1300},
  {name:"AMIG39", url:"/images/bike-5.jpg", price: 479},
  {name:"LIK099", url:"/images/bike-6.jpg", price: 869},
]

//var dataCardBike = []

/* GET home page. */
router.get('/', function(req, res, next) {
  
  if(req.session.dataCardBike == undefined) {
  req.session.dataCardBike = [];
  }
  res.render('index', {dataBike:dataBike});
});

/* (1) réception et traitement des informations relatives au vélo que l'on souhaites ajouter au panier*/
router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

    for(var i = 0; i< req.session.dataCardBike.length; i++){
      if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
        req.session.dataCardBike[i].quantity =  Number(req.session.dataCardBike[i].quantity) + 1;
        alreadyExist = true;
      }
    }
    if(alreadyExist == false){

  req.session.dataCardBike.push({
    name: req.query.bikeNameFromFront,
    url: req.query.bikeImageFromFront,
    price: req.query.bikePriceFromFront,
    quantity: 1
   })
  }
  
  res.render('shop', {dataCardBike:req.session.dataCardBike});
});


/* (2) mécanique de suppression d'item  */
router.get('/delete-shop', function(req, res, next) {

  req.session.dataCardBike.splice(req.query.position,1);

  res.render('shop', {dataCardBike:req.session.dataCardBike})
});

router.post('/update-shop', function(req, res, next) {

  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop', {dataCardBike:req.session.dataCardBike})
});



router.post('/create-checkout-session', async (req, res) => {

    let stripeItems = []

  for(var i=0;i<req.session.dataCardBike.length; i++){

    stripeItems.push({

      price_data: {

        currency: 'eur',

        product_data: {

          name: req.session.dataCardBike[i].name,

        },

        unit_amount: req.session.dataCardBike[i].price * 100,

      },

      quantity: req.session.dataCardBike[i].quantity,

    });

  }

  const session = await stripe.checkout.sessions.create({

    payment_method_types: ['card'],

    line_items: stripeItems,

      
    mode: "payment",

    success_url: 'http://10.0.0.101:3000/success',

    cancel_url: 'http://10.0.0.101:3000/',

  });
  res.json({ id: session.id });
});

//app.listen(4242, () => console.log(`Listening on port ${3000}!`));

router.get('/success', function(req, res, next) {
  
res.render('success');
});




module.exports = router;
