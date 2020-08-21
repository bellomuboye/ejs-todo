const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

console.log(date());


const app = express();
let items = ["Buy food", "Cook food", "Eat food"];
let workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  let day = date();
  res.render("list", {
    listTitle: day,
    newListItems: items,
  });
});

app.post("/", function (req, res) {
  let item = req.body.newItem;

  if (item !== "") {
    if (req.body.listAdd === "Work List") {
      workItems.push(item);
      res.redirect("/work")
    } else {
      items.push(item);
      res.redirect("/");
    }
  } else {
    console.log("Error: Blank Item entered");
  }
});

app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems,
  });
});

app.post("/work", function (req, res) {
});

app.get("/about", function (req, res) {
  res.render("about");
})

app.listen(3000, function () {
  console.log("Server started on port 3000");
});