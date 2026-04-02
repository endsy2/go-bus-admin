import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from 'shared/components/ui/card';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { useToast } from 'shared/components/ui/toast';
import { 
  User, 
  MapPin, 
  Calendar, 
  Eye, 
  XCircle, 
  Trash2, 
  Ticket,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  CheckCircle,
  Banknote,
  Plus
} from 'lucide-react';
import BookingDetailsDialog from '../../components/BookingDetailsDialog/BookingDetailsDialog';
import CreateBookingDialog from '../../components/CreateBookingDialog/CreateBookingDialog';
import BookingFilters from '../../components/BookingFilters/BookingFilters';
import ConfirmDialog from 'shared/components/feedback/ConfirmDialog';
import bookingService from '../../services/bookingService';

const BookingsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  const { bookings, loading, pagination, updateFilters, goToPage, refetch } = useBookings();
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDetailsDialogOpen(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await bookingService.cancelBooking(selectedBooking.id);
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      refetch();
      addToast({ message: t('bookingCancelledSuccess') || 'Booking cancelled successfully', type: 'success' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to cancel booking', type: 'error' });
    }
  };

  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await bookingService.deleteBooking(selectedBooking.id);
      setDeleteDialogOpen(false);
      setSelectedBooking(null);
      refetch();
      addToast({ message: t('bookingDeletedSuccess') || 'Booking deleted successfully', type: 'success' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to delete booking', type: 'error' });
    }
  };

  const handleConfirmClick = (booking) => {
    setSelectedBooking(booking);
    setConfirmDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    try {
      await bookingService.confirmBooking(selectedBooking.id);
      setConfirmDialogOpen(false);
      setSelectedBooking(null);
      refetch();
      addToast({ message: t('bookingConfirmedSuccess') || 'Booking confirmed successfully', type: 'success' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to confirm booking', type: 'error' });
    }
  };

  const handleMarkPaidClick = (booking) => {
    setSelectedBooking(booking);
    setMarkPaidDialogOpen(true);
  };

  const handleMarkPaidConfirm = async () => {
    try {
      await bookingService.forceMarkPaid(selectedBooking.id);
      setMarkPaidDialogOpen(false);
      setSelectedBooking(null);
      refetch();
      addToast({ message: t('bookingMarkedPaidSuccess') || 'Booking marked as paid successfully', type: 'success' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to mark booking as paid', type: 'error' });
    }
  };

  const handleFilterChange = (filters) => {
    updateFilters(filters);
  };

  const handleResetFilters = () => {
    updateFilters({});
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

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-slate-950 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>

        <Skeleton className="h-32 w-full mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Ticket className="w-7 h-7 text-blue-500" />
            {t('bookingsManagement') || 'Bookings Management'}
          </h1>
          <p className="text-slate-400 text-base">
            {t('manageAllBusTicketBookings') || 'Manage all bus ticket bookings'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-5 h-5" />
          {t('createBooking') || 'Create Booking'}
        </Button>
      </div>

      {/* Filters */}
      <BookingFilters 
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800">
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {t('noBookingsFound') || 'No bookings found'}
          </h3>
          <p className="text-slate-400">
            {t('noBookingsMatchFilters') || 'No bookings match your current filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('bookingId') || 'Booking ID'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('customer') || 'Customer'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('route') || 'Route'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('departure') || 'Departure'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('status') || 'Status'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('payment') || 'Payment'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('totalAmount') || 'Total'}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Ticket className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="font-semibold text-white">#{booking.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400" />
                          <span className="text-white">{booking.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span className="text-white">{booking.routeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-pink-400" />
                          <span className="text-white text-sm">
                            {new Date(booking.departureTime).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getStatusColor(booking.bookingStatus)}>
                          {booking.bookingStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-lg text-green-400">
                          ${booking.totalAmount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="secondary" 
                            className="w-9 h-9 p-0 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border-slate-700 text-white transition-all duration-200"
                            onClick={() => handleViewDetails(booking.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.bookingStatus === 'PENDING' && (
                            <Button 
                              variant="success"
                              className="w-9 h-9 p-0 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all duration-200"
                              onClick={() => handleConfirmClick(booking)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {booking.paymentStatus !== 'PAID' && booking.bookingStatus !== 'CANCELLED' && (
                            <Button 
                              variant="success"
                              className="w-9 h-9 p-0 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all duration-200"
                              onClick={() => handleMarkPaidClick(booking)}
                            >
                              <Banknote className="w-4 h-4" />
                            </Button>
                          )}
                          {booking.bookingStatus !== 'CANCELLED' && (
                            <Button 
                              variant="warning"
                              className="w-9 h-9 p-0 flex items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all duration-200"
                              onClick={() => handleCancelClick(booking)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="danger"
                            className="w-9 h-9 p-0 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-200"
                            onClick={() => handleDeleteClick(booking)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('previous') || 'Previous'}
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i;
                  } else if (pagination.currentPage < 3) {
                    pageNum = i;
                  } else if (pagination.currentPage > pagination.totalPages - 3) {
                    pageNum = pagination.totalPages - 5 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              >
                {t('next') || 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <BookingDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId}
      />

      <CreateBookingDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
        }}
      />

      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onCancel={() => {
          setCancelDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelConfirm}
        title={t('cancelBooking') || 'Cancel Booking'}
        message={`${t('confirmCancelBooking') || 'Are you sure you want to cancel booking'} #${selectedBooking?.id}?`}
        type="warning"
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('deleteBooking') || 'Delete Booking'}
        message={`${t('confirmDeleteBooking') || 'Are you sure you want to delete booking'} #${selectedBooking?.id}?`}
        type="danger"
      />

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onCancel={() => {
          setConfirmDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmBooking}
        title={t('confirmBooking') || 'Confirm Booking'}
        message={`${t('confirmBookingMessage') || 'Are you sure you want to confirm booking'} #${selectedBooking?.id}?`}
        type="success"
      />

      <ConfirmDialog
        isOpen={markPaidDialogOpen}
        onCancel={() => {
          setMarkPaidDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleMarkPaidConfirm}
        title={t('markAsPaid') || 'Mark as Paid'}
        message={`${t('confirmMarkPaidMessage') || 'Are you sure you want to mark booking'} #${selectedBooking?.id} ${t('asPaid') || 'as paid'}?`}
        type="success"
      />
    </div>
  );
};

export default BookingsPage;
