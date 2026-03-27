import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'shared/components/ui/dialog';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  DollarSign,
  Bus,
  Armchair,
  Phone,
  Mail
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import { Badge } from 'shared/components/common/Badge';

const BookingDetailsDialog = ({ open, onClose, bookingId }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && bookingId) {
      fetchBookingDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      CONFIRMED: 'success',
      PENDING: 'warning',
      CANCELLED: 'danger',
      COMPLETED: 'info',
    };
    return statusMap[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      PAID: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REFUNDED: 'info',
    };
    return statusMap[status] || 'default';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            {t('bookingDetails') || 'Booking Details'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : booking ? (
          <div className="space-y-6">
            {/* Booking Status */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {t('bookingId') || 'Booking ID'}: #{booking.id}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('bookingReference') || 'Reference'}: {booking.bookingReference}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(booking.bookingStatus)}>
                    {booking.bookingStatus}
                  </Badge>
                  <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                {t('customerInformation') || 'Customer Information'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('name') || 'Name'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.userName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {t('phone') || 'Phone'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.userPhone || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {t('email') || 'Email'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.userEmail || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                {t('scheduleInformation') || 'Schedule Information'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('route') || 'Route'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.routeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('bus') || 'Bus'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.busNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t('departureDate') || 'Departure Date'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(booking.departureTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t('departureTime') || 'Departure Time'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(booking.departureTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Seat Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Armchair className="w-5 h-5 text-indigo-600" />
                {t('seatInformation') || 'Seat Information'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {booking.seatNumbers?.map((seat, index) => (
                  <div
                    key={index}
                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-semibold border border-green-300 dark:border-green-700"
                  >
                    {seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                {t('paymentInformation') || 'Payment Information'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {t('paymentMethod') || 'Payment Method'}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {booking.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {t('totalAmount') || 'Total Amount'}
                  </p>
                  <p className="font-semibold text-2xl text-indigo-600 dark:text-indigo-400">
                    ${booking.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    {t('createdAt') || 'Created At'}
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    {t('updatedAt') || 'Updated At'}
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              {t('bookingNotFound') || 'Booking not found'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
