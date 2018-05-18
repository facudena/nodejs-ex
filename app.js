var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var multer = require("multer");
var cloudinary = require("cloudinary");
var method_override = require("method-override");
var app_password = "0027";

cloudinary.config({
    cloud_name: "fdn027",
    api_key: "538654143569614",
    api_secret: "-6hvScRuaUCZLQ5pFmkfAB2rbig"
});

var app = express();

//Coneccion a la base de datos
mongoose.connect("mongodb://localhost/thefoldersdb");
//Define el uso de body parser y multer para express js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: "./uploads"}));
app.use(method_override("_method"));
//MVC definir schema
var productSchema = {
    title: String,
    description: String,
    marca: String,
    nart: Number,
    ean: Number,
    price: Number,
    imageUrl: String
};

//genera modelo  a partir de schema 
var Product = mongoose.model("Product", productSchema);

//set view engine to jade
app.set("view engine","jade");
//set assets folder to public
app.use(express.static("public"));

//Escucha y Responde a solicitud GET
app.get("/", function(req,res){


    res.render("index");
});

app.get("/nosotros", function(req,res){
    res.render("nosotros");
});

app.get("/contact", function(req,res){
    res.render("contact");
});

//muestra todos los productos/objetos de la base de datos y los carga a una variable
app.get("/productos",function(req,res){
    Product.find(function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_cargados",{ products: documento });
    });
});
//boncahier
app.get("/productos/productos_boncahier",function(req,res){
    Product.find({ $or: [ { description: "boncahier" }, {description: "Boncahier" }, {marca: "BONCAHIER" } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_boncahier",{ products: documento });
    });
});
//flame tree
app.get("/productos/productos_flame",function(req,res){
    Product.find({ $or: [ { description: "flame tree" }, {description: "Flame tree" }, {marca: "FLAME TREE" } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_flame",{ products: documento });
    });
});
//life canvas
app.get("/productos/productos_life",function(req,res){
    Product.find({ $or: [ { description: "life canvas" }, {description: "Life canvas" }, {marca: "LIFE CANVAS" } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_life",{ products: documento });
    });
});
//watercolour
app.get("/productos/productos_watercolour",function(req,res){
    Product.find({ $or: [ { description: "watercolour" }, {description: "Watercolour" }, {marca: "WATERCOLOUR BOOKS" } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_watercolour",{ products: documento });
    });
});
//otros
app.get("/productos/productos_otros",function(req,res){
    Product.find({ $or: [ { description: "otros" }, {description: "Otros" }, {marca: "OTROS" } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_otros",{ products: documento });
    });
});

//pagina de logeo de admin
app.get("/admin",function(req,res){
    res.render("admin/admform");
});
//login de admin if true redirecciona al index del admin
app.post("/admin",function(req,res){
    if(req.body.password == app_password){
        Product.find(function(error,documento){
            if(error){ console.log(error); }
            res.render("admin/index",{ products: documento });
        });
    }else{
        res.redirect("/");
    }
});

//editar productos
app.get("/productos/edit/:id",function(req,res){
    var id_producto = req.params.id;

    Product.findOne({"_id": id_producto},function(error,producto){
        console.log(producto);
        res.render("productos/edit",{product: producto});
    });

});

app.put("/productos/:id",function(req,res){
    if(req.body.password == app_password){
        var data = {
            title: req.body.title,
            description: req.body.description,
            marca: req.body.marca,
            nart: req.body.nart,
            ean: req.body.ean,
            price: req.body.price
        };
        if(req.files.hasOwnProperty("imageUrl")){
            cloudinary.uploader.upload(req.files.imageUrl.path, function(result) {  
                data.imageUrl = result.url;
    
                Product.update({"_id": req.params.id},data,function(product){
                    res.redirect("/productos");
                });
              }
            );

            
        }else{
            Product.update({"_id": req.params.id},data,function(product){
                res.redirect("/productos");
            });
        }
    }else {
        res.redirect("/");
    }
});

//crea productos y los guarda a la base de dato usando HTTP POST y el modelo schema creado
app.post("/productos",function(req,res){
    if(req.body.password == app_password){
        var data = {
            title: req.body.title,
            description: req.body.description,
            marca: req.body.marca,
            nart: req.body.nart,
            ean: req.body.ean,
            price: req.body.price,
            imageUrl: ""
        };

        var product = new Product(data);

        if(req.files.hasOwnProperty("imageUrl")){
            cloudinary.uploader.upload(req.files.imageUrl.path, function(result) {  
                product.imageUrl = result.url;
    
                product.save(function(err){
                    console.log(product);
                    res.render("productos/new");
                });
              }
            );
        }else{
            product.save(function(err){
                console.log(product);
                res.render("productos/new");
            });
        }

        
    }else{
        res.render("index");
    }
});

app.get("/productos/new",function(req,res){
    res.render("productos/new");
});
//Eliminar productos de base de dato
app.get("/productos/delete/:id",function(req,res){
    var id = req.params.id;
    Product.findOne({"_id": id},function(err,producto){
        res.render("productos/delete",{ product: producto });
    });
});
app.delete("/productos/:id",function(req,res){
    var id = req.params.id;
    if(req.body.password == app_password){
        Product.remove({"_id": id},function(err){
            if(err) { console.log(err); }
            res.redirect("/admin");
        });

    }else{
        res.redirect("/");
    }

});

//buscador
app.post("/busqueda",function(req,res){
    
    Product.find( { $text: { $search: req.body.search } }, function(error,documento){
//    Product.find({ $or: [ { description: req.body.search }, {description: req.body.search }, {marca: req.body.search } ] }, function(error,documento){
        if(error){ console.log(error); }
        res.render("productos/productos_busqueda",{ products: documento });
    });
    
});

app.listen(8080);