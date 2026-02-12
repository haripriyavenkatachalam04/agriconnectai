import { useState } from "react";
import { motion } from "framer-motion";
import { Store, MapPin, Star, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const listings = [
  { id: 1, crop: "Paddy (Ponni)", qty: "50 quintals", price: "₹2,400/q", location: "Thanjavur", seller: "Ramesh K.", rating: 4.8, fresh: true },
  { id: 2, crop: "Sugarcane", qty: "200 tonnes", price: "₹3,200/t", location: "Erode", seller: "Lakshmi S.", rating: 4.5, fresh: false },
  { id: 3, crop: "Tomato (Hybrid)", qty: "30 quintals", price: "₹1,900/q", location: "Dindigul", seller: "Murugan P.", rating: 4.9, fresh: true },
  { id: 4, crop: "Onion", qty: "40 quintals", price: "₹2,800/q", location: "Namakkal", seller: "Priya R.", rating: 4.7, fresh: false },
  { id: 5, crop: "Cotton (MCU-5)", qty: "25 quintals", price: "₹7,100/q", location: "Coimbatore", seller: "Senthil M.", rating: 4.6, fresh: true },
  { id: 6, crop: "Paddy (IR20)", qty: "80 quintals", price: "₹2,150/q", location: "Tiruvarur", seller: "Anbu D.", rating: 4.4, fresh: false },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const filtered = listings.filter(l =>
    l.crop.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold">
          <Store className="inline h-8 w-8 mr-3 text-primary" />
          P2P Marketplace
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Connect directly with buyers and sellers. Eliminate middlemen and get fair prices for your produce.
        </p>
      </motion.div>

      {/* Search */}
      <div className="mt-8 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by crop or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Listings */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{item.crop}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {item.location}
                </p>
              </div>
              {item.fresh && (
                <Badge className="bg-primary/10 text-primary border-0 text-xs">New</Badge>
              )}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{item.price}</p>
                <p className="text-sm text-muted-foreground">{item.qty} available</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{item.seller}</p>
                <p className="flex items-center gap-1 text-sm text-secondary">
                  <Star className="h-3.5 w-3.5 fill-current" /> {item.rating}
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full rounded-xl" variant="outline" size="sm">
              Contact Seller
            </Button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No listings found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
