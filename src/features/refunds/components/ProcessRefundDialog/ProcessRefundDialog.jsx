import React, { useState } from 'react';
import { Button } from 'shared/components/common/Button';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';

const ProcessRefundDialog = ({ open, onClose, refund, onProcess }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!open || !refund) return null;

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      await onProcess(refund.id, action === 'approve', action === 'reject' ? rejectionReason : null);
      onClose();
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('processRefund') || 'Process Refund'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Refund Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Refund ID:</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">#{refund.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Booking ID:</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">#{refund.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Amount:</span>
              <span className="text-sm font-bold text-green-500">${refund.refundAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Reason:</span>
              <span className="text-sm text-slate-900 dark:text-white">{refund.reason || 'N/A'}</span>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('action') || 'Action'}
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-300'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">{t('approve') || 'Approve'}</span>
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">{t('reject') || 'Reject'}</span>
              </button>
            </div>
          </div>

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('rejectionReason') || 'Rejection Reason'} *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder={t('enterRejectionReason') || 'Enter reason for rejection...'}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={processing}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            variant={action === 'approve' ? 'success' : 'danger'}
            onClick={handleSubmit}
            disabled={processing || (action === 'reject' && !rejectionReason.trim())}
            className={`flex-1 ${
              action === 'approve'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {processing ? t('processing') || 'Processing...' : t('confirm') || 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcessRefundDialog;
