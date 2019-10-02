var mysql = require("mysql");
var inquirer = require("inquirer");
var lineBreak = "\n" + "--------------------------------"


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    var lineBreak = "\n" + "--------------------------------" + "\n"
    console.log(lineBreak + "Welcome to Bamazon.com!" + lineBreak);
    customerCommands();
});

function customerCommands() {
    inquirer.prompt({

        name: "commands",
        type: "list",
        choices: ["View Items", "Make a purchase", "Exit"],
        message: "What do you want to do?"

    }).then(function (answers) {
        switch (answers.commands) {
            case "View Items":
                itemView();
                break;

            case "Make a purchase":
                makePurchase();
                break;

            case "Exit":
                console.log(lineBreak + "\n" + "Thank you for visiting Bamazon.com!" + lineBreak) + "\n";
                connection.end();
                break;
        }
    })
}

function itemView() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        customerCommands();
    });
}

function makePurchase() {
    connection.query("SELECT * FROM products", function (err, res) {
        var productArray = [];
        for (let i = 0; i < res.length; i++) {
            productArray.push(res[i].id)
        }
        console.table(res);

        inquirer.prompt([{
            name: "productID",
            message: "Select the ID of the product you would like to buy:",
            choices: productArray
        }, {
            name: "quantityRequested",
            message: "How many would you like to buy?"
        }]).then(function (answers) {
            var chosenItem;
            for (let i = 0; i < res.length; i++) {
                if (res[i].id === parseInt(answers.productID)) {
                    chosenItem = res[i];               
                }
            }

        var totalPrice = chosenItem.price * answers.quantityRequested;

        if (chosenItem.stock_quantity >= parseInt(answers.quantityRequested)) {
            connection.query("UPDATE products SET ? WHERE ?", 
            [
                {
                    stock_quantity: chosenItem.stock_quantity - answers.quantityRequested
                },
                {
                    id: chosenItem.id
                }
            ],
            function(error){
                if (error) throw err;
                console.log(lineBreak + "\n" + "Purchase successful!" + "\n" + "Item Ordered: " + chosenItem.product_name + "\n" + "Quantity: " + answers.quantityRequested + "\n" + "Your total is $" + totalPrice + lineBreak);
                customerCommands();
            })
        } else {
            console.log(lineBreak + "\n" + "Sorry, we do not have the amount you have requested" + lineBreak);
            customerCommands();
        }
    });
});
};
            