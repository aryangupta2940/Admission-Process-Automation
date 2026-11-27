import { useEffect, useState } from 'react';
import { Download, Eye, FileText, Loader2, X } from 'lucide-react';
import api from '../api/client';

export default function SecureFilePreview({ label, docMeta }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (!docMeta || !docMeta.fileId) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        {label}: Not uploaded
      </div>
    );
  }

  const isImage = docMeta.mimeType?.startsWith('image/');
  const sizeKb = docMeta.size ? `${(docMeta.size / 1024).toFixed(1)} KB` : '';

  async function fetchBlobUrl() {
    if (objectUrl) return objectUrl;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/files/${docMeta.fileId}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setObjectUrl(url);
      return url;
    } catch {
      setError('Unable to load document.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handlePreview() {
    const url = await fetchBlobUrl();
    if (url) setModalOpen(true);
  }

  async function handleDownload() {
    const url = await fetchBlobUrl();
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = docMeta.fileName || `${label}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="truncate text-xs text-slate-500">
              {docMeta.fileName} {sizeKb ? `(${sizeKb})` : ''}
            </p>
            {error && <p className="text-xs text-rose-600">{error}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
            View
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {modalOpen && objectUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                <p className="text-xs text-slate-500">{docMeta.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              {isImage ? (
                <img
                  src={objectUrl}
                  alt={label}
                  className="mx-auto max-h-[72vh] rounded-lg object-contain shadow"
                />
              ) : (
                <iframe
                  src={objectUrl}
                  title={label}
                  className="h-[72vh] w-full rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
