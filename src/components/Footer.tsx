import Link from 'next/link';

const FALLBACK = [
  'Ofertas',
  'Bebidas',
  'Lácteos',
  'Panadería',
  'Abarrotes',
  'Cuidado',
  'Bebés',
  'Limpieza',
  'Frío',
];

export function Footer({ categorias = [] }: { categorias?: string[] }) {
  const lista = categorias.length > 0 ? categorias : FALLBACK;
  const mitad = Math.ceil(lista.length / 2);
  const col1 = lista.slice(0, mitad);
  const col2 = lista.slice(mitad);

  return (
    <footer className="mt-16 bg-[#00c653] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <h3 className="text-sm font-black tracking-wide mb-4">CATEGORÍAS</h3>
          <ul className="space-y-2 text-sm text-white/90">
            {col1.map((nombre) => (
              <li key={nombre}>
                <Link href={`/categorias/${encodeURIComponent(nombre)}`} className="hover:text-amber-200">
                  {nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sm:pt-9">
          <ul className="space-y-2 text-sm text-white/90">
            {col2.map((nombre) => (
              <li key={nombre}>
                <Link href={`/categorias/${encodeURIComponent(nombre)}`} className="hover:text-amber-200">
                  {nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-wide mb-4">
            <span className="w-8 h-8 rounded-md bg-white text-[#00c653] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
                <path d="M3 4h2l2.2 11h11.3l2-7H7" />
              </svg>
            </span>
            FIDALGA
          </Link>
          <p className="text-sm text-white/90 mb-2">
            Av El Trompillo esquina Yacuiba, Santa Cruz de la Sierra, Bolivia
          </p>
          <p className="text-sm text-white/90 mb-4">
            Email:{' '}
            <a href="mailto:ecommerce@fidalga.com" className="underline hover:text-amber-200">
              ecommerce@fidalga.com
            </a>
          </p>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/fidalga"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white text-[#00c653] text-xs font-bold flex items-center justify-center hover:bg-amber-200"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/fidalga"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white text-[#00c653] text-xs font-bold flex items-center justify-center hover:bg-amber-200"
              aria-label="Instagram"
            >
              ig
            </a>
            <a
              href="https://www.tiktok.com/@fidalga"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white text-[#00c653] text-xs font-bold flex items-center justify-center hover:bg-amber-200"
              aria-label="TikTok"
            >
              tt
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#009e42]">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-white/80">
          © {new Date().getFullYear()} Fidalga. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
