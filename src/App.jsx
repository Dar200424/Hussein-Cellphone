import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Laptop,
  Menu,
  Moon,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { categories, createInventory } from "./catalog.js";

const inventoryKey = "hussein-cellphone-inventory-v1";

function readInventory() {
  try {
    const saved = localStorage.getItem(inventoryKey);
    return saved ? JSON.parse(saved) : createInventory();
  } catch (error) {
    console.error("Could not load saved inventory.", error);
    return createInventory();
  }
}

function BrandMark({ small = false }) {
  return (
    <span className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function Header({ dark, setDark, onDashboard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header">
      <a href="#home" className="brand" onClick={closeMenu}>
        <BrandMark />
        <span className="brand-copy">
          <strong>HUSSEIN</strong>
          <small>CELLPHONE ACCESSORIES</small>
        </span>
      </a>
      <button
        className="mobile-menu-button icon-button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
        <button className="nav-dashboard" onClick={() => { closeMenu(); onDashboard(); }}>
          Dashboard <ArrowRight size={15} />
        </button>
        <button
          className="theme-toggle icon-button"
          onClick={() => setDark((value) => !value)}
          aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          title={`Switch to ${dark ? "light" : "dark"} mode`}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </nav>
    </header>
  );
}

function ProductCard({ product, onContact }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className={`availability ${product.status === "Available" ? "in-stock" : "sold-out"}`}>
          <span />{product.status}
        </span>
        {product.category === "Laptop" && <span className="product-category-tag">MAC</span>}
      </div>
      <div className="product-card-body">
        <div className="product-heading">
          <div>
            <span className="product-category">{product.category}</span>
            <h3>{product.name}</h3>
          </div>
          <span className="product-price">{product.price ? `₱${Number(product.price).toLocaleString("en-PH")}` : "Ask us"}</span>
        </div>
        <p>{product.description}</p>
        {product.storage.length > 0 && (
          <div className="storage-list" aria-label="Available storage options">
            {product.storage.slice(0, 4).map((size) => <span key={size}>{size}</span>)}
            {product.storage.length > 4 && <span>+{product.storage.length - 4}</span>}
          </div>
        )}
        <button className="card-contact-link" onClick={() => onContact(product)}>
          Ask about this item <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function InventoryDialog({ products, onClose, onSave, onAdd }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category: "iPhone", price: "", status: "Available", description: "", storage: "" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = products.filter((product) => {
    const matchesText = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = filter === "All" || product.category === filter;
    return matchesText && matchesCategory;
  });
  const startEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      status: product.status,
      description: product.description,
      storage: product.storage.join(", "),
    });
  };
  const startAdd = () => {
    setEditing("new");
    setForm({ name: "", category: "iPhone", price: "", status: "Available", description: "", storage: "" });
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const product = {
      ...form,
      name: form.name.trim(),
      price: form.price.trim(),
      description: form.description.trim() || "A quality pick from Hussein Cellphone Accessories.",
      storage: form.storage.split(",").map((size) => size.trim()).filter(Boolean),
      image: products.find((item) => item.id === editing)?.image ??
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85",
    };
    if (editing === "new") onAdd({ ...product, id: `custom-${Date.now()}` });
    else onSave(editing, product);
    setEditing(null);
  };
  const countAvailable = products.filter((product) => product.status === "Available").length;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="inventory-dialog" role="dialog" aria-modal="true" aria-labelledby="inventory-title">
        <div className="dialog-top">
          <div>
            <span className="eyebrow">YOUR STORE, AT A GLANCE</span>
            <h2 id="inventory-title">Inventory dashboard</h2>
            <p>Keep your product availability and prices up to date.</p>
          </div>
          <button className="icon-button dialog-close" aria-label="Close dashboard" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="inventory-summary">
          <div><span>Total products</span><strong>{products.length}</strong></div>
          <div><span>Available</span><strong>{countAvailable}</strong></div>
          <div><span>Marked sold</span><strong>{products.length - countAvailable}</strong></div>
        </div>
        <div className="inventory-controls">
          <label className="inventory-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter inventory by category">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button className="button button-dark add-product-button" onClick={startAdd}><Plus size={16} /> Add product</button>
        </div>
        {editing && (
          <form className="product-edit-form" onSubmit={submit}>
            <div className="form-heading"><h3>{editing === "new" ? "Add a product" : "Edit product"}</h3><button type="button" className="icon-button" aria-label="Cancel editing" onClick={() => setEditing(null)}><X size={17} /></button></div>
            <div className="form-grid">
              <label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. iPhone 17 Pro" /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.filter((category) => category !== "All").map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Price in PHP<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Leave blank to show Ask us" /></label>
              <label>Availability<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Available</option><option>Sold</option></select></label>
              <label className="form-wide">Storage options<input value={form.storage} onChange={(event) => setForm({ ...form, storage: event.target.value })} placeholder="Comma-separated, e.g. 128GB, 256GB, 512GB" /></label>
              <label className="form-wide">Short description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A short, helpful product detail" /></label>
            </div>
            <div className="form-actions"><button type="button" className="button button-quiet" onClick={() => setEditing(null)}>Cancel</button><button className="button button-dark" type="submit"><Check size={16} /> Save product</button></div>
          </form>
        )}
        <div className="inventory-list">
          {filtered.map((product) => (
            <div className="inventory-row" key={product.id}>
              <img src={product.image} alt="" />
              <div className="inventory-product-info"><strong>{product.name}</strong><span>{product.category}{product.storage.length ? ` · ${product.storage.join(", ")}` : ""}</span></div>
              <span className={`availability inventory-status ${product.status === "Available" ? "in-stock" : "sold-out"}`}><span />{product.status}</span>
              <span className="inventory-price">{product.price ? `₱${Number(product.price).toLocaleString("en-PH")}` : "Ask us"}</span>
              <button className="edit-button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /> Edit</button>
            </div>
          ))}
          {filtered.length === 0 && <p className="empty-state">No products match your search.</p>}
        </div>
        <p className="local-storage-note"><ShieldCheck size={15} /> Changes are saved in this browser on this device.</p>
      </section>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("hussein-theme") === "dark");
  const [products, setProducts] = useState(readInventory);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [contactProduct, setContactProduct] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("hussein-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    try {
      localStorage.setItem(inventoryKey, JSON.stringify(products));
    } catch (error) {
      console.error("Could not save inventory changes.", error);
    }
  }, [products]);

  const visibleProducts = useMemo(() => {
    const matches = products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    return showAll || query || activeCategory !== "All" ? matches : matches.slice(0, 8);
  }, [products, activeCategory, query, showAll]);
  const setCategory = (category) => {
    setActiveCategory(category);
    setShowAll(category !== "All");
  };
  const saveProduct = (id, updates) => setProducts((current) => current.map((product) => product.id === id ? { ...product, ...updates } : product));
  const addProduct = (product) => setProducts((current) => [product, ...current]);
  const handleContact = (product) => {
    setContactProduct(product.name);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={14} /><span>Thoughtful Apple essentials, right here in Matina.</span><a href="#products">Explore the collection <ArrowRight size={13} /></a></div>
      <Header dark={dark} setDark={setDark} onDashboard={() => setDashboardOpen(true)} />
      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR LOCAL APPLE & TECH STORE</span>
            <h1>Good tech.<br /><span>Good people.</span><br />Right around the corner.</h1>
            <p>Find the iPhone, MacBook, and everyday accessories that fit your life. Personal service, right here in Matina Crossing.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#products">Explore products <ArrowRight size={17} /></a>
              <a className="button button-outline" href="#contact"><Phone size={16} /> Talk to our team</a>
            </div>
            <div className="hero-reassurance"><span><ShieldCheck size={16} /> Friendly local service</span><span><CircleHelp size={16} /> Ask us anything</span></div>
          </div>
          <div className="hero-art">
            <div className="hero-art-glow" />
            <div className="hero-note"><span className="note-icon"><Sparkles size={17} /></span><span><strong>A better fit,</strong><small>for your everyday.</small></span></div>
            <div className="hero-device">
              <div className="device-camera"><i /><i /><i /></div>
              <div className="device-lens" />
              <span className="device-logo">H</span>
            </div>
            <div className="hero-side-label">MADE FOR YOUR EVERYDAY <ArrowDown size={14} /></div>
            <div className="hero-art-caption"><span>01 / THE EVERYDAY COLLECTION</span><span>MATINA CROSSING, DAVAO</span></div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Store highlights">
          <div><span className="trust-icon"><Smartphone size={19} /></span><span><strong>Apple phones</strong><small>From classic to current</small></span></div>
          <div><span className="trust-icon"><Laptop size={19} /></span><span><strong>Mac for your next move</strong><small>Pro, Air & Neo</small></span></div>
          <div><span className="trust-icon"><Package size={19} /></span><span><strong>Everyday essentials</strong><small>Cases, chargers & more</small></span></div>
          <a href="#contact" className="trust-visit"><span>Come say hello</span><ArrowRight size={16} /></a>
        </section>

        <section className="products-section section-wrap" id="products">
          <div className="section-heading">
            <div><span className="eyebrow">A LITTLE SOMETHING FOR EVERYONE</span><h2>Find your next <span>favorite.</span></h2></div>
            <p>From the iPhone you’ve been eyeing to the charger you keep meaning to replace—start here.</p>
          </div>
          <div className="product-tools">
            <div className="category-tabs" role="tablist" aria-label="Product categories">
              {categories.map((category) => (
                <button key={category} role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "category-tab active" : "category-tab"} onClick={() => setCategory(category)}>
                  {category === "Laptop" ? "MacBooks" : category === "Casing" ? "Cases" : category === "Charger" ? "Chargers" : category === "Accessory" ? "Accessories" : category}
                </button>
              ))}
            </div>
            <div className={`catalog-search ${mobileSearchOpen ? "search-open" : ""}`}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /><button onClick={() => setMobileSearchOpen((open) => !open)} aria-label="Toggle product search"><Search size={17} /></button></div>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onContact={handleContact} />)}
          </div>
          {!visibleProducts.length && <div className="empty-catalog">No products found. Try another search or category.</div>}
          {!showAll && activeCategory === "All" && !query && (
            <button className="view-all-button" onClick={() => setShowAll(true)}>See the full collection <ChevronDown size={16} /></button>
          )}
          {showAll && activeCategory === "All" && !query && (
            <button className="view-all-button" onClick={() => setShowAll(false)}>Show featured products <ArrowDown className="arrow-up" size={16} /></button>
          )}
          <p className="availability-disclaimer"><CircleHelp size={15} /> Product availability can change—please contact us to confirm a specific model or storage size.</p>
        </section>

        <section className="about-section" id="about">
          <div className="about-inner">
            <div className="about-visual">
              <div className="about-image"><img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85" alt="A welcoming space for finding your next everyday tech essential" loading="lazy" /></div>
              <div className="about-stamp"><BrandMark small /><span>LOCAL<br />& PERSONAL</span></div>
            </div>
            <div className="about-copy">
              <span className="eyebrow">A GOOD STORE IS A GOOD NEIGHBOR</span>
              <h2>Technology feels better when the service feels <span>personal.</span></h2>
              <p>We’re Hussein Cellphone Accessories—a neighborhood spot in Matina Crossing for Apple devices and the little things that make them yours. Whether you know exactly what you want or need a little help choosing, we’re happy to help.</p>
              <a className="text-link" href="#contact">Get to know us <ArrowRight size={16} /></a>
              <div className="about-values"><div><strong>01</strong><span>Helpful, no-pressure advice</span></div><div><strong>02</strong><span>A thoughtful range of essentials</span></div></div>
            </div>
          </div>
        </section>

        <section className="contact-section section-wrap" id="contact">
          <div className="contact-intro"><span className="eyebrow">WE’RE JUST A MESSAGE AWAY</span><h2>Let’s find the<br /><span>right fit.</span></h2><p>Ask about a product, check what’s available, or just stop by and say hello.</p></div>
          <div className="contact-card">
            <div className="contact-card-head"><div><span className="eyebrow">HUSSEIN CELLPHONE ACCESSORIES</span><h3>Come say hello.</h3></div><BrandMark /></div>
            {contactProduct && <div className="contact-context"><Sparkles size={15} /> Asking about: <strong>{contactProduct}</strong><button aria-label="Clear product selection" onClick={() => setContactProduct("")}><X size={14} /></button></div>}
            <a className="contact-row" href="tel:09759686884"><span className="contact-icon"><Phone size={18} /></span><span><small>CALL OR TEXT</small><strong>0975 968 6884</strong></span><ArrowRight size={17} /></a>
            <a className="contact-row" href="mailto:Hussein_Cellphone@gmail.com"><span className="contact-icon"><span className="mail-icon">✉</span></span><span><small>EMAIL US</small><strong>Hussein_Cellphone@gmail.com</strong></span><ArrowRight size={17} /></a>
            <div className="contact-row address-row"><span className="contact-icon"><span className="pin-icon">⌖</span></span><span><small>FIND US</small><strong>Matina Crossing Ncc, Centerpoint</strong><em>Davao City, Philippines</em></span></div>
            <div className="contact-card-foot"><span><span className="open-dot" /> Happy to help, whenever you need us.</span><a href="https://maps.google.com/?q=Matina+Crossing+Ncc+Centerpoint+Davao+City" target="_blank" rel="noreferrer">Get directions <ArrowRight size={14} /></a></div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#home" className="brand footer-brand"><BrandMark /><span className="brand-copy"><strong>HUSSEIN</strong><small>CELLPHONE ACCESSORIES</small></span></a>
        <span>Good tech. Good people. © {new Date().getFullYear()} Hussein Cellphone Accessories.</span>
        <button onClick={() => setDashboardOpen(true)}>Manage inventory <ArrowRight size={14} /></button>
      </footer>
      {dashboardOpen && <InventoryDialog products={products} onClose={() => setDashboardOpen(false)} onSave={saveProduct} onAdd={addProduct} />}
    </div>
  );
}

export default App;
