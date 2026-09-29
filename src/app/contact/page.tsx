import type { Metadata } from "next";
import { Clock3, MapPin, Navigation, Phone } from "lucide-react";
import { PageHero } from "@/components/ui";
import { store } from "@/data/store";

export const metadata: Metadata = {
  title: "Contact",
  description: `Téléphone, horaires et accès à Loire Pêche 42, ${store.fullAddress}.`,
};

export default function ContactPage() {
  return <>
    <PageHero eyebrow="Nous contacter" title="Préparez votre visite" copy="Une question sur un produit ou besoin d’un conseil ? Appelez-nous ou passez au magasin pendant les horaires d’ouverture."/>
    <section className="section-pad">
      <div className="container-site grid gap-8 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <Info icon={Phone} title="Téléphone">
            <a className="text-xl font-bold text-forest-900 hover:text-ember" href={store.phoneHref}>{store.phone}</a>
          </Info>
          <Info icon={MapPin} title="Adresse">
            <address className="not-italic">
              <span className="block font-semibold text-forest-950">{store.addressLine}</span>
              <span className="block">{store.postalCode} {store.city}</span>
            </address>
          </Info>
          <Info icon={Clock3} title="Horaires">
            <div className="mt-1 space-y-2">{store.hours.map(([day,hour]) => <div key={day} className="flex justify-between gap-4 border-b border-forest-900/10 pb-2 text-sm"><span>{day}</span><b>{hour}</b></div>)}</div>
          </Info>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href={store.phoneHref} className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-ember px-4 text-sm font-bold text-white"><Phone size={17}/> Appeler</a>
            <a href={store.mapsUrl} className="focus-ring flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest-800 px-4 text-sm font-bold text-white"><Navigation size={17}/> Voir l’itinéraire</a>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10 lg:col-span-3">
          <p className="eyebrow">Écrivez-nous</p>
          <h2 className="display-title mt-3 text-4xl text-forest-950">Votre message</h2>
          <p className="mt-4 text-sm text-stone-500">Formulaire visuel pour cette V1 — aucun message n’est encore envoyé.</p>
          <form className="mt-8 grid gap-5" aria-label="Formulaire de contact de démonstration">
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Nom" id="name" type="text"/><Field label="Email" id="email" type="email"/></div>
            <Field label="Téléphone" id="phone" type="tel"/>
            <label htmlFor="message" className="grid gap-2 text-sm font-bold text-forest-900">Message<textarea id="message" name="message" rows={6} className="focus-ring resize-y rounded-2xl border border-forest-900/15 bg-cream px-4 py-3 font-normal" placeholder="Comment pouvons-nous vous aider ?"/></label>
            <button type="button" className="focus-ring min-h-13 rounded-full bg-forest-800 px-6 font-bold text-white opacity-60" aria-describedby="form-note">Envoyer le message</button>
            <p id="form-note" className="text-center text-xs text-stone-500">Envoi désactivé dans la version de démonstration.</p>
          </form>
        </div>
      </div>
      <div className="container-site mt-8">
        <div className="relative grid min-h-[360px] place-items-center overflow-hidden rounded-[2rem] bg-forest-200 px-4 text-center">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#587449_1px,transparent_1px),linear-gradient(90deg,#587449_1px,transparent_1px)] [background-size:36px_36px]"/>
          <div className="relative rounded-3xl bg-cream/95 p-8 shadow-xl backdrop-blur sm:p-10">
            <MapPin className="mx-auto text-ember" size={34}/>
            <h2 className="mt-4 font-display text-2xl font-semibold text-forest-950">{store.name}</h2>
            <address className="mt-2 not-italic text-stone-600"><span className="block">{store.addressLine}</span><span className="block">{store.postalCode} {store.city}</span></address>
            <a href={store.mapsUrl} className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-800 px-6 text-sm font-bold text-white transition hover:bg-forest-700"><Navigation size={17}/> Voir l’itinéraire</a>
          </div>
        </div>
      </div>
    </section>
  </>;
}

function Info({icon:Icon,title,children}: {icon:typeof Phone; title:string; children:React.ReactNode}) { return <div className="rounded-3xl bg-white p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-forest-100 text-forest-800"><Icon size={19}/></span><h2 className="font-display text-xl font-semibold text-forest-950">{title}</h2></div><div className="mt-5 text-stone-700">{children}</div></div>; }
function Field({label,id,type}: {label:string;id:string;type:string}) { return <label htmlFor={id} className="grid gap-2 text-sm font-bold text-forest-900">{label}<input id={id} name={id} type={type} className="focus-ring min-h-12 rounded-full border border-forest-900/15 bg-cream px-4 font-normal"/></label>; }
