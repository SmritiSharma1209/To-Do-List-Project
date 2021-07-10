//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true},{useUnifiedTopology: true});

const itemsSchema= {
  name:String
};

const Item= mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food for Lunch!! "
});

const item2 = new Item({
  name:"Cook Food for Dinner!!"
});

const item3 = new Item({
  name:"Eat Food and remain satisfied"
});

const defaultItems=[item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Items added successfully to database!!");
//   }
// });

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find( {}, function(err, foundItems){
    if(!err){

       if(foundItems.length===0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Items Added successfully to database!!");
          }
        });

        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const postedItem= new Item({
    name:itemName
  });

  if(listName=="Today"){
    postedItem.save();
    res.redirect("/");
  } else{

      List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(postedItem);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }



});

app.post("/delete", function(req,res){
  const checkItem=req.body.checkbox;
  const listtype=req.body.listname;

  if(listtype=="Today"){
    Item.findByIdAndRemove(checkItem, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listtype}, {$pull :{items: {_id:checkItem}}}, function(err, foundList){
      if(!err){
        foundList.save();
        res.redirect("/"+listtype);
      }
    });
  }


});


app.get("/:listType", function(req,res){
  const customListName =_.capitalize(req.params.listType);

  List.findOne({name:customListName},function(err, foundLists){
    if(!err){
      if(!foundLists){

        const customList= new List({
          name:customListName,
          items: defaultItems
        });

        customList.save();
        res.redirect("/"+ customListName);

      } else{
         res.render("list",  {listTitle: foundLists.name, newListItems: foundLists.items});
      }
    }

  });
});


 app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
