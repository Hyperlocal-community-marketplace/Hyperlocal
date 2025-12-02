import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Database,
  Code,
  Users,
  ShoppingCart,
  MessageSquare,
  Shield,
  Zap,
  Server,
  Layout,
  GitBranch,
  Package,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
} from "lucide-react";
import { MermaidDiagram } from "../components/MermaidDiagram";

export function ProjectDocumentationPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [selectedDiagram, setSelectedDiagram] = useState<string>("buyer");
  const [selectedUmlDiagram, setSelectedUmlDiagram] = useState<string>("er");

  const sections = [
    { id: "overview", name: "Overview", icon: BookOpen },
    { id: "architecture", name: "Architecture", icon: Layers },
    { id: "tech-stack", name: "Tech Stack", icon: Code },
    { id: "database", name: "Database", icon: Database },
    { id: "features", name: "Features", icon: Zap },
    { id: "workflows", name: "User Workflows", icon: GitBranch },
    { id: "api", name: "API Endpoints", icon: Server },
    { id: "setup", name: "Setup Guide", icon: Package },
  ];

  const techStack = {
    frontend: [
      { name: "React", version: "18.2.0", desc: "UI Framework" },
      { name: "TypeScript", version: "5.2.2", desc: "Type Safety" },
      { name: "Vite", version: "5.0.8", desc: "Build Tool" },
      { name: "Tailwind CSS", version: "3.3.6", desc: "Styling" },
      { name: "Framer Motion", version: "10.16.16", desc: "Animations" },
      { name: "Socket.IO Client", version: "4.7.2", desc: "Real-time" },
      { name: "Stripe", version: "19.2.0", desc: "Payments" },
    ],
    backend: [
      { name: "Node.js", version: "Latest", desc: "Runtime" },
      { name: "Express", version: "5.1.0", desc: "Web Framework" },
      { name: "MySQL", version: "3.15.3", desc: "Database" },
      { name: "JWT", version: "9.0.2", desc: "Authentication" },
      { name: "Socket.IO", version: "4.7.2", desc: "WebSocket" },
      { name: "Multer", version: "2.0.2", desc: "File Upload" },
      { name: "Stripe", version: "19.2.0", desc: "Payment API" },
    ],
  };

  const features = [
    {
      title: "Hyperlocal Commerce",
      icon: Zap,
      items: [
        "ZIP code-based product filtering",
        "Location-aware search",
        "Local delivery focus",
      ],
    },
    {
      title: "Shopping Experience",
      icon: ShoppingCart,
      items: [
        "Advanced product catalog",
        "Persistent shopping cart",
        "Multiple images per product",
        "Product reviews & ratings",
      ],
    },
    {
      title: "Payment Processing",
      icon: CreditCard,
      items: [
        "Stripe integration",
        "3D Secure support",
        "Automatic tax calculation",
        "Payment confirmation",
      ],
    },
    {
      title: "Real-time Chat",
      icon: MessageSquare,
      items: [
        "Socket.IO messaging",
        "Buyer-seller communication",
        "Typing indicators",
        "Message history",
      ],
    },
    {
      title: "User Management",
      icon: Users,
      items: [
        "JWT authentication",
        "Role-based access (Buyer/Seller/Admin)",
        "Profile management",
        "Avatar uploads",
      ],
    },
    {
      title: "Admin Panel",
      icon: Shield,
      items: [
        "User management",
        "Shop monitoring",
        "Product moderation",
        "Platform analytics",
      ],
    },
  ];

  const apiEndpoints = [
    {
      category: "Authentication",
      endpoints: [
        { method: "POST", path: "/api/user/register", desc: "User registration" },
        { method: "POST", path: "/api/user/login", desc: "User login" },
        { method: "POST", path: "/api/shop/register", desc: "Seller registration" },
        { method: "POST", path: "/api/shop/login", desc: "Seller login" },
        { method: "POST", path: "/api/admin/login", desc: "Admin login" },
      ],
    },
    {
      category: "Products",
      endpoints: [
        { method: "GET", path: "/api/product/all", desc: "Get all products" },
        { method: "GET", path: "/api/product/:id", desc: "Get product by ID" },
        { method: "POST", path: "/api/product/create", desc: "Create product" },
        { method: "PUT", path: "/api/product/:id", desc: "Update product" },
        { method: "DELETE", path: "/api/product/:id", desc: "Delete product" },
      ],
    },
    {
      category: "Orders",
      endpoints: [
        { method: "POST", path: "/api/order/create", desc: "Create order" },
        { method: "GET", path: "/api/order/user/:id", desc: "Get user orders" },
        { method: "GET", path: "/api/order/shop/:id", desc: "Get shop orders" },
        { method: "PUT", path: "/api/order/:id/status", desc: "Update order status" },
      ],
    },
    {
      category: "Chat",
      endpoints: [
        { method: "POST", path: "/api/conversation/create", desc: "Create conversation" },
        { method: "GET", path: "/api/conversation/user/:id", desc: "Get conversations" },
        { method: "GET", path: "/api/message/:id", desc: "Get messages" },
      ],
    },
    {
      category: "Payment",
      endpoints: [
        { method: "POST", path: "/api/payment/process", desc: "Process payment" },
      ],
    },
  ];

  const workflows = [
    {
      id: "buyer",
      title: "Buyer Workflow",
      color: "from-blue-500 to-cyan-500",
      steps: [
        { step: 1, title: "Registration", desc: "Create account with ZIP code" },
        { step: 2, title: "Browse Products", desc: "View local products filtered by location" },
        { step: 3, title: "Add to Cart", desc: "Select products and quantities" },
        { step: 4, title: "Checkout", desc: "Enter shipping info and payment details" },
        { step: 5, title: "Payment", desc: "Process Stripe payment" },
        { step: 6, title: "Track Order", desc: "Monitor order status and chat with seller" },
      ],
    },
    {
      id: "seller",
      title: "Seller Workflow",
      color: "from-purple-500 to-pink-500",
      steps: [
        { step: 1, title: "Shop Registration", desc: "Create seller account with shop details" },
        { step: 2, title: "Dashboard", desc: "View sales analytics and metrics" },
        { step: 3, title: "Add Products", desc: "Upload products with images and details" },
        { step: 4, title: "Manage Orders", desc: "Process and fulfill customer orders" },
        { step: 5, title: "Update Status", desc: "Change order status (Pending → Delivered)" },
        { step: 6, title: "Chat", desc: "Communicate with buyers" },
      ],
    },
    {
      id: "admin",
      title: "Admin Workflow",
      color: "from-red-500 to-orange-500",
      steps: [
        { step: 1, title: "Admin Login", desc: "Secure authentication" },
        { step: 2, title: "Dashboard", desc: "View platform statistics" },
        { step: 3, title: "User Management", desc: "Monitor and manage users" },
        { step: 4, title: "Shop Management", desc: "Approve/monitor sellers" },
        { step: 5, title: "Product Moderation", desc: "Review and moderate products" },
        { step: 6, title: "Order Monitoring", desc: "Oversee all platform orders" },
      ],
    },
  ];

  const databaseTables = [
    { name: "Users", count: "Buyers", desc: "Customer accounts with location" },
    { name: "Shops", count: "Sellers", desc: "Seller shops and profiles" },
    { name: "Admins", count: "Platform", desc: "Admin users" },
    { name: "Products", count: "Inventory", desc: "Product catalog" },
    { name: "ProductImages", count: "Media", desc: "Product images" },
    { name: "ProductReviews", count: "Feedback", desc: "User reviews" },
    { name: "ORDERS", count: "Transactions", desc: "Order records" },
    { name: "CONVERSATION", count: "Chats", desc: "Chat rooms" },
    { name: "MESSAGES", count: "Messages", desc: "Chat messages" },
    { name: "Locations", count: "ZIP Codes", desc: "Location data" },
  ];

  // Buyer Flow Diagram
  // Mermaid Workflow Diagrams
  const buyerFlowDiagram = `
flowchart TD
    Start([Visit Homepage]) --> Register[Register/Login with ZIP Code]
    Register --> Filter[Products Filtered by ZIP Code]
    Filter --> Browse{Choose Action}
    Browse -->|Search| Search[Browse & Search Products]
    Browse -->|View Details| Details[View Product Details]
    Search --> Cart[Add to Cart]
    Details --> Cart
    Cart --> Checkout[Checkout with Stripe Payment]
    Checkout --> OrderPlaced[Order Placed]
    OrderPlaced --> Track[Track Order]
    OrderPlaced --> Chat[Chat with Seller]
    Track --> End([Complete])
    Chat --> End

    style Start fill:#4ade80
    style Register fill:#8b5cf6
    style Filter fill:#10b981
    style Browse fill:#f59e0b
    style Cart fill:#ec4899
    style Checkout fill:#6366f1
    style OrderPlaced fill:#14b8a6
    style End fill:#22c55e
  `;

  const sellerFlowDiagram = `
flowchart TD
    Start([Register Shop]) --> Dashboard[Seller Dashboard]
    Dashboard --> Actions{Select Action}
    Actions -->|Add| AddProduct[Add Products with Images & Details]
    Actions -->|Manage| Inventory[Manage Inventory & Stock]
    AddProduct --> Orders[Receive Orders]
    Inventory --> Orders
    Orders --> UpdateStatus[Update Order Status]
    UpdateStatus --> Processing[Processing]
    Processing --> Shipped[Shipped]
    Shipped --> Activities{Seller Activities}
    Activities -->|Support| Chat[Chat with Buyers]
    Activities -->|Analytics| Revenue[Track Revenue & Analytics]
    Chat --> End([Complete])
    Revenue --> End

    style Start fill:#8b5cf6
    style Dashboard fill:#a855f7
    style Actions fill:#f59e0b
    style AddProduct fill:#ec4899
    style Inventory fill:#f59e0b
    style Orders fill:#3b82f6
    style UpdateStatus fill:#10b981
    style End fill:#22c55e
  `;

  const paymentFlowDiagram = `
flowchart TD
    Start([Cart Ready]) --> Shipping[Enter Shipping Information]
    Shipping --> CardDetails[Enter Card Details - Stripe Elements]
    CardDetails --> CreateIntent[Create Payment Intent via Backend API]
    CreateIntent --> StripeProcess[Stripe Processing with 3D Secure]
    StripeProcess --> Decision{Payment Result}
    Decision -->|Success| PaySuccess[Payment Successful]
    Decision -->|Failed| PayFailed[Payment Failed]
    PaySuccess --> CreateOrder[Create Order - Split by Shop]
    CreateOrder --> Confirm[Order Confirmation & Clear Cart]
    Confirm --> End1([Complete])
    PayFailed --> End2([Retry or Cancel])

    style Start fill:#3b82f6
    style CardDetails fill:#ec4899
    style CreateIntent fill:#f59e0b
    style StripeProcess fill:#10b981
    style Decision fill:#f59e0b
    style PaySuccess fill:#22c55e
    style PayFailed fill:#ef4444
    style Confirm fill:#14b8a6
    style End1 fill:#22c55e
    style End2 fill:#ef4444
  `;

  const dataFlowArchitectureDiagram = `
flowchart TD
    Client[Client Layer<br/>React + TypeScript] --> API[API Layer<br/>Express + Node.js]
    Client -.->|WebSocket| Socket[Socket.IO<br/>Real-time Chat]
    API --> Auth[JWT Auth<br/>Verify Token]
    API --> DB[(MySQL Database<br/>10 Tables)]
    API --> Stripe[Stripe API<br/>Payment Processing]
    Socket --> DB
    
    Auth -.->|Authenticated| API
    DB -.->|Data| API
    Stripe -.->|Payment Result| API
    API -.->|Response| Client

    style Client fill:#3b82f6
    style API fill:#8b5cf6
    style Auth fill:#f59e0b
    style Socket fill:#06b6d4
    style DB fill:#10b981
    style Stripe fill:#ec4899
  `;

  // Mermaid UML Diagrams
  const relationshipSchema = `
graph TB
    USERS[USER]
    SHOPS[SELLER]
    PRODUCTS[PRODUCT]
    ORDERS[ORDER]
    REVIEWS[REVIEW]
    MESSAGES[MESSAGE]
    LOCATIONS[LOCATIONS]
    
    UserId((UserId))
    Name((Name))
    Email((Email))
    
    SellerId((SellerId))
    StoreName((StoreName))
    SellerCategory((Seller_Category))
    
    ProductId((ProductId))
    ProdName((Product Name))
    Quantity((Quantity))
    Price((PriceAtPurchase))
    Status((Status))
    
    OrderId((OrderId))
    OrderDate((OrderDate))
    OrderStatus((Order Status))
    
    Comment((Comment))
    
    zipCode((zipCode))
    
    USERS --- UserId
    USERS --- Name
    USERS --- Email
    
    SHOPS --- SellerId
    SHOPS --- StoreName
    SHOPS --- SellerCategory
    
    PRODUCTS --- ProductId
    PRODUCTS --- ProdName
    PRODUCTS --- Quantity
    PRODUCTS --- Status
    
    ORDERS --- OrderId
    ORDERS --- OrderDate
    ORDERS --- OrderStatus
    ORDERS --- Price
    
    REVIEWS --- Comment
    
    LOCATIONS --- zipCode
    
    USERS ---|1| located_in{is_located_in}
    located_in ---|M| LOCATIONS
    
    SHOPS ---|1| shop_located{categorized_in}
    shop_located ---|1| LOCATIONS
    
    SHOPS ---|1| is_for{is_for}
    is_for ---|M| ORDERS
    
    SHOPS ---|1| lists{Lists}
    lists ---|M| PRODUCTS
    
    PRODUCTS ---|1| is_of{is_of}
    is_of ---|M| REVIEWS
    
    PRODUCTS ---|1| order_item{Order_item}
    order_item ---|M| ORDERS
    
    USERS ---|1| writes{writes}
    writes ---|M| REVIEWS
    
    USERS ---|1| places{places}
    places ---|1| ORDERS
    
    ORDERS ---|M| participates_seller{participates_in}
    participates_seller ---|M| MESSAGES
    
    USERS ---|M| participates_user{participates_in}
    participates_user ---|M| MESSAGES
    
    REVIEWS ---|M| is_for_review{is_for}
    is_for_review ---|1| PRODUCTS
    
    style USERS fill:#6366f1,stroke:#4f46e5,stroke-width:3px,color:#000
    style SHOPS fill:#8b5cf6,stroke:#7c3aed,stroke-width:3px,color:#000
    style PRODUCTS fill:#ec4899,stroke:#db2777,stroke-width:3px,color:#000
    style ORDERS fill:#f59e0b,stroke:#d97706,stroke-width:3px,color:#000
    style REVIEWS fill:#10b981,stroke:#059669,stroke-width:3px,color:#000
    style MESSAGES fill:#06b6d4,stroke:#0891b2,stroke-width:3px,color:#000
    style LOCATIONS fill:#14b8a6,stroke:#0d9488,stroke-width:3px,color:#000
    
    style UserId fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#000
    style Name fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#000
    style Email fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#000
    
    style SellerId fill:#ede9fe,stroke:#8b5cf6,stroke-width:2px,color:#000
    style StoreName fill:#ede9fe,stroke:#8b5cf6,stroke-width:2px,color:#000
    style SellerCategory fill:#ede9fe,stroke:#8b5cf6,stroke-width:2px,color:#000
    
    style ProductId fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#000
    style ProdName fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#000
    style Quantity fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#000
    style Status fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#000
    
    style OrderId fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000
    style OrderDate fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000
    style OrderStatus fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000
    style Price fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#000
    
    style Comment fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#000
    
    style zipCode fill:#ccfbf1,stroke:#14b8a6,stroke-width:2px,color:#000
    
    style located_in fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style shop_located fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style is_for fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style lists fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style is_of fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style order_item fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style writes fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style places fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style participates_seller fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style participates_user fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
    style is_for_review fill:#fbbf24,stroke:#f59e0b,stroke-width:2px
  `;

  const checkoutFlowDiagram = `
flowchart TD
    Start([User on Checkout Page]) --> ValidateCart{Cart Valid?}
    ValidateCart -->|No| ShowError[Show Validation Error]
    ShowError --> End1([End])
    ValidateCart -->|Yes| CreatePayment[Create Stripe Payment Intent]
    CreatePayment --> DisplayStripe[Display Stripe Payment Form]
    DisplayStripe --> ProcessPayment{Process Payment}
    ProcessPayment -->|3D Secure Required| Verify3DS[Verify 3D Secure]
    Verify3DS --> CheckPayment{Payment Success?}
    ProcessPayment -->|Direct| CheckPayment
    CheckPayment -->|Failed| PaymentError[Show Payment Error]
    PaymentError --> End2([End])
    CheckPayment -->|Success| SplitOrders[Split Order by Shop]
    SplitOrders --> CreateOrders[Create Orders in Database]
    CreateOrders --> ClearCart[Clear Shopping Cart]
    ClearCart --> ShowConfetti[Show Success Animation]
    ShowConfetti --> RedirectOrders[Redirect to Orders Page]
    RedirectOrders --> End3([End])

    style Start fill:#4ade80
    style End1 fill:#ef4444
    style End2 fill:#ef4444
    style End3 fill:#4ade80
    style ValidateCart fill:#f59e0b
    style ProcessPayment fill:#f59e0b
    style CheckPayment fill:#f59e0b
  `;

  const authFlowDiagram = `
flowchart TD
    Start([User Opens Login/Register]) --> EnterCreds[Enter Email, Password & ZIP Code]
    EnterCreds --> SelectAction{Login or Register?}
    SelectAction -->|Register| CheckExists[Check if User Exists]
    CheckExists -->|User Exists| DuplicateError[Show Duplicate Error]
    DuplicateError --> End1([End])
    CheckExists -->|New User| HashPassword[Hash Password with bcrypt]
    HashPassword --> CreateUser[Create User in Database]
    CreateUser --> GenToken1[Generate JWT Token]
    GenToken1 --> StoreToken1[Store Token in localStorage]
    StoreToken1 --> UpdateState1[Update Auth State]
    UpdateState1 --> RedirectDash1[Redirect to Dashboard]
    RedirectDash1 --> End2([Success])
    
    SelectAction -->|Login| ValidateCreds[Validate Credentials]
    ValidateCreds --> ComparePass{Password Match?}
    ComparePass -->|No| ShowError[Show Invalid Credentials]
    ShowError --> End3([End])
    ComparePass -->|Yes| GenToken2[Generate JWT Token]
    GenToken2 --> StoreToken2[Store Token in localStorage]
    StoreToken2 --> UpdateState2[Update Auth State]
    UpdateState2 --> RedirectDash2[Redirect to Dashboard]
    RedirectDash2 --> End4([Success])

    style Start fill:#4ade80
    style End1 fill:#ef4444
    style End2 fill:#4ade80
    style End3 fill:#ef4444
    style End4 fill:#4ade80
    style SelectAction fill:#f59e0b
    style ComparePass fill:#f59e0b
  `;

  const orderLifecycleDiagram = `
flowchart TD
    Start([Order Created & Paid]) --> Pending[Status: PENDING]
    Pending --> SellerReview{Seller Reviews Order}
    SellerReview -->|Accept| Processing[Status: PROCESSING]
    SellerReview -->|Reject| Cancel1[Status: CANCELLED]
    Cancel1 --> Refund1[Process Refund]
    Refund1 --> End1([Order Cancelled])
    
    Processing --> PrepareOrder[Seller Prepares Items]
    PrepareOrder --> SellerAction{Seller Action}
    SellerAction -->|Ship| Shipped[Status: SHIPPED]
    SellerAction -->|Cancel| Cancel2[Status: CANCELLED]
    Cancel2 --> Refund2[Process Refund]
    Refund2 --> End2([Order Cancelled])
    
    Shipped --> InTransit[Package in Transit]
    InTransit --> TrackingUpdates[Tracking Updates Available]
    TrackingUpdates --> CustomerReceives{Customer Receives?}
    CustomerReceives -->|Yes| Delivered[Status: DELIVERED]
    CustomerReceives -->|Lost/Damaged| Support[Contact Support]
    Support --> Resolution{Resolution}
    Resolution -->|Refund| Cancel3[Status: CANCELLED]
    Cancel3 --> End3([Order Cancelled])
    Resolution -->|Reship| Processing
    
    Delivered --> EnableReview[Enable Product Review]
    EnableReview --> OrderComplete([Order Complete])

    style Start fill:#4ade80
    style Pending fill:#3b82f6
    style Processing fill:#f59e0b
    style Shipped fill:#8b5cf6
    style Delivered fill:#10b981
    style Cancel1 fill:#ef4444
    style Cancel2 fill:#ef4444
    style Cancel3 fill:#ef4444
    style End1 fill:#ef4444
    style End2 fill:#ef4444
    style End3 fill:#ef4444
    style OrderComplete fill:#4ade80
    style SellerReview fill:#f59e0b
    style SellerAction fill:#f59e0b
    style CustomerReceives fill:#f59e0b
    style Resolution fill:#f59e0b
  `;

  const classDiagram = `
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password
        +string zipCode
        +string avatar
        +register()
        +login()
        +updateProfile()
        +placeOrder()
        +chatWithSeller()
    }

    class Shop {
        +int id
        +string name
        +string email
        +string zipCode
        +string description
        +register()
        +addProduct()
        +updateProduct()
        +processOrder()
        +chatWithBuyer()
    }

    class Product {
        +int id
        +string name
        +decimal price
        +int stock
        +int shopId
        +string[] images
        +create()
        +update()
        +delete()
        +addReview()
    }

    class Order {
        +int id
        +json cart
        +decimal totalPrice
        +string status
        +int shopId
        +create()
        +updateStatus()
        +getByUser()
        +getByShop()
    }

    class CartService {
        -CartItem[] items
        +addItem()
        +removeItem()
        +updateQuantity()
        +clearCart()
        +getTotal()
    }

    class AuthService {
        -string token
        +login()
        +register()
        +logout()
        +isAuthenticated()
        +getCurrentUser()
    }

    User "1" --> "*" Order : places
    Shop "1" --> "*" Product : owns
    Shop "1" --> "*" Order : receives
    Product "*" --> "1" Shop : belongs to
    Order "*" --> "1" User : placed by
    User --> CartService : uses
    User --> AuthService : authenticates
    Shop --> AuthService : authenticates
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-12 w-12" />
              <h1 className="text-5xl font-bold">Hyperlocal Marketplace</h1>
            </div>
            <p className="text-xl text-white/90">
              Complete Project Documentation & Architecture
            </p>
            <div className="flex gap-4 justify-center mt-6 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="font-semibold">React + TypeScript</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="font-semibold">Node.js + MySQL</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="font-semibold">Socket.IO + Stripe</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Project Overview
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                <strong className="text-white">Hyperlocal Marketplace</strong> is a
                full-stack e-commerce platform that connects local buyers with sellers
                in their ZIP code area. The platform supports three user roles:{" "}
                <span className="text-blue-400 font-semibold">Buyers</span>,{" "}
                <span className="text-purple-400 font-semibold">Sellers</span>, and{" "}
                <span className="text-red-400 font-semibold">Admins</span>, each with
                dedicated dashboards and functionality.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Hyperlocal Focus",
                  desc: "Products filtered by ZIP code for local commerce",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  icon: CreditCard,
                  title: "Stripe Payments",
                  desc: "Secure payment processing with 3D Secure support",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: MessageSquare,
                  title: "Real-time Chat",
                  desc: "Socket.IO powered messaging between users",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: ShoppingCart,
                  title: "Order Management",
                  desc: "Complete order lifecycle tracking",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: Shield,
                  title: "JWT Security",
                  desc: "Secure role-based access control",
                  color: "from-red-500 to-rose-500",
                },
                {
                  icon: Activity,
                  title: "Real-time Updates",
                  desc: "Live notifications and status updates",
                  color: "from-indigo-500 to-purple-500",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${item.color} mb-4`}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "User Roles", value: "3", icon: Users },
                { label: "API Endpoints", value: "25+", icon: Server },
                { label: "Database Tables", value: "10", icon: Database },
                { label: "Features", value: "50+", icon: CheckCircle },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700"
                >
                  <stat.icon className="h-8 w-8 text-primary mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Architecture Section */}
        {activeSection === "architecture" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Layers className="h-8 w-8 text-primary" />
                System Architecture
              </h2>

              {/* Three-Tier Architecture Diagram */}
              <div className="space-y-8">
                {/* Client Layer */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border-2 border-blue-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Layout className="h-6 w-6 text-blue-400" />
                    <h3 className="text-2xl font-bold">Client Layer</h3>
                    <span className="text-sm text-gray-400 ml-auto">
                      React + TypeScript + Vite
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-blue-400 font-semibold mb-2">
                        Buyer Dashboard
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Product Browsing</li>
                        <li>• Shopping Cart</li>
                        <li>• Order Tracking</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-purple-400 font-semibold mb-2">
                        Seller Dashboard
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Product Management</li>
                        <li>• Order Processing</li>
                        <li>• Analytics</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-red-400 font-semibold mb-2">
                        Admin Dashboard
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• User Management</li>
                        <li>• Platform Monitoring</li>
                        <li>• Content Moderation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRight className="h-8 w-8 text-primary rotate-90" />
                    <span className="text-sm text-gray-400">
                      HTTP/HTTPS + WebSocket
                    </span>
                  </div>
                </div>

                {/* API Layer */}
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border-2 border-purple-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Server className="h-6 w-6 text-purple-400" />
                    <h3 className="text-2xl font-bold">API Layer</h3>
                    <span className="text-sm text-gray-400 ml-auto">
                      Express.js + Node.js
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["User Routes", "Shop Routes", "Product Routes", "Order Routes", "Payment Routes", "Chat Routes", "Admin Routes", "Middleware"].map(
                      (route, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-800/50 rounded-lg p-3 text-center"
                        >
                          <div className="text-sm font-semibold text-purple-300">
                            {route}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center gap-12">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRight className="h-8 w-8 text-primary rotate-90" />
                    <span className="text-sm text-gray-400">MySQL Queries</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRight className="h-8 w-8 text-primary rotate-90" />
                    <span className="text-sm text-gray-400">External APIs</span>
                  </div>
                </div>

                {/* Data Layer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-6 border-2 border-green-500/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="h-6 w-6 text-green-400" />
                      <h3 className="text-xl font-bold">Database Layer</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>• MySQL Database</div>
                      <div>• 10 Tables</div>
                      <div>• Foreign Key Relations</div>
                      <div>• Indexed Queries</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6 border-2 border-orange-500/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="h-6 w-6 text-orange-400" />
                      <h3 className="text-xl font-bold">External Services</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div>• Stripe Payment API</div>
                      <div>• Socket.IO Server</div>
                      <div>• File Storage (Multer)</div>
                      <div>• JWT Authentication</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tech Stack Section */}
        {activeSection === "tech-stack" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Code className="h-8 w-8 text-primary" />
                Technology Stack
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Frontend */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    Frontend Technologies
                  </h3>
                  <div className="space-y-3">
                    {techStack.frontend.map((tech, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-lg">{tech.name}</span>
                          <span className="text-sm text-blue-400">
                            v{tech.version}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">{tech.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Backend */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    Backend Technologies
                  </h3>
                  <div className="space-y-3">
                    {techStack.backend.map((tech, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-lg">{tech.name}</span>
                          <span className="text-sm text-purple-400">
                            v{tech.version}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">{tech.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Database Section */}
        {activeSection === "database" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Database className="h-8 w-8 text-primary" />
                Database Schema
              </h2>

              {/* UML Diagram Selector */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedUmlDiagram("er")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedUmlDiagram === "er"
                      ? "bg-primary text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  ER Diagram
                </button>
                <button
                  onClick={() => setSelectedUmlDiagram("class")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedUmlDiagram === "class"
                      ? "bg-primary text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Class Diagram
                </button>
              </div>

              {/* ER Diagram */}
              {selectedUmlDiagram === "er" && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 mb-6">
                  <h3 className="text-xl font-bold mb-4">Entity-Relationship Diagram</h3>
                  <MermaidDiagram chart={relationshipSchema} />
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-semibold text-indigo-400 mb-2">Key Relationships</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Locations linked to Users and Shops via ZIP code</li>
                        <li>• Shops own multiple Products</li>
                        <li>• Products have multiple Images and Reviews</li>
                        <li>• Orders split by Shop for multi-vendor support</li>
                        <li>• Conversations enable real-time chat</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-semibold text-purple-400 mb-2">Database Features</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Geospatial queries for proximity search</li>
                        <li>• Multi-vendor order management</li>
                        <li>• Real-time messaging support</li>
                        <li>• Product ratings and reviews</li>
                        <li>• Secure password hashing (bcrypt)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Class Diagram */}
              {selectedUmlDiagram === "class" && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 mb-6">
                  <h3 className="text-xl font-bold mb-4">Class Diagram</h3>
                  <MermaidDiagram chart={classDiagram} />
                  <div className="mt-6 bg-gray-800 p-4 rounded">
                    <h4 className="font-semibold text-green-400 mb-2">Core Business Logic</h4>
                    <p className="text-sm text-gray-400">
                      The class diagram shows the object-oriented structure of our application with services handling authentication, cart management, and business operations.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {databaseTables.map((table, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 border border-gray-700 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-mono font-bold text-lg text-primary">
                        {table.name}
                      </div>
                      <Database className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{table.count}</div>
                    <div className="text-sm text-gray-500">{table.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Section */}
        {activeSection === "features" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary" />
                Platform Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-400">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Workflows Section */}
        {activeSection === "workflows" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <GitBranch className="h-8 w-8 text-primary" />
                User Workflows & Data Flow
              </h2>

              {/* Diagram Selector */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedDiagram("buyer")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "buyer"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Buyer Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("seller")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "seller"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Seller Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("payment")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "payment"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Payment Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("dataflow")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "dataflow"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Data Flow Architecture
                </button>
              </div>

              {/* Workflow Diagrams */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                {selectedDiagram === "buyer" && (
                  <MermaidDiagram chart={buyerFlowDiagram} />
                )}
                
                {selectedDiagram === "seller" && (
                  <MermaidDiagram chart={sellerFlowDiagram} />
                )}

                {selectedDiagram === "payment" && (
                  <MermaidDiagram chart={paymentFlowDiagram} />
                )}
                
                {selectedDiagram === "dataflow" && (
                  <MermaidDiagram chart={dataFlowArchitectureDiagram} />
                )}
              </div>

              {/* Workflow Descriptions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-blue-600">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Buyer Journey</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Register with ZIP code</li>
                    <li>• Browse local products</li>
                    <li>• Add to cart & checkout</li>
                    <li>• Stripe payment processing</li>
                    <li>• Track orders & chat with sellers</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-purple-600">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Seller Operations</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Create shop profile</li>
                    <li>• Add products with images</li>
                    <li>• Manage inventory</li>
                    <li>• Process orders</li>
                    <li>• Communicate with buyers</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-green-600">
                      <Server className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">System Architecture</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• React frontend layer</li>
                    <li>• Express API middleware</li>
                    <li>• JWT authentication</li>
                    <li>• MySQL database</li>
                    <li>• Real-time Socket.IO</li>
                  </ul>
                </div>
              </div>

              {/* Data Flow Diagrams */}
              <div className="mt-8 space-y-6">
                <h3 className="text-2xl font-bold mb-4">Data Flow Diagrams</h3>
                <p className="text-gray-400 mb-6">
                  These flowcharts illustrate the complete workflow with start/end nodes, decision points, and process steps.
                </p>
                
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Authentication Workflow
                  </h4>
                  <MermaidDiagram chart={authFlowDiagram} />
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Checkout & Payment Workflow
                  </h4>
                  <MermaidDiagram chart={checkoutFlowDiagram} />
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Order Lifecycle Workflow
                  </h4>
                  <MermaidDiagram chart={orderLifecycleDiagram} />
                </div>
              </div>

              {/* Traditional Flow (Expandable) */}
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4">Step-by-Step Workflows</h3>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedFlow(
                            expandedFlow === workflow.id ? null : workflow.id
                          )
                        }
                        className={`w-full p-6 flex items-center justify-between bg-gradient-to-r ${workflow.color} hover:opacity-90 transition-all`}
                      >
                        <div className="flex items-center gap-4">
                          <Users className="h-8 w-8" />
                          <div className="text-left">
                            <h3 className="text-2xl font-bold">{workflow.title}</h3>
                            <p className="text-white/80">
                              {workflow.steps.length} steps
                            </p>
                          </div>
                        </div>
                        {expandedFlow === workflow.id ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </button>

                      {expandedFlow === workflow.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-6"
                        >
                          <div className="space-y-4">
                            {workflow.steps.map((step, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-4"
                              >
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${workflow.color} flex items-center justify-center font-bold text-lg`}
                                  >
                                    {step.step}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-lg mb-1">
                                    {step.title}
                                  </div>
                                  <div className="text-gray-400">{step.desc}</div>
                                </div>
                                {idx < workflow.steps.length - 1 && (
                                  <ArrowRight className="h-6 w-6 text-gray-600 self-center rotate-90 md:rotate-0" />
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Section */}
        {activeSection === "api" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Server className="h-8 w-8 text-primary" />
                API Endpoints
              </h2>

              <div className="space-y-6">
                {apiEndpoints.map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900/50 rounded-xl p-6 border border-gray-700"
                  >
                    <h3 className="text-xl font-bold mb-4 text-primary">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.endpoints.map((endpoint, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all"
                        >
                          <span
                            className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                              endpoint.method === "GET"
                                ? "bg-green-600/20 text-green-400"
                                : endpoint.method === "POST"
                                ? "bg-blue-600/20 text-blue-400"
                                : endpoint.method === "PUT"
                                ? "bg-yellow-600/20 text-yellow-400"
                                : "bg-red-600/20 text-red-400"
                            }`}
                          >
                            {endpoint.method}
                          </span>
                          <code className="font-mono text-sm text-gray-300 flex-1">
                            {endpoint.path}
                          </code>
                          <span className="text-sm text-gray-500">
                            {endpoint.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socket.IO Events */}
              <div className="mt-8 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl p-6 border-2 border-cyan-500/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Socket.IO Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-cyan-400 mb-2">
                      Client → Server
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-800/50 p-2 rounded">
                        join-conversation
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded">send-message</div>
                      <div className="bg-gray-800/50 p-2 rounded">typing</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-400 mb-2">
                      Server → Client
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-800/50 p-2 rounded">
                        receive-message
                      </div>
                      <div className="bg-gray-800/50 p-2 rounded">user-typing</div>
                      <div className="bg-gray-800/50 p-2 rounded">error</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Setup Section */}
        {activeSection === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                Setup Instructions
              </h2>

              {/* Prerequisites */}
              <div className="mb-8 bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">
                  Prerequisites
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Node.js v16 or higher",
                    "MySQL v8 or higher",
                    "npm or yarn",
                    "Git",
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-yellow-400" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backend Setup */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-400">
                  Backend Setup
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Navigate to backend",
                      code: "cd db2_test",
                    },
                    {
                      step: "2",
                      title: "Install dependencies",
                      code: "npm install",
                    },
                    {
                      step: "3",
                      title: "Create config/.env file",
                      code: `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hyperlocal_marketplace
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_...`,
                    },
                    {
                      step: "4",
                      title: "Setup database",
                      code: "mysql -u root -p < DATABASE_SETUP.sql",
                    },
                    {
                      step: "5",
                      title: "Start server",
                      code: "npm start",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      <pre className="bg-gray-950 p-3 rounded text-sm text-green-400 overflow-x-auto">
                        {item.code}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frontend Setup */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-blue-400">
                  Frontend Setup
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Navigate to frontend", code: "cd frontend" },
                    { step: "2", title: "Install dependencies", code: "npm install" },
                    {
                      step: "3",
                      title: "Create .env file",
                      code: `VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_URL=http://localhost:3000/api`,
                    },
                    { step: "4", title: "Start dev server", code: "npm run dev" },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      <pre className="bg-gray-950 p-3 rounded text-sm text-green-400 overflow-x-auto">
                        {item.code}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Credentials */}
              <div className="mt-8 bg-red-600/10 border border-red-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  Default Admin Credentials
                </h3>
                <div className="bg-gray-950 p-4 rounded font-mono text-sm">
                  <div className="text-gray-400">Email:</div>
                  <div className="text-white mb-2">admin@hyperlocal.com</div>
                  <div className="text-gray-400">Password:</div>
                  <div className="text-white">Admin123!</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
