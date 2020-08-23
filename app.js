const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-bell:TheBells2001@todolist.ih9we.mongodb.net/todolistAtlas?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model('Item', itemsSchema);

const default1 = new Item ({
  name: "Welcome to your todolist!"
});

const default2 = new Item ({
  name: "Hit the + button to add a new item."
});

const default3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [default1, default2, default3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let day = date();

  Item.find({}, function (err, allItems) {
    
    if (allItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log('Default items added to DB')
        }
      });
      res.redirect('/');
    } else {
      res.render('list', {
        listTitle: day,
        newListItems: allItems
      })
    }
  })

  
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listAdd;
  let day = date();

  const item = new Item({
    name: itemName
  });

  if (listName == day) {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    })
  }

});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  let day = date();

  if (listName == day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Todo List Item Deleted');
      };
    });

    res.redirect('/');
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        console.log('Custom Todo List Item Deleted');
        res.redirect('/' + listName);
      }
    })
  }

  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList) {
    if (!err) {
      if (foundList) {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      } else {
        const list = new List ({
          name: customListName,
          items: defaultItems
        });


        list.save();
        res.redirect("/" + customListName);
      }
    } else {
      console.log(err);
    }
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
};

app.listen(port, function () {
  console.log("Server started on port " + port);
});
