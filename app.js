const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`)
  } else {
    next();
  }
});
app.use(express.static('build'));

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find(function(err, foundItems) {
    if(err) {
      console.log(err);    
    } else {
      if (foundItems.length === 0) {

        Item.insertMany(defaultItems, function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Inserted defalut items!");
            res.redirect("/");
          }
        });

      } else {
        res.render("list", {listTitle: "Bhaskar", todoItems: foundItems, pageTitle: 'TODO List'});
      }
    }
  });

});

app.post("/", function(req, res) {
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Bhaskar") {

    item.save(function (err) {
      if (err) {
        console.log(err);      
      } else {
        res.redirect("/");
      }
    });  

  } else {

      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
      })

  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox; 
  const listName = req.body.listName;

  if(listName === "Bhaskar") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);      
      } else {
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
      if(!err) {
        res.redirect("/" + listName);
      }      
    });
  }

});

app.get("/:pageName", function(req, res) {
  const customListName = _.capitalize(req.params.pageName);

  List.findOne({name: customListName}, function(err, result) {
    if(err) {
      console.log(err);
    } else {
      if (result == null) {
        // Create a new list.
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();  
        
        res.redirect("/" + customListName);
        

      } else {
        // Show an Existing List.

        res.render("list", {listTitle: result.name, todoItems: result.items, pageTitle: 'TODO List'});
      }
    }
  });

});

app.get("/about", function(req, res) {
  res.render("about", {pageTitle: "About Me"});
});

app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Server started at localhost!");
});
