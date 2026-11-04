import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Eye,
  X,
  Filter,
  DollarSign,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminStatsFn,
  getAdminProductsFn,
  createAdminProductFn,
  updateAdminProductFn,
  deleteAdminProductFn,
  getAdminOrdersFn,
  updateOrderStatusFn,
  getAdminCustomersFn,
  getAdminCouponsFn,
  createAdminCouponFn,
  toggleAdminCouponFn,
} from "@/lib/server/admin";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Atelier Executive Suite · AIDAH Boutique" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "settings";

function AdminDashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Search & Filter states
  const [productSearch, setProductSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");

  // Product Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodCategory, setProdCategory] = useState("ethnic-wear");
  const [prodPricePaise, setProdPricePaise] = useState(1500000);
  const [prodComparePaise, setProdComparePaise] = useState<number | undefined>(undefined);
  const [prodInventory, setProdInventory] = useState(10);
  const [prodSku, setProdSku] = useState("");
  const [prodImages, setProdImages] = useState("");
  const [prodFabric, setProdFabric] = useState("Pure Silk & Organza");
  const [prodOccasion, setProdOccasion] = useState("Festive / Wedding");
  const [prodIsPublished, setProdIsPublished] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Order Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updateStatusVal, setUpdateStatusVal] = useState("");
  const [trackingIdVal, setTrackingIdVal] = useState("");
  const [courierPartnerVal, setCourierPartnerVal] = useState("Bluedart Express");
  const [savingOrder, setSavingOrder] = useState(false);

  // Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinValue, setCouponMinValue] = useState(500000);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Admin Guard: check role
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "ADMIN") {
        navigate({ to: "/admin/login" });
      } else {
        loadAllData();
      }
    }
  }, [authLoading, user, navigate]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, prodRes, ordersRes, custRes, coupRes] = await Promise.all([
        getAdminStatsFn(),
        getAdminProductsFn(),
        getAdminOrdersFn(),
        getAdminCustomersFn(),
        getAdminCouponsFn(),
      ]);
      setStats(statsRes);
      setProducts(prodRes.products);
      setOrders(ordersRes.orders);
      setCustomers(custRes.customers);
      setCoupons(coupRes.coupons);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin suite data");
    } finally {
      setLoadingData(false);
    }
  };

  // Auto-generate slug when title changes in new product modal
  const handleTitleChange = (val: string) => {
    setProdTitle(val);
    if (!editingProduct) {
      const baseSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      if (!baseSlug) {
        setProdSlug("");
        return;
      }

      let uniqueSlug = baseSlug;
      let counter = 2;
      while (products.some((p) => p.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      setProdSlug(uniqueSlug);
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdTitle("");
    setProdSlug("");
    setProdDescription("");
    setProdCategory("ethnic-wear");
    setProdPricePaise(1500000);
    setProdComparePaise(undefined);
    setProdInventory(10);
    setProdSku(`AIDAH-${Math.floor(100 + Math.random() * 900)}`);
    setProdImages(
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    );
    setProdFabric("Pure Silk & Organza");
    setProdOccasion("Festive / Wedding");
    setProdIsPublished(true);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: any) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdSlug(p.slug);
    setProdDescription(p.description);
    setProdCategory(p.category);
    setProdPricePaise(p.price);
    setProdComparePaise(p.compareAtPrice || undefined);
    setProdInventory(p.inventory);
    setProdSku(p.sku);
    let imgs = p.images;
    try {
      if (typeof imgs === "string") imgs = JSON.parse(imgs);
      imgs = Array.isArray(imgs) ? imgs.join("\n") : imgs;
    } catch {
      imgs = p.images;
    }
    setProdImages(imgs);
    setProdFabric(p.fabric || "");
    setProdOccasion(p.occasion || "");
    setProdIsPublished(p.isPublished);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const imageArray = prodImages
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: prodTitle,
        slug: prodSlug,
        description: prodDescription,
        price: Number(prodPricePaise),
        compareAtPrice: prodComparePaise ? Number(prodComparePaise) : null,
        category: prodCategory,
        tags: ["atelier", prodCategory],
        images:
          imageArray.length > 0
            ? imageArray
            : [
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
              ],
        isPublished: prodIsPublished,
        inventory: Number(prodInventory),
        sku: prodSku,
        fabric: prodFabric,
        occasion: prodOccasion,
        badge: prodIsPublished ? "Atelier Curated" : undefined,
        variants: [
          { size: "S", color: "Atelier Standard", stock: Math.floor(prodInventory / 3) },
          { size: "M", color: "Atelier Standard", stock: Math.floor(prodInventory / 3) },
          { size: "L", color: "Atelier Standard", stock: Math.ceil(prodInventory / 3) },
        ],
      };

      if (editingProduct) {
        await updateAdminProductFn({
          data: {
            id: editingProduct.id,
            data: payload,
          },
        });
        toast.success("Product updated successfully.");
      } else {
        await createAdminProductFn({ data: payload });
        toast.success("New product published to catalog.");
      }

      setShowProductModal(false);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you certain you want to remove "${title}"?`)) return;
    try {
      await deleteAdminProductFn({ data: id });
      toast.success("Product deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingOrder(true);
    try {
      await updateOrderStatusFn({
        data: {
          orderId: selectedOrder.id,
          status: updateStatusVal as any,
          trackingId: trackingIdVal,
          courierPartner: courierPartnerVal,
        },
      });
      toast.success("Order status updated and customer notification triggered.");
      setSelectedOrder(null);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      await createAdminCouponFn({
        data: {
          code: couponCode.toUpperCase().trim(),
          discountType: couponType,
          value: Number(couponValue),
          minOrderValue: Number(couponMinValue),
          isActive: true,
        },
      });
      toast.success("Privilege code activated.");
      setShowCouponModal(false);
      setCouponCode("");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      await toggleAdminCouponFn({ data: id });
      toast.success("Privilege code status updated.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
      const matchSearch =
        !orderSearch ||
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="min-h-screen bg-[#110f10] text-[#fbf7f2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gold">Authenticating</p>
          <h1 className="font-serif text-2xl mt-1">Verifying Administrator Privileges...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110f10] text-[#fbf7f2] flex flex-col antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[#282225] bg-[#161315]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-ivory transition-colors p-1"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-[0.25em] text-ivory">
              AIDAH<span className="text-gold">.</span>
            </span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] font-bold text-gold uppercase tracking-widest border border-gold/30">
              Executive
            </span>
          </Link>
        </div>

        {/* Header Right Profile & Logout */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            Storefront <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center gap-3 border-l border-[#2e2629] pl-4 sm:pl-6">
            <div className="h-8 w-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-xs font-bold text-gold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-ivory">{user?.name}</p>
              <p className="text-[0.65rem] text-gold uppercase tracking-wider">
                Super Administrator
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate({ to: "/admin/login" });
            }}
            className="text-muted-foreground hover:text-rose transition-colors p-1.5"
            title="Secure Sign Out"
            aria-label="Secure Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 border-r border-[#282225] bg-[#141113] flex flex-col justify-between p-3 shrink-0`}
        >
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "products", label: "Product Catalog", icon: Package },
              { id: "orders", label: "Order Suite", icon: ShoppingBag },
              { id: "customers", label: "Customers", icon: Users },
              { id: "coupons", label: "Privilege Codes", icon: Tag },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all ${
                    active
                      ? "bg-gold text-charcoal font-semibold shadow-md shadow-gold/10"
                      : "text-muted-foreground hover:bg-[#1f1a1d] hover:text-ivory"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          {sidebarOpen && (
            <div className="rounded-2xl border border-[#2e2629] bg-[#181416] p-3 text-[0.65rem] text-muted-foreground/70 space-y-1">
              <p className="font-semibold text-ivory">Gurugram Atelier v2.6</p>
              <p>Baani City Centre, Sector 63</p>
              <div className="flex items-center gap-1.5 text-emerald-400 pt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Prisma SQLite Sync Active</span>
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#110f10]">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && stats && (
            <div className="space-y-8 animate-fade-up">
              <div>
                <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold uppercase">
                  Atelier Pulse
                </p>
                <h2 className="font-serif text-3xl mt-1 text-ivory">
                  Operations &amp; Performance
                </h2>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider mb-2">
                    <span>Total Revenue</span>
                    <TrendingUp className="h-4 w-4 text-gold" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-ivory">
                    ₹{stats.totalRevenueInRupees.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[0.65rem] text-emerald-400 mt-1">
                    Paid &amp; Delivered Ensembles
                  </p>
                </div>

                <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider mb-2">
                    <span>Total Orders</span>
                    <ShoppingBag className="h-4 w-4 text-gold" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-ivory">{stats.totalOrders}</p>
                  <p className="text-[0.65rem] text-muted-foreground mt-1">
                    Storefront &amp; Bespoke
                  </p>
                </div>

                <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider mb-2">
                    <span>Average Order Value</span>
                    <DollarSign className="h-4 w-4 text-gold" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-ivory">
                    ₹{stats.aovInRupees.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground mt-1">
                    Net Luxury Basket Size
                  </p>
                </div>

                <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider mb-2">
                    <span>Pending Fulfillment</span>
                    <Truck className="h-4 w-4 text-gold" />
                  </div>
                  <p className="font-serif text-3xl font-bold text-amber-400">
                    {stats.pendingFulfillment}
                  </p>
                  <p className="text-[0.65rem] text-amber-300/80 mt-1">
                    In Atelier Stitching / Transit
                  </p>
                </div>
              </div>

              {/* Chart & Low Stock Widget Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trends Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-ivory">Weekly Sales Velocity</h3>
                      <p className="text-xs text-muted-foreground">
                        Aggregated order values in ₹ (INR)
                      </p>
                    </div>
                  </div>
                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.salesTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2428" vertical={false} />
                        <XAxis dataKey="name" stroke="#8c8286" fontSize={11} tickLine={false} />
                        <YAxis
                          stroke="#8c8286"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1c181a",
                            borderColor: "#3d3237",
                            borderRadius: "1rem",
                            fontSize: "0.75rem",
                            color: "#fbf7f2",
                          }}
                        />
                        <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Low Stock Warnings (< 5 units) */}
                <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-serif text-lg text-ivory">Low Stock Alert</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Inventory count critical (&lt; 5 items)
                  </p>

                  <div className="space-y-3 pt-2">
                    {stats.lowStockProducts?.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 py-8 text-center">
                        All luxury ensembles are sufficiently stocked.
                      </p>
                    ) : (
                      stats.lowStockProducts?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-[#2e2629] bg-[#120f11] p-3 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-ivory truncate max-w-[150px]">
                              {item.title}
                            </p>
                            <p className="text-[0.65rem] font-mono text-muted-foreground">
                              {item.sku}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                            {item.inventory} left
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-ivory">Recent Storefront Activity</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs uppercase tracking-wider text-gold hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2e2629] text-muted-foreground uppercase tracking-wider text-[0.65rem]">
                        <th className="py-3 px-2">Order #</th>
                        <th className="py-3 px-2">Customer</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2">Payment</th>
                        <th className="py-3 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241e21]">
                      {stats.recentOrders?.map((o: any) => (
                        <tr key={o.id} className="hover:bg-[#1f1a1d] transition-colors">
                          <td className="py-3 px-2 font-mono font-medium text-gold">
                            {o.orderNumber}
                          </td>
                          <td className="py-3 px-2 text-ivory">{o.customerEmail}</td>
                          <td className="py-3 px-2 font-semibold text-ivory">
                            ₹{Math.round(o.totalAmount / 100).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${
                                o.status === "DELIVERED"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${
                                o.paymentStatus === "PAID" ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG MANAGER */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold uppercase">
                    Atelier Collection
                  </p>
                  <h2 className="font-serif text-3xl mt-1 text-ivory">
                    Product Catalog ({products.length})
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search title, SKU, category..."
                      className="rounded-2xl border border-[#383034] bg-[#1a1618] px-4 py-2 pl-9 text-xs text-ivory placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <button
                    onClick={handleOpenNewProduct}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                </div>
              </div>

              {/* Product Table */}
              <div className="rounded-3xl border border-[#2e2629] bg-[#181416] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2e2629] bg-[#151214] text-muted-foreground uppercase tracking-wider text-[0.65rem]">
                        <th className="py-3.5 px-4">Ensemble</th>
                        <th className="py-3.5 px-4">SKU</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Inventory</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241e21]">
                      {filteredProducts.map((p) => {
                        let imgUrl = "";
                        try {
                          const parsed =
                            typeof p.images === "string" ? JSON.parse(p.images) : p.images;
                          imgUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                        } catch {
                          imgUrl = p.images;
                        }

                        return (
                          <tr key={p.id} className="hover:bg-[#1f1a1d] transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={imgUrl || "/logo.jpg"}
                                alt={p.title}
                                className="h-10 w-10 rounded-xl object-cover ring-1 ring-gold/20"
                              />
                              <div>
                                <p className="font-semibold text-ivory text-xs">{p.title}</p>
                                <p className="text-[0.65rem] text-muted-foreground">
                                  {p.fabric || "Handloom craft"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[0.7rem] text-gold">{p.sku}</td>
                            <td className="py-3 px-4 capitalize text-muted-foreground">
                              {p.category.replace("-", " ")}
                            </td>
                            <td className="py-3 px-4 font-semibold text-ivory">
                              ₹{Math.round(p.price / 100).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${
                                  p.inventory > 5
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-rose-500/15 text-rose-400"
                                }`}
                              >
                                {p.inventory} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-wider ${
                                  p.isPublished
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {p.isPublished ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="text-muted-foreground hover:text-gold p-1"
                                  title="Edit Product"
                                  aria-label="Edit Product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.title)}
                                  className="text-muted-foreground hover:text-rose-400 p-1"
                                  title="Delete Product"
                                  aria-label="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER SUITE */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold uppercase">
                    Fulfillment Engine
                  </p>
                  <h2 className="font-serif text-3xl mt-1 text-ivory">
                    Order Management ({orders.length})
                  </h2>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order #, email, phone..."
                    className="rounded-2xl border border-[#383034] bg-[#1a1618] px-4 py-2 pl-9 text-xs text-ivory placeholder:text-muted-foreground/50 focus:border-gold focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#282225]">
                {[
                  "ALL",
                  "PENDING",
                  "CONFIRMED",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
                      orderStatusFilter === status
                        ? "bg-gold text-charcoal font-bold"
                        : "text-muted-foreground hover:bg-[#1f1a1d] hover:text-ivory"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="rounded-3xl border border-[#2e2629] bg-[#181416] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2e2629] bg-[#151214] text-muted-foreground uppercase tracking-wider text-[0.65rem]">
                        <th className="py-3.5 px-4">Order #</th>
                        <th className="py-3.5 px-4">Customer Details</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Fulfillment</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241e21]">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#1f1a1d] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-gold">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-ivory">{order.customerEmail}</p>
                            <p className="text-[0.65rem] text-muted-foreground">
                              {order.customerPhone}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {order.orderItems?.length || 0} pieces
                          </td>
                          <td className="py-3 px-4 font-semibold text-ivory">
                            ₹{Math.round(order.totalAmount / 100).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : order.status === "SHIPPED"
                                    ? "bg-blue-500/15 text-blue-400"
                                    : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${
                                order.paymentStatus === "PAID"
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setUpdateStatusVal(order.status);
                                setTrackingIdVal(order.trackingId || "");
                                setCourierPartnerVal(order.courierPartner || "Bluedart Express");
                              }}
                              className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-gold hover:bg-gold hover:text-charcoal transition-colors font-medium"
                            >
                              Inspect / Dispatch
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER DIRECTORY */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold uppercase">
                  Atelier Directory
                </p>
                <h2 className="font-serif text-3xl mt-1 text-ivory">
                  Registered Patrons ({customers.length})
                </h2>
              </div>

              <div className="rounded-3xl border border-[#2e2629] bg-[#181416] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2e2629] bg-[#151214] text-muted-foreground uppercase tracking-wider text-[0.65rem]">
                        <th className="py-3.5 px-4">Patron Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Orders Placed</th>
                        <th className="py-3.5 px-4">Total Expenditure</th>
                        <th className="py-3.5 px-4">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241e21]">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#1f1a1d] transition-colors">
                          <td className="py-3 px-4 font-semibold text-ivory flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gold/15 text-gold flex items-center justify-center text-[0.65rem] font-bold">
                              {c.name.charAt(0)}
                            </div>
                            {c.name}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {c.phone || "Not recorded"}
                          </td>
                          <td className="py-3 px-4 font-medium text-gold">{c.orderCount} orders</td>
                          <td className="py-3 px-4 font-semibold text-ivory">
                            ₹{c.totalSpendInRupees.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS & PRIVILEGE CODES */}
          {activeTab === "coupons" && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-bold tracking-[0.25em] text-gold uppercase">
                    Atelier Privileges
                  </p>
                  <h2 className="font-serif text-3xl mt-1 text-ivory">
                    Promo &amp; Privilege Codes ({coupons.length})
                  </h2>
                </div>

                <button
                  onClick={() => setShowCouponModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-colors"
                >
                  <Plus className="h-4 w-4" /> Create Privilege Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="rounded-3xl border border-[#2e2629] bg-[#181416] p-6 shadow-sm space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-gold tracking-wider bg-gold/10 px-3 py-1 rounded-xl border border-gold/30">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider transition-colors ${
                          coupon.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="text-ivory font-medium">
                        Privilege:{" "}
                        <span className="text-gold font-bold">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.value}% Off`
                            : `₹${Math.round(coupon.value / 100)} Off`}
                        </span>
                      </p>
                      <p>
                        Min Bag Value: ₹
                        {Math.round(coupon.minOrderValue / 100).toLocaleString("en-IN")}
                      </p>
                      <p>Redemptions: {coupon.usedCount} times</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#383034] bg-[#1a1618] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2629] pb-4">
              <div>
                <p className="text-[0.65rem] text-gold uppercase tracking-widest font-bold">
                  Atelier Curator
                </p>
                <h3 className="font-serif text-2xl text-ivory">
                  {editingProduct ? "Edit Designer Ensemble" : "Curate New Ensemble"}
                </h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-muted-foreground hover:text-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Seraphina Ice Blue Gown"
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSlug}
                    onChange={(e) => setProdSlug(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs font-mono text-gold focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Selling Price (paise)
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPricePaise}
                    onChange={(e) => setProdPricePaise(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    = ₹{Math.round(prodPricePaise / 100).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={prodInventory}
                    onChange={(e) => setProdInventory(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="ethnic-wear">Ethnic Wear</option>
                    <option value="co-ord-sets">Co-ord Sets</option>
                    <option value="evening-wear">Evening &amp; Gowns</option>
                    <option value="party-wear">Party Wear &amp; Capes</option>
                    <option value="floral-dresses">Floral &amp; Resort</option>
                    <option value="wedding-guest">Wedding Guest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Fabric
                  </label>
                  <input
                    type="text"
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Image URLs (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={prodImages}
                    onChange={(e) => setProdImages(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Couture Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="published-check"
                    checked={prodIsPublished}
                    onChange={(e) => setProdIsPublished(e.target.checked)}
                    className="rounded border-[#383034] text-gold focus:ring-gold"
                  />
                  <label
                    htmlFor="published-check"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Publish immediately to public storefront
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2629]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="rounded-full bg-gold px-8 py-2.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-colors"
                >
                  {savingProduct ? "Saving..." : "Commit Ensemble"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT / DISPATCH ORDER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#383034] bg-[#1a1618] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2629] pb-4">
              <div>
                <p className="text-[0.65rem] text-gold uppercase tracking-widest font-bold">
                  Order Dispatch
                </p>
                <h3 className="font-serif text-2xl text-ivory">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ensembles Ordered
              </h4>
              <div className="divide-y divide-[#282225] rounded-2xl border border-[#2e2629] bg-[#141113] p-4">
                {selectedOrder.orderItems?.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-semibold text-ivory">{item.productTitle}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{item.variantInfo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-semibold text-gold">
                        ₹{Math.round(item.totalPrice / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Status & Courier Form */}
            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING (Atelier Fitting)</option>
                  <option value="SHIPPED">SHIPPED (In Courier Transit)</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierPartnerVal}
                    onChange={(e) => setCourierPartnerVal(e.target.value)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingIdVal}
                    onChange={(e) => setTrackingIdVal(e.target.value)}
                    placeholder="e.g. BLU-892348921"
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2629]">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-ivory"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="rounded-full bg-gold px-8 py-2.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-colors"
                >
                  {savingOrder ? "Updating..." : "Confirm Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE PRIVILEGE CODE */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md rounded-3xl border border-[#383034] bg-[#1a1618] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2e2629] pb-4">
              <h3 className="font-serif text-2xl text-ivory">Create Privilege Code</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-muted-foreground hover:text-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Code
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20"
                  className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs font-mono uppercase text-gold focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Type
                  </label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Value {couponType === "PERCENTAGE" ? "(%)" : "(paise)"}
                  </label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Min Bag Value (paise)
                </label>
                <input
                  type="number"
                  value={couponMinValue}
                  onChange={(e) => setCouponMinValue(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[#383034] bg-[#120f11] px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2629]">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="rounded-full px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="rounded-full bg-gold px-8 py-2.5 text-xs uppercase tracking-wider text-charcoal font-semibold hover:bg-gold-soft transition-colors"
                >
                  {savingCoupon ? "Activating..." : "Activate Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
