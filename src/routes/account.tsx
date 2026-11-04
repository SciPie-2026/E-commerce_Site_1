import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getUserOrdersFn,
  getUserAddressesFn,
  saveAddressFn,
  deleteAddressFn,
  updateProfileFn,
  changePasswordFn,
} from "@/lib/server/auth";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Atelier Dashboard · AIDAH The Label" },
      {
        name: "description",
        content:
          "Manage your AIDAH boutique orders, bespoke fitting requests, and atelier profile.",
      },
    ],
  }),
  component: AccountDashboardPage,
});

type TabType = "orders" | "addresses" | "profile" | "security";

function AccountDashboardPage() {
  const { user, isLoading: authLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Address modal / form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile update state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/account" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
      loadAccountData();
    }
  }, [user]);

  const loadAccountData = async () => {
    setLoadingData(true);
    try {
      const [orderRes, addrRes] = await Promise.all([getUserOrdersFn(), getUserAddressesFn()]);
      setOrders(orderRes.orders);
      setAddresses(addrRes.addresses);
    } catch (err: any) {
      toast.error(err.message || "Failed to load account details");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await saveAddressFn({
        data: {
          type: "SHIPPING",
          name: addrName,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          postalCode: addrPostal,
          country: "India",
          phone: addrPhone,
          isDefault: addrIsDefault,
        },
      });
      toast.success("Delivery address saved.");
      setShowAddAddress(false);
      setAddrName("");
      setAddrStreet("");
      setAddrCity("");
      setAddrState("");
      setAddrPostal("");
      setAddrPhone("");
      loadAccountData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Remove this address?")) return;
    try {
      await deleteAddressFn({ data: id });
      toast.success("Address removed");
      loadAccountData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfileFn({
        data: {
          name: profileName,
          phone: profilePhone,
        },
      });
      await refreshUser();
      toast.success("Profile details updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePasswordFn({
        data: {
          currentPassword,
          newPassword,
          confirmNewPassword,
        },
      });
      toast.success("Password changed. All other sessions terminated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out of Atelier.");
    navigate({ to: "/" });
  };

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="eyebrow text-gold">Connecting</p>
        <h1 className="display-2 mt-2 font-serif text-2xl">Retrieving Atelier Account...</h1>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING":
        return 1;
      case "CONFIRMED":
        return 2;
      case "PROCESSING":
        return 3;
      case "SHIPPED":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="eyebrow text-gold">Atelier Member Archive</p>
          <h1 className="display-2 mt-1 text-3xl sm:text-4xl text-foreground font-serif">
            Namaste, {user?.name}
          </h1>
          <p className="mt-1 text-xs text-cocoa">
            {user?.email} · Member since {user ? new Date().getFullYear() : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === "ADMIN" && (
            <Link
              to={"/admin" as any}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-charcoal transition-colors font-medium"
            >
              Admin Suite <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs uppercase tracking-wider text-cocoa hover:text-rose-deep hover:border-rose/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs uppercase tracking-wider transition-colors text-left w-full whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-charcoal text-ivory font-medium shadow-sm"
                  : "text-cocoa hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Package className="h-4 w-4" /> Order History ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs uppercase tracking-wider transition-colors text-left w-full whitespace-nowrap ${
                activeTab === "addresses"
                  ? "bg-charcoal text-ivory font-medium shadow-sm"
                  : "text-cocoa hover:bg-secondary hover:text-foreground"
              }`}
            >
              <MapPin className="h-4 w-4" /> Saved Addresses ({addresses.length})
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs uppercase tracking-wider transition-colors text-left w-full whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-charcoal text-ivory font-medium shadow-sm"
                  : "text-cocoa hover:bg-secondary hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" /> Profile Details
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs uppercase tracking-wider transition-colors text-left w-full whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-charcoal text-ivory font-medium shadow-sm"
                  : "text-cocoa hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Lock className="h-4 w-4" /> Password &amp; Security
            </button>
          </nav>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-foreground">
                  Bespoke &amp; Ready-to-Wear Orders
                </h2>
                <Link
                  to="/shop"
                  className="text-xs uppercase tracking-wider text-gold hover:underline font-medium"
                >
                  Explore Collection &rarr;
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
                  <Package
                    className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-serif text-xl">No active couture orders</h3>
                  <p className="mt-1 text-xs text-cocoa max-w-sm mx-auto">
                    Your handcrafted selections from our Gurugram atelier will appear here with live
                    progress tracking.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
                    >
                      Visit Boutique
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const step = getStatusStep(order.status);
                    return (
                      <div
                        key={order.id}
                        className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                          <div>
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-cocoa ml-3">
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : order.status === "SHIPPED"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {order.status}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              Payment: {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Progress Tracker */}
                        {order.status !== "CANCELLED" && (
                          <div className="py-2">
                            <div className="flex justify-between text-[0.65rem] uppercase tracking-wider text-cocoa font-medium mb-2">
                              <span className={step >= 1 ? "text-gold font-bold" : ""}>Placed</span>
                              <span className={step >= 2 ? "text-gold font-bold" : ""}>
                                Confirmed
                              </span>
                              <span className={step >= 3 ? "text-gold font-bold" : ""}>
                                Atelier Fitting
                              </span>
                              <span className={step >= 4 ? "text-gold font-bold" : ""}>
                                Dispatched
                              </span>
                              <span className={step >= 5 ? "text-gold font-bold" : ""}>
                                Delivered
                              </span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                              <div
                                className="bg-gradient-to-r from-gold to-rose-deep h-full transition-all duration-500 rounded-full"
                                style={{ width: `${(step / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Line items list */}
                        <div className="divide-y divide-border/60">
                          {order.orderItems?.map((item: any) => (
                            <div
                              key={item.id}
                              className="py-3 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-semibold text-foreground">{item.productTitle}</p>
                                {item.variantInfo && (
                                  <p className="text-[0.7rem] text-cocoa">{item.variantInfo}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-foreground">
                                  {item.quantity} × {formatINR(Math.round(item.unitPrice / 100))}
                                </p>
                                <p className="font-semibold text-gold">
                                  {formatINR(Math.round(item.totalPrice / 100))}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <span className="text-cocoa">
                            {order.trackingId && (
                              <span className="flex items-center gap-1 font-mono text-gold">
                                <Truck className="h-3.5 w-3.5" />
                                Tracking: {order.courierPartner || "Bluedart"} · {order.trackingId}
                              </span>
                            )}
                          </span>
                          <span className="text-sm font-serif font-bold text-foreground">
                            Total: {formatINR(Math.round(order.totalAmount / 100))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-foreground">Saved Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-5 py-2 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> {showAddAddress ? "Cancel" : "Add Address"}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="rounded-3xl border border-gold/40 bg-card p-6 shadow-sm space-y-4 animate-fade-up"
                >
                  <h3 className="font-serif text-lg text-foreground">New Delivery Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        placeholder="Recipient Name"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="Apartment, suite, unit, building, floor"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        placeholder="Gurugram"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        placeholder="Haryana"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={addrPostal}
                        onChange={(e) => setAddrPostal(e.target.value)}
                        placeholder="122002"
                        className="w-full rounded-2xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="default-check"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        className="rounded border-border text-gold focus:ring-gold"
                      />
                      <label htmlFor="default-check" className="text-xs text-cocoa cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
                    >
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold" />
                        <h3 className="font-semibold text-sm text-foreground">{addr.name}</h3>
                      </div>
                      {addr.isDefault && (
                        <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-gold border border-gold/30">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-cocoa leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>

                    <p className="text-xs text-cocoa">Phone: {addr.phone}</p>

                    <div className="pt-2 border-t border-border/60 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-muted-foreground/60 hover:text-rose transition-colors p-1"
                        aria-label="Delete Address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === "profile" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-foreground">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full rounded-2xl border border-input bg-muted/50 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="mt-1 text-[0.65rem] text-muted-foreground">
                    Email address is tied to your cryptographic session credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
                  >
                    {savingProfile ? "Saving..." : "Update Details"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === "security" && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  Password &amp; Security Protocol
                </h2>
                <p className="mt-1 text-xs text-cocoa leading-relaxed">
                  Changing your password will revoke all active sessions across devices and
                  re-encrypt your authentication keys.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters with symbol &amp; number"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-cocoa mb-1.5 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
                  >
                    {savingPassword ? "Updating Security..." : "Change Password"}
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-2xl border border-border p-4 bg-secondary/30 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-gold shrink-0" />
                <div className="text-xs text-cocoa leading-relaxed">
                  <p className="font-semibold text-foreground">Session Isolation Policy Active</p>
                  <p>
                    Tokens are rotated every 15 minutes with cryptographic replay detection.
                    Immediate database revocation is triggered upon password changes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
