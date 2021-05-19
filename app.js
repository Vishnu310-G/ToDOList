//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);
const Lists = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList App"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];



// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find({}, function(err, foundItem) {

    if (foundItem.length == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          consolee.log("Error in inserting");
        } else {
          console.log("Inserted Sucessfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "ToDay",
        newListItems: foundItem
      });
    }
  });
});


app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  Lists.findOne({
    name: customListName
  }, function(err, result) {

    if (err) {
      console.log("New List item creation failed");
    } else {
      if (!result) {
        const list = new Lists({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        })
      }
    }
  });



});


app.post("/", function(req, res) {

  const itemName = new Item({
    name: req.body.newItem
  });

  const listName = req.body.list;

  if (listName == "ToDay") {
    Item.create(itemName, function(err) {
      if (err) {
        console.log("Error in inserting single item");
      } else {
        console.log("Single item inserted Sucessfully");
      }
    });
    res.redirect("/");
  } else {

    Lists.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/" + listName);
    })

  }

});


app.post("/delete", function(req, res) {

  const listName = req.body.listName;

  if (listName == "ToDay") {
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err) {
        console.log("Failed to delete item");
      }
      res.redirect("/");
    });
  } else {

    Lists.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: req.body.checkbox
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })

  }



});




app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
