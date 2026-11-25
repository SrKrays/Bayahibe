/**
 * Colaborar: contexto global (cualquier botón de la web puede abrir el modal)
 * + modal con los datos de donación y botón de copiar.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { DONATION_CONTACT, DONATION_METHODS, PLACEHOLDER } from '../config/donations';
import { useLanguage } from '../i18n/LanguageContext';
import './donate.css';

const DonateContext = createContext<() => void>(() => {});
export const useDonate = () => useContext(DonateContext);

export function DonateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  return (
    <DonateContext.Provider value={openModal}>
      {children}
      {open && <DonateModal onClose={() => setOpen(false)} />}
    </DonateContext.Provider>
  );
}

/** Botón reutilizable. `variant`: nav (arriba), floating (esquina), large (sección Súmate). */
export function DonateButton({ variant = 'nav' }: { variant?: 'nav' | 'floating' | 'large' }) {
  const open = useDonate();
  const { t } = useLanguage();
  return (
    <button type="button" className={`donate-btn donate-btn--${variant}`} onClick={open}>
      <HeartIcon />
      <span>{t('Colaborar')}</span>
    </button>
  );
}

const USES = ['Guantes y pinzas', 'Bolsas diferenciadas', 'Chalecos y botiquín', 'Material para las escuelas'];

function DonateModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lastFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      lastFocus?.focus();
    };
  }, [onClose]);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // navegadores sin permiso de portapapeles: selección manual
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  };

  return (
    <div className="donate-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="donate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button type="button" className="donate-modal__close" aria-label={t('Cerrar')} onClick={onClose}>
          ×
        </button>

        <div className="donate-modal__head">
          <span className="donate-modal__icon">
            <HeartIcon />
          </span>
          <h2 id="donate-title">{t('Colabora con Bayahibe Verde')}</h2>
          <p>
            {t(
              'Cada aporte se convierte en materiales para las brigadas escolares y se informa públicamente en qué se usó.',
            )}
          </p>
          <ul className="donate-uses">
            {USES.map((u) => (
              <li key={u}>{t(u)}</li>
            ))}
          </ul>
        </div>

        {DONATION_METHODS.map((m) => (
          <section key={m.title} className="donate-method">
            <h3>
              {t(m.title)}
              {m.note && <small>{t(m.note)}</small>}
            </h3>
            <dl>
              {m.fields.map((f) => {
                const key = `${m.title}-${f.name}`;
                const missing = f.value === PLACEHOLDER;
                return (
                  <div key={key} className={`donate-field${missing ? ' is-missing' : ''}`}>
                    <dt>{t(f.name)}</dt>
                    <dd>
                      <span>{missing ? t(PLACEHOLDER) : f.value}</span>
                      {f.copy && !missing && (
                        <button type="button" onClick={() => copy(key, f.value)}>
                          {copied === key ? t('¡Copiado!') : t('Copiar')}
                        </button>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}

        {(DONATION_CONTACT.whatsapp || DONATION_CONTACT.email) && (
          <div className="donate-contact">
            <p>{t('¿Quieres donar materiales o avisar tu aporte?')}</p>
            {DONATION_CONTACT.whatsapp && (
              <a className="btn btn--solid" href={`https://wa.me/${DONATION_CONTACT.whatsapp}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            {DONATION_CONTACT.email && (
              <a className="btn btn--ghost-dark" href={`mailto:${DONATION_CONTACT.email}`}>
                Email
              </a>
            )}
          </div>
        )}

        <p className="donate-thanks">{t('Gracias por cuidar Bayahibe con nosotros.')}</p>
      </div>
    </div>
  );
}

export function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.4.7-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z"
      />
    </svg>
  );
}
