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
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
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
  const buyerFlowNodes: Node[] = [
    {
      id: "1",
      type: "input",
      data: { label: "🌐 Visit Homepage" },
      position: { x: 250, y: 0 },
      style: { background: "#3b82f6", color: "white", border: "2px solid #2563eb" },
    },
    {
      id: "2",
      data: { label: "🔐 Register/Login\n(with ZIP Code)" },
      position: { x: 250, y: 100 },
      style: { background: "#8b5cf6", color: "white", border: "2px solid #7c3aed" },
    },
    {
      id: "3",
      data: { label: "📍 Products Filtered\nby ZIP Code" },
      position: { x: 250, y: 200 },
      style: { background: "#10b981", color: "white", border: "2px solid #059669" },
    },
    {
      id: "4",
      data: { label: "🔍 Browse & Search\nProducts" },
      position: { x: 100, y: 300 },
      style: { background: "#f59e0b", color: "white", border: "2px solid #d97706" },
    },
    {
      id: "5",
      data: { label: "👁️ View Product\nDetails" },
      position: { x: 400, y: 300 },
      style: { background: "#f59e0b", color: "white", border: "2px solid #d97706" },
    },
    {
      id: "6",
      data: { label: "🛒 Add to Cart" },
      position: { x: 250, y: 400 },
      style: { background: "#ec4899", color: "white", border: "2px solid #db2777" },
    },
    {
      id: "7",
      data: { label: "💳 Checkout\n(Stripe Payment)" },
      position: { x: 250, y: 500 },
      style: { background: "#6366f1", color: "white", border: "2px solid #4f46e5" },
    },
    {
      id: "8",
      data: { label: "✅ Order Placed" },
      position: { x: 250, y: 600 },
      style: { background: "#14b8a6", color: "white", border: "2px solid #0d9488" },
    },
    {
      id: "9",
      type: "output",
      data: { label: "📦 Track Order\n💬 Chat with Seller" },
      position: { x: 250, y: 700 },
      style: { background: "#22c55e", color: "white", border: "2px solid #16a34a" },
    },
  ];

  const buyerFlowEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-3", source: "2", target: "3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e3-4", source: "3", target: "4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e3-5", source: "3", target: "5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e4-6", source: "4", target: "6", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e5-6", source: "5", target: "6", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e6-7", source: "6", target: "7", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e7-8", source: "7", target: "8", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e8-9", source: "8", target: "9", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  ];

  // Seller Flow Diagram
  const sellerFlowNodes: Node[] = [
    {
      id: "s1",
      type: "input",
      data: { label: "🏪 Register Shop" },
      position: { x: 250, y: 0 },
      style: { background: "#8b5cf6", color: "white", border: "2px solid #7c3aed" },
    },
    {
      id: "s2",
      data: { label: "📊 Seller Dashboard" },
      position: { x: 250, y: 100 },
      style: { background: "#a855f7", color: "white", border: "2px solid #9333ea" },
    },
    {
      id: "s3",
      data: { label: "➕ Add Products\n(Images, Details)" },
      position: { x: 100, y: 200 },
      style: { background: "#ec4899", color: "white", border: "2px solid #db2777" },
    },
    {
      id: "s4",
      data: { label: "📦 Manage Inventory" },
      position: { x: 400, y: 200 },
      style: { background: "#f59e0b", color: "white", border: "2px solid #d97706" },
    },
    {
      id: "s5",
      data: { label: "🔔 Receive Orders" },
      position: { x: 250, y: 300 },
      style: { background: "#3b82f6", color: "white", border: "2px solid #2563eb" },
    },
    {
      id: "s6",
      data: { label: "📝 Update Order Status\n(Processing→Shipped)" },
      position: { x: 250, y: 400 },
      style: { background: "#10b981", color: "white", border: "2px solid #059669" },
    },
    {
      id: "s7",
      data: { label: "💬 Chat with Buyers" },
      position: { x: 100, y: 500 },
      style: { background: "#06b6d4", color: "white", border: "2px solid #0891b2" },
    },
    {
      id: "s8",
      type: "output",
      data: { label: "💰 Track Revenue\n& Analytics" },
      position: { x: 400, y: 500 },
      style: { background: "#22c55e", color: "white", border: "2px solid #16a34a" },
    },
  ];

  const sellerFlowEdges: Edge[] = [
    { id: "es1-2", source: "s1", target: "s2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es2-3", source: "s2", target: "s3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es2-4", source: "s2", target: "s4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es3-5", source: "s3", target: "s5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es4-5", source: "s4", target: "s5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es5-6", source: "s5", target: "s6", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es6-7", source: "s6", target: "s7", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "es6-8", source: "s6", target: "s8", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  ];

  // Data Flow Architecture
  const dataFlowNodes: Node[] = [
    {
      id: "client",
      data: { label: "🖥️ Client Layer\n(React + TypeScript)" },
      position: { x: 250, y: 0 },
      style: { background: "#3b82f6", color: "white", border: "2px solid #2563eb", width: 200 },
    },
    {
      id: "api",
      data: { label: "⚡ API Layer\n(Express + Node.js)" },
      position: { x: 250, y: 150 },
      style: { background: "#8b5cf6", color: "white", border: "2px solid #7c3aed", width: 200 },
    },
    {
      id: "auth",
      data: { label: "🔐 JWT Auth" },
      position: { x: 50, y: 150 },
      style: { background: "#f59e0b", color: "white", border: "2px solid #d97706", width: 120 },
    },
    {
      id: "socket",
      data: { label: "💬 Socket.IO" },
      position: { x: 450, y: 150 },
      style: { background: "#06b6d4", color: "white", border: "2px solid #0891b2", width: 120 },
    },
    {
      id: "db",
      data: { label: "🗄️ MySQL Database\n(10 Tables)" },
      position: { x: 150, y: 300 },
      style: { background: "#10b981", color: "white", border: "2px solid #059669", width: 180 },
    },
    {
      id: "stripe",
      data: { label: "💳 Stripe API\n(Payments)" },
      position: { x: 350, y: 300 },
      style: { background: "#ec4899", color: "white", border: "2px solid #db2777", width: 150 },
    },
  ];

  const dataFlowEdges: Edge[] = [
    { id: "client-api", source: "client", target: "api", label: "HTTP/HTTPS", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "client-socket", source: "client", target: "socket", label: "WebSocket", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "api-auth", source: "api", target: "auth", label: "Verify Token", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "api-db", source: "api", target: "db", label: "SQL Queries", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "api-stripe", source: "api", target: "stripe", label: "Process Payment", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "socket-db", source: "socket", target: "db", label: "Save Messages", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  ];

  // Payment Flow Diagram
  const paymentFlowNodes: Node[] = [
    {
      id: "p1",
      type: "input",
      data: { label: "🛒 Cart Ready" },
      position: { x: 250, y: 0 },
      style: { background: "#3b82f6", color: "white", border: "2px solid #2563eb" },
    },
    {
      id: "p2",
      data: { label: "📋 Enter Shipping\nInformation" },
      position: { x: 250, y: 100 },
      style: { background: "#8b5cf6", color: "white", border: "2px solid #7c3aed" },
    },
    {
      id: "p3",
      data: { label: "💳 Enter Card Details\n(Stripe Elements)" },
      position: { x: 250, y: 200 },
      style: { background: "#ec4899", color: "white", border: "2px solid #db2777" },
    },
    {
      id: "p4",
      data: { label: "🔄 Create Payment Intent\n(Backend API)" },
      position: { x: 250, y: 300 },
      style: { background: "#f59e0b", color: "white", border: "2px solid #d97706" },
    },
    {
      id: "p5",
      data: { label: "🏦 Stripe Processing\n(3D Secure)" },
      position: { x: 250, y: 400 },
      style: { background: "#10b981", color: "white", border: "2px solid #059669" },
    },
    {
      id: "p6",
      data: { label: "✅ Payment Successful" },
      position: { x: 100, y: 500 },
      style: { background: "#22c55e", color: "white", border: "2px solid #16a34a" },
    },
    {
      id: "p7",
      data: { label: "❌ Payment Failed" },
      position: { x: 400, y: 500 },
      style: { background: "#ef4444", color: "white", border: "2px solid #dc2626" },
    },
    {
      id: "p8",
      data: { label: "📦 Create Order\n(Split by Shop)" },
      position: { x: 100, y: 600 },
      style: { background: "#6366f1", color: "white", border: "2px solid #4f46e5" },
    },
    {
      id: "p9",
      type: "output",
      data: { label: "🎉 Order Confirmation\n& Clear Cart" },
      position: { x: 100, y: 700 },
      style: { background: "#14b8a6", color: "white", border: "2px solid #0d9488" },
    },
  ];

  const paymentFlowEdges: Edge[] = [
    { id: "ep1-2", source: "p1", target: "p2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "ep2-3", source: "p2", target: "p3", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "ep3-4", source: "p3", target: "p4", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "ep4-5", source: "p4", target: "p5", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "ep5-6", source: "p5", target: "p6", label: "Success", animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#22c55e" } },
    { id: "ep5-7", source: "p5", target: "p7", label: "Failed", animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "#ef4444" } },
    { id: "ep6-8", source: "p6", target: "p8", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "ep8-9", source: "p8", target: "p9", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  ];

  // Mermaid UML Diagrams
  const relationshipSchema = `
erDiagram
    LOCATIONS }|--|| USERS : "has"
    LOCATIONS }|--|| SHOPS : "has"
    SHOPS ||--|| PRODUCTS : "owns"
    PRODUCTS ||--|| PRODUCT_IMAGES : "has"
    PRODUCTS ||--|| PRODUCT_REVIEWS : "receives"
    USERS ||--|| PRODUCT_REVIEWS : "writes"
    SHOPS ||--|| ORDERS : "receives"
    USERS ||--|| CONVERSATION : "participates"
    SHOPS ||--|| CONVERSATION : "participates"
    CONVERSATION ||--|| MESSAGES : "contains"

    LOCATIONS {
        string zipCode PK
        string city
        string country
        decimal latitude
        decimal longitude
    }

    USERS {
        int id PK
        string name
        string email
        string password
        string avatar
        string phoneNumber
        string address
        string zipCode FK
        datetime createdAt
        datetime updatedAt
    }

    SHOPS {
        int id PK
        string name
        string email
        string password
        string avatar
        string address
        string phoneNumber
        string zipCode FK
        text description
        datetime createdAt
        datetime updatedAt
    }

    ADMINS {
        int id PK
        string name
        string email
        string password
        string avatar
        string phoneNumber
        datetime createdAt
        datetime updatedAt
    }

    PRODUCTS {
        int id PK
        string name
        text description
        string category
        string tags
        decimal originalPrice
        decimal discountPrice
        int stock
        decimal ratings
        int shopId FK
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT_IMAGES {
        int id PK
        int productId FK
        string imageUrl
        datetime createdAt
    }

    PRODUCT_REVIEWS {
        int id PK
        int productId FK
        int userId FK
        decimal rating
        text comment
        datetime createdAt
    }

    ORDERS {
        int id PK
        json cart
        json shippingAddress
        json user
        decimal totalPrice
        json paymentInfo
        int shopId FK
        string status
        datetime deliveredAt
        datetime createdAt
        datetime updatedAt
    }

    CONVERSATION {
        int id PK
        string groupTitle
        int userId FK
        int sellerId FK
        text lastMessage
        datetime createdAt
        datetime updatedAt
    }

    MESSAGES {
        int id PK
        int conversationId FK
        int sender
        enum senderRole
        text text
        datetime createdAt
    }
  `;

  const checkoutSequenceDiagram = `
sequenceDiagram
    participant U as User/Browser
    participant F as Frontend (React)
    participant A as API Server
    participant S as Stripe API
    participant D as Database

    U->>F: Click "Place Order"
    F->>F: Validate Cart & Form
    F->>A: POST /api/payment/process {amount}
    A->>S: Create Payment Intent
    S-->>A: Return client_secret
    A-->>F: Return client_secret
    F->>S: Confirm Card Payment (Stripe Elements)
    S->>S: Process 3D Secure (if required)
    
    alt Payment Successful
        S-->>F: Payment Success
        F->>A: POST /api/order/create {cart, shipping, payment}
        A->>A: Split Order by Shop
        loop For Each Shop
            A->>D: INSERT INTO ORDERS
            D-->>A: Order Created
        end
        A-->>F: Orders Created Successfully
        F->>F: Clear Cart
        F->>F: Show Confetti 🎉
        F->>U: Redirect to /orders
    else Payment Failed
        S-->>F: Payment Error
        F->>U: Show Error Toast
    end
  `;

  const authSequenceDiagram = `
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant D as Database

    U->>F: Enter Credentials & ZIP Code
    F->>A: POST /api/user/register or /login
    A->>D: Check if User Exists
    
    alt Registration
        D-->>A: User Not Found
        A->>A: Hash Password (bcrypt)
        A->>D: INSERT INTO Users
        D-->>A: User Created
    else Login
        D-->>A: Return User Data
        A->>A: Compare Password (bcrypt)
    end

    alt Authentication Success
        A->>A: Generate JWT Token
        A-->>F: Return {user, token}
        F->>F: Store Token in localStorage
        F->>F: Update Auth State
        F->>U: Redirect to Dashboard
    else Authentication Failed
        A-->>F: Return Error
        F->>U: Show Error Message
    end
  `;

  const orderStateDiagram = `
stateDiagram-v2
    [*] --> Pending: Order Created
    Pending --> Processing: Seller Accepts
    Processing --> Shipped: Seller Ships
    Shipped --> Delivered: Customer Receives
    Delivered --> [*]
    
    Pending --> Cancelled: User/Seller Cancels
    Processing --> Cancelled: Seller Cancels
    Cancelled --> [*]

    note right of Pending
        Order just placed
        Payment completed
    end note

    note right of Processing
        Seller preparing order
        Packaging items
    end note

    note right of Shipped
        Order in transit
        Tracking available
    end note

    note right of Delivered
        Order completed
        Can leave review
    end note
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
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSelectedUmlDiagram("er")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedUmlDiagram === "er"
                      ? "bg-primary text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Relationship Schema
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
                  <h3 className="text-xl font-bold mb-4">Database Relationship Schema</h3>
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
                  👤 Buyer Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("seller")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "seller"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  🏪 Seller Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("payment")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "payment"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  💳 Payment Flow
                </button>
                <button
                  onClick={() => setSelectedDiagram("dataflow")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedDiagram === "dataflow"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  ⚡ Data Flow Architecture
                </button>
              </div>

              {/* Interactive Diagrams */}
              <div className="bg-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden">
                <div className="h-[600px]">
                  {selectedDiagram === "buyer" && (
                    <ReactFlow
                      nodes={buyerFlowNodes}
                      edges={buyerFlowEdges}
                      fitView
                      className="bg-gray-900"
                    >
                      <Background color="#374151" gap={16} />
                      <Controls className="bg-gray-800 border-gray-700" />
                    </ReactFlow>
                  )}
                  
                  {selectedDiagram === "seller" && (
                    <ReactFlow
                      nodes={sellerFlowNodes}
                      edges={sellerFlowEdges}
                      fitView
                      className="bg-gray-900"
                    >
                      <Background color="#374151" gap={16} />
                      <Controls className="bg-gray-800 border-gray-700" />
                    </ReactFlow>
                  )}

                  {selectedDiagram === "payment" && (
                    <ReactFlow
                      nodes={paymentFlowNodes}
                      edges={paymentFlowEdges}
                      fitView
                      className="bg-gray-900"
                    >
                      <Background color="#374151" gap={16} />
                      <Controls className="bg-gray-800 border-gray-700" />
                    </ReactFlow>
                  )}
                  
                  {selectedDiagram === "dataflow" && (
                    <ReactFlow
                      nodes={dataFlowNodes}
                      edges={dataFlowEdges}
                      fitView
                      className="bg-gray-900"
                    >
                      <Background color="#374151" gap={16} />
                      <Controls className="bg-gray-800 border-gray-700" />
                    </ReactFlow>
                  )}
                </div>
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

              {/* UML Sequence Diagrams */}
              <div className="mt-8 space-y-6">
                <h3 className="text-2xl font-bold mb-4">UML Sequence Diagrams</h3>
                
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🔐 Authentication Flow
                  </h4>
                  <MermaidDiagram chart={authSequenceDiagram} />
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    💳 Checkout & Payment Flow
                  </h4>
                  <MermaidDiagram chart={checkoutSequenceDiagram} />
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📦 Order Status Lifecycle
                  </h4>
                  <MermaidDiagram chart={orderStateDiagram} />
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
