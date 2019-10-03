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
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
        message: "What do you want to do?"

    }).then(function (answers) {
        switch (answers.commands) {
            case "View Products for Sale":
                itemView();
                break;

            case "View Low Inventory":
                lowInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                addProduct();
                break;

            case "Exit":
                console.log(lineBreak + "\n" + "Thank you for visiting Bamazon.com!" + lineBreak) + "\n";
                connection.end();
                break;
        }
    })
}


//This function logs the items in inventory to the console as a table
function itemView() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        customerCommands();
    });
}


//This function logs items in inventory with less than 1000 items in stock to the screen in ascending order
function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 1000 ORDER BY stock_quantity ASC", function (err, res) {
        if (err) throw err;
        console.table(res);
        customerCommands();
    })
}


//This function allows the manager to update the stock quantity of an item based on its ID number
function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        var productArray = [];
        for (let i = 0; i < res.length; i++) {
            productArray.push(res[i].id)
        }
        console.table(res);

        inquirer.prompt([{
            name: "productID",
            message: "Select the ID of the product to which you would like to add inventory:",
            choices: productArray
        }, {
            name: "addedInventory",
            message: "How many more items would you like to add to your inventory?"
        }]).then(function (answers) {
            var chosenItem;
            for (let i = 0; i < res.length; i++) {
                if (res[i].id === parseInt(answers.productID)) {
                    chosenItem = res[i];               
                }
            }

        var totalInventory = parseInt(chosenItem.stock_quantity) + parseInt(answers.addedInventory);

            connection.query("UPDATE products SET ? WHERE ?", 
            [
                {
                    stock_quantity: parseInt(chosenItem.stock_quantity) + parseInt(answers.addedInventory)
                },
                {
                    id: chosenItem.id
                }
            ],
            function(error){
                if (error) throw err;
                console.log(lineBreak + "\n" + "\n" +  "Inventory Updated!" + "\n" + "Amount Added: " + answers.addedInventory + "\n" + "Total Inventory: " + totalInventory + "\n" + lineBreak);
                customerCommands();
            })
    });
});
}


//This function allow the manager to add a new item to inventory by supplying the product name, department, price and stock quantity of an item
function addProduct() {
    inquirer.prompt([
        {
            name: "productName",
            message: "What is the name of the product you are adding to inventory?"
        },
        {
           name: "department",
           type: "list",
            message: "In which department does this product belong?",
            choices: ["electronics", "clothing", "entertainment", "furniture", "home and bath", "other"]
        },
        {
            name: "price",
            message: "What is the price of this product?"
        },
        {
            name: "stockQuantity",
            message: "How many would you like for inventory?"
        }
    ]).then(function (answers) {
        connection.query("INSERT INTO products SET ?", 
        {
            product_name: answers.productName,
            department: answers.department,
            price: answers.price,
            stock_quantity: answers.stockQuantity
        }, function (err, res) {
            if(err) throw err;
            console.log(lineBreak + "\n" + "\n" + "Your new item has been added to inventory" + "\n" + lineBreak);
            customerCommands();
        }
        )
    })
}


                    