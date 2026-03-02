import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Nat "mo:core/Nat";



actor {
  // Product definition
  type Product = {
    id : Nat;
    name : Text;
    price : Float;
    imageUrl : Text;
    category : Category;
  };

  type Category = {
    #mens;
    #womens;
    #shoes;
    #tops;
    #bottoms;
    #dresses;
    #accessories;
  };

  var productsMap = Map.empty<Nat, Product>();
  var nextProductId = 1;

  // Order definition
  type OrderT = {
    id : Nat;
    items : [OrderItem];
    total : Float;
    status : OrderStatus;
    timestamp : Time.Time;
  };

  module OrderT {
    public func compare(a : OrderT, b : OrderT) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type OrderItem = {
    product : Product;
    quantity : Nat;
  };

  type OrderStatus = {
    #processing;
    #confirmed;
    #shipped;
    #delivered;
  };

  var ordersMap = Map.empty<Nat, OrderT>();
  var nextOrderId = 1;

  func getProduct(productId : Nat) : Product {
    switch (productsMap.get(productId)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product does not exist") };
    };
  };

  // Product catalog functions
  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    productsMap.values().toArray().filter(func(p) { p.category == category });
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    productsMap.values().toArray().filter(
      func(p) { p.name.contains(#text searchTerm) }
    );
  };

  public shared ({ caller }) func addProduct(name : Text, price : Float, imageUrl : Text, category : Category) : async () {
    let product : Product = {
      id = nextProductId;
      name;
      price;
      imageUrl;
      category;
    };
    productsMap.add(nextProductId, product);
    nextProductId += 1;
  };

  // Order functions
  public shared ({ caller }) func placeOrder(items : [OrderItem]) : async Nat {
    let total = items.foldLeft(0.0, func(acc, item) { acc + (item.product.price * item.quantity.toFloat()) });
    let order : OrderT = {
      id = nextOrderId;
      items;
      total;
      status = #processing;
      timestamp = Time.now();
    };
    ordersMap.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async OrderT {
    switch (ordersMap.get(orderId)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order does not exist") };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    switch (ordersMap.get(orderId)) {
      case (?order) {
        ordersMap.add(
          orderId,
          {
            id = order.id;
            items = order.items;
            total = order.total;
            status;
            timestamp = order.timestamp;
          },
        );
      };
      case (null) { Runtime.trap("Order does not exist") };
    };
  };

  public shared ({ caller }) func initializeProducts() : async () {
    let products : [Product] = [
      // Men's Products
      {
        id = nextProductId;
        name = "Men's Classic Shirt";
        price = 29.99;
        imageUrl = "ic://mens-classic-shirt.png";
        category = #mens;
      },
      {
        id = nextProductId + 1;
        name = "Men's Trousers";
        price = 39.99;
        imageUrl = "ic://mens-trousers.png";
        category = #mens;
      },
      {
        id = nextProductId + 2;
        name = "Men's Jacket";
        price = 59.99;
        imageUrl = "ic://mens-jacket.png";
        category = #mens;
      },
      // Women's Products
      {
        id = nextProductId + 3;
        name = "Women's Dress";
        price = 49.99;
        imageUrl = "ic://womens-dress.png";
        category = #womens;
      },
      {
        id = nextProductId + 4;
        name = "Women's Blouse";
        price = 34.99;
        imageUrl = "ic://womens-blouse.png";
        category = #womens;
      },
      {
        id = nextProductId + 5;
        name = "Women's Skirt";
        price = 29.99;
        imageUrl = "ic://womens-skirt.png";
        category = #womens;
      },
      // Shoes
      {
        id = nextProductId + 6;
        name = "Running Shoes";
        price = 79.99;
        imageUrl = "ic://running-shoes.png";
        category = #shoes;
      },
      {
        id = nextProductId + 7;
        name = "Dress Boots";
        price = 99.99;
        imageUrl = "ic://dress-boots.png";
        category = #shoes;
      },
      {
        id = nextProductId + 8;
        name = "Sneakers";
        price = 54.99;
        imageUrl = "ic://sneakers.png";
        category = #shoes;
      },
      // Existing Categories
      {
        id = nextProductId + 9;
        name = "Classic White T-Shirt";
        price = 19.99;
        imageUrl = "ic://classic-white-tshirt.png";
        category = #tops;
      },
      {
        id = nextProductId + 10;
        name = "Denim Jeans";
        price = 49.99;
        imageUrl = "ic://denim-jeans.png";
        category = #bottoms;
      },
      {
        id = nextProductId + 11;
        name = "Summer Dress";
        price = 39.99;
        imageUrl = "ic://summer-dress.png";
        category = #dresses;
      },
      {
        id = nextProductId + 12;
        name = "Leather Belt";
        price = 24.99;
        imageUrl = "ic://leather-belt.png";
        category = #accessories;
      },
    ];

    for (product in products.values()) {
      productsMap.add(product.id, product);
    };

    nextProductId += products.size();
  };

  // Category conversion function
  public shared ({ caller }) func getCategoryByString(categoryStr : Text) : async Category {
    switch (categoryStr) {
      case ("mens") { #mens };
      case ("womens") { #womens };
      case ("shoes") { #shoes };
      case ("tops") { #tops };
      case ("bottoms") { #bottoms };
      case ("dresses") { #dresses };
      case ("accessories") { #accessories };
      case (_) { Runtime.trap("Invalid category") };
    };
  };

  // Category comparison
  func compareCategories(a : Category, b : Category) : Order.Order {
    if (a == b) { #equal } else { #less };
  };
};
