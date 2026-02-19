import { useState, useRef, useEffect } from 'react';
import { Share2, X, Copy, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function ShareMenu({ masjidName, menu, maghrib }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const { addToast } = useToast();

  const shareText = `🌙 Tonight's Iftaar at ${masjidName}\n🍽️ ${menu}\n⏰ Iftaar at ${maghrib || '6:08'} PM\n\n📱 MasjidConnect GY — masjidconnectgy.com`;
  const shareUrl = window.location.href;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Iftaar at ${masjidName}`, text: shareText, url: shareUrl });
      } catch {}
    }
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      setCopied(true);
      addToast('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy', 'error');
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => navigator.share ? handleNativeShare() : setOpen(!open)}
        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-all"
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 w-48 animate-fade-in">
          <button onClick={() => { setOpen(false); }} aria-label="Close share menu" className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600">
            <X className="w-3 h-3" />
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setOpen(false)}
          >
            <span>✈️</span> Telegram
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors w-full"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
