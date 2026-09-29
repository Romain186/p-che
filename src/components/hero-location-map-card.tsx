import { ArrowUpRight, MapPin } from "lucide-react";
import { store } from "@/data/store";

export function HeroLocationMapCard() {
  return (
    <a
      href={store.mapsUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Voir l’itinéraire vers ${store.fullAddress} dans un nouvel onglet`}
      className="focus-ring group mt-8 block aspect-square w-full max-w-[15.5rem] overflow-hidden rounded-[1.75rem] border border-white/35 bg-cream/95 text-forest-950 shadow-[0_24px_70px_rgb(0_0_0/.3)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgb(0_0_0/.4)] xl:absolute xl:right-[9%] xl:top-[53%] xl:mt-0 xl:max-w-[18.5rem] xl:-translate-y-1/2 xl:hover:-translate-y-[calc(50%+0.25rem)]"
    >
      <span className="relative block h-[58%] overflow-hidden bg-forest-100 [background-image:linear-gradient(rgb(44_60_39/.08)_1px,transparent_1px),linear-gradient(90deg,rgb(44_60_39/.08)_1px,transparent_1px)] [background-size:28px_28px]">
        <span className="absolute -left-8 top-12 h-5 w-[125%] -rotate-12 rounded-full border-y border-sand bg-cream shadow-sm"/>
        <span className="absolute left-[43%] -top-10 h-[145%] w-4 rotate-[24deg] rounded-full border-x border-white/80 bg-forest-200"/>
        <span className="absolute -bottom-6 -right-8 size-32 rounded-full border-[18px] border-forest-200/70"/>
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-forest-700 shadow-sm">Balbigny</span>
        <span className="absolute right-4 top-5 text-[9px] font-bold uppercase tracking-[.16em] text-forest-700/60">Loire</span>
        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow-[0_10px_25px_rgb(17_27_15/.2)] ring-8 ring-ember/15 xl:size-16 xl:ring-[10px]">
          <span className="grid size-10 place-items-center rounded-full bg-ember text-white shadow-md transition duration-300 group-hover:scale-110 xl:size-11"><MapPin size={21} strokeWidth={2.5} className="xl:size-6"/></span>
        </span>
        <span className="absolute bottom-3 left-4 rounded-md bg-forest-900/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white backdrop-blur">Loire Pêche 42</span>
      </span>
      <span className="flex h-[42%] flex-col justify-between px-5 py-4 xl:px-6 xl:py-5">
        <span>
          <strong className="block font-display text-lg leading-tight xl:text-xl">{store.name}</strong>
          <span className="mt-1 block text-xs leading-5 text-stone-600 xl:text-sm xl:leading-6">{store.addressLine}<br/>{store.postalCode} {store.city}</span>
        </span>
        <span className="flex items-center justify-between text-xs font-black uppercase tracking-[.08em] text-ember xl:text-[13px]">
          Voir l’itinéraire
          <span className="grid size-7 place-items-center rounded-full bg-forest-900 text-white transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ArrowUpRight size={15}/></span>
        </span>
      </span>
    </a>
  );
}
