import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

// Interfaces for Sanity Data
interface FooterSettings {
    missionStatement?: string;
    transparencyLinks?: { label: string; url: string }[];
    sectionLinks?: { label: string; url: string }[];
    socialMedia?: { platform: string; url: string }[];
    contactLegal?: { legalText?: string; contactEmail?: string };
}

async function getFooterSettings(): Promise<FooterSettings | null> {
    try {
        return await client.fetch(`*[_type == "footerSettings"][0]`);
    } catch (e) {
        console.error("Error fetching footer settings:", e);
        return null;
    }
}

export default async function Footer() {
    const settings = await getFooterSettings();

    // Defaults if CMS is empty
    const mission = settings?.missionStatement || "Comprometidos con la verdad y la transparencia informativa. Periodismo independiente al servicio de la comunidad.";
    const legalText = settings?.contactLegal?.legalText || `© ${new Date().getFullYear()} Raíz Media. Todos los derechos reservados.`;
    const email = settings?.contactLegal?.contactEmail || "contacto@raiz.media";

    // Icon helper
    const getIcon = (platform: string) => {
        const p = platform.toLowerCase();
        if (p.includes('twitter') || p.includes('x')) return <Twitter size={18} />;
        if (p.includes('facebook')) return <Facebook size={18} />;
        if (p.includes('instagram')) return <Instagram size={18} />;
        if (p.includes('linkedin')) return <Linkedin size={18} />;
        if (p.includes('youtube')) return <Youtube size={18} />;
        return null;
    };

    return (
        <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* COL 1: IDENTITY */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <h2 className="text-2xl font-bold text-white tracking-tight">RAÍZ</h2>
                        </Link>
                        <p className="text-neutral-400 leading-relaxed max-w-xs">{mission}</p>
                        <div className="pt-2 text-xs text-neutral-500">
                            Operando desde Chile • Est. 2024
                        </div>
                    </div>

                    {/* COL 2: TRANSPARENCY (Core) */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-base">Transparencia</h3>
                        <ul className="space-y-2.5">
                            {settings?.transparencyLinks?.length ? (
                                settings.transparencyLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.url} className="hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    {/* Default Placeholders if empty */}
                                    <li><Link href="/nosotros" className="hover:text-white transition-colors">Quiénes Somos</Link></li>
                                    <li><Link href="/equipo" className="hover:text-white transition-colors">Equipo Editorial</Link></li>
                                    <li><Link href="/etica" className="hover:text-white transition-colors">Código de Ética</Link></li>
                                    <li><Link href="/correciones" className="hover:text-white transition-colors">Política de Correcciones</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* COL 3: SECTIONS */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-base">Secciones</h3>
                        <ul className="space-y-2.5">
                            {settings?.sectionLinks?.length ? (
                                settings.sectionLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.url} className="hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/politica" className="hover:text-white transition-colors">Política</Link></li>
                                    <li><Link href="/economia" className="hover:text-white transition-colors">Economía</Link></li>
                                    <li><Link href="/sociedad" className="hover:text-white transition-colors">Sociedad</Link></li>
                                    <li><Link href="/opinion" className="hover:text-white transition-colors">Opinión</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* COL 4: PARTICIPATION */}
                    <div>
                        <h3 className="text-white font-semibold mb-4 text-base">Participación</h3>

                        {/* Newsletter Mock */}
                        <div className="mb-6 bg-neutral-900 p-4 rounded border border-neutral-800">
                            <h4 className="font-medium text-white mb-2 text-xs uppercase tracking-wider">Boletín Diario</h4>
                            <p className="mb-3 text-xs text-neutral-400">Recibe lo esencial cada mañana.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email" className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 flex-1 text-xs" />
                                <button className="bg-white text-black px-3 py-1 rounded text-xs font-semibold hover:bg-neutral-200">Suscribir</button>
                            </div>
                        </div>

                        {/* Social + Contact */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {settings?.socialMedia?.map((social, idx) => (
                                    <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors" aria-label={social.platform}>
                                        {getIcon(social.platform)}
                                    </a>
                                ))}
                                {!settings?.socialMedia?.length && (
                                    <>
                                        <a href="#" className="text-neutral-400 hover:text-white"><Twitter size={18} /></a>
                                        <a href="#" className="text-neutral-400 hover:text-white"><Facebook size={18} /></a>
                                        <a href="#" className="text-neutral-400 hover:text-white"><Instagram size={18} /></a>
                                    </>
                                )}
                            </div>

                            <a href={`mailto:${email}`} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                                <Mail size={16} />
                                <span>{email}</span>
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM LEGAL BAR */}
                <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
                    <p>{legalText}</p>
                    <div className="flex gap-6">
                        <Link href="/terminos" className="hover:text-neutral-300">Condiciones de Uso</Link>
                        <Link href="/privacidad" className="hover:text-neutral-300">Privacidad</Link>
                        <Link href="/cookies" className="hover:text-neutral-300">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
