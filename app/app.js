const express = require("express");
const app = express();
const paypal = require("paypal-rest-sdk");
const exphbs = require("express-handlebars");

// handlebars middleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//set static folder
app.use(express.static(`${__dirname}/public`));

//paypal config
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ASqesxpFcam4Wigzrw_7lRbhjzqxIhkPHCvN7OCzVeBiY6mUNGuPWvT5hYKDOfee2AWhVm9Cw8bxcGCz",
  client_secret:
    "EHSEp2epAPlto7CgUpRhRoycVHXKpHuUiw4rRiBHmzNIIobCt_-Gdek7CbkAvOYfBPIyiiojlliHt5Ke"
});

//Routes
app.get("/", (req, res, next) => {
  res.render("home");
});

app.get("/about", (req, res, next) => {
  res.render("about");
});

app.post("/pay", (req, res, next) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "C++ eBook",
              sku: "001",
              price: "70",
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "USD",
          total: "70"
        },
        description: "Buy The beginners guide to C++."
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res, next) => {
  const payerId = req.query.PayerID;
  const payementId = req.query.paymentId;

  const execute_payement_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "70.00"
        }
      }
    ]
  };

  paypal.payment.execute(
    payementId,
    execute_payement_json,
    (error, payement) => {
      if (error) {
        throw error;
      } else {
        res.render("success", {
          details: {
            payerID: req.query.PayerID,
            token: req.query.token,
            payemnetID: req.query.paymentId
          }
        });
      }
    }
  );
});

app.get("/cancel", (req, res, next) => {
  res.render("cancel");
});

module.exports = app;
