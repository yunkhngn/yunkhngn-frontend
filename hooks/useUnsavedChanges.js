import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

function isInternalHref(href, origin) {
  if (!href || href.startsWith('#')) return false;
  try {
    const u = new URL(href, origin);
    return u.origin === origin;
  } catch {
    return href.startsWith('/');
  }
}

export function useUnsavedChanges(isDirty) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const isConfirmed = useRef(false);

  const confirmNavigation = useCallback(() => {
    if (nextUrl) {
      isConfirmed.current = true;
      setShowModal(false);
      router.push(nextUrl);
    }
  }, [nextUrl, router]);

  useEffect(() => {
    const handleWindowClose = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
    };

    const handleCaptureClick = (e) => {
      if (!isDirty || isConfirmed.current) return;
      const anchor = e.target.closest?.('a');
      if (!anchor || anchor.target === '_blank' || anchor.download) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (!isInternalHref(href, window.location.origin)) return;
      if (anchor.hasAttribute('data-skip-unsaved-prompt')) return;
      e.preventDefault();
      e.stopPropagation();
      const resolved = href.startsWith('http') ? new URL(href).pathname + new URL(href).search : href;
      setNextUrl(resolved);
      setShowModal(true);
    };

    window.addEventListener('beforeunload', handleWindowClose);
    document.addEventListener('click', handleCaptureClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      document.removeEventListener('click', handleCaptureClick, true);
    };
  }, [isDirty]);

  return {
    showModal,
    setShowModal,
    confirmNavigation,
  };
}
