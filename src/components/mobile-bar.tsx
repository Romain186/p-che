import { MapPin, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { store } from "@/data/store";
export function MobileBar() { const items = [{ href: store.phoneHref, label: "Appeler", icon: Phone }, { href: store.mapsUrl, label: "Itinéraire", icon: MapPin }, { href: "/contact", label: "Contact", icon: MessageSquare }]; return <div className="fixed inset-x-0 bottom-0 z-50 grid h-17 grid-cols-3 border-t border-forest-900/10 bg-cream/95 shadow-[0_-8px_30px_rgb(0_0_0/.1)] backdrop-blur md:hidden">{items.map(({href,label,icon:Icon}) => <Link key={label} href={href} className="focus-ring flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-forest-900"><Icon size={19} className="text-ember"/>{label}</Link>)}</div>; }
