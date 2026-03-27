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
  CreditCard
} from 'lucide-react';
import BookingDetailsDialog from '../../components/BookingDetailsDialog/BookingDetailsDialog';
import BookingFilters from '../../components/BookingFilters/BookingFilters';
import ConfirmDialog from 'shared/components/feedback/ConfirmDialog';
import bookingService from '../../services/bookingService';

const BookingsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  const { bookings, loading, pagination, updateFilters, goToPage, refetch } = useBookings();
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
      </div>

      {/* Filters */}
      <BookingFilters 
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Bookings Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {bookings.map(booking => (
              <Card 
                key={booking.id}
                className="bg-slate-900 border-slate-800 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Ticket className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 mb-1">
                          {t('bookingId') || 'Booking ID'}
                        </p>
                        <CardTitle className="text-base font-bold text-white truncate">
                          #{booking.id}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(booking.bookingStatus)}>
                      {booking.bookingStatus}
                    </Badge>
                    <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Customer */}
                  <div className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
                    <div className="bg-purple-500/10 p-2 rounded-lg">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">
                        {t('customer') || 'Customer'}
                      </p>
                      <p className="font-medium text-white truncate text-sm">
                        {booking.userName}
                      </p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">
                        {t('route') || 'Route'}
                      </p>
                      <p className="font-medium text-white truncate text-sm">
                        {booking.routeName}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
                    <div className="bg-pink-500/10 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">
                        {t('departure') || 'Departure'}
                      </p>
                      <p className="font-medium text-white text-sm">
                        {new Date(booking.departureTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-3 p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-400">
                        {t('totalAmount') || 'Total Amount'}
                      </p>
                      <p className="font-bold text-lg text-green-400">
                        ${booking.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <CreditCard className="w-3 h-3" />
                    <span>{booking.paymentMethod}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-800">
                    <Button 
                      variant="secondary" 
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-700 text-white transition-all duration-200"
                      onClick={() => handleViewDetails(booking.id)}
                    >
                      <Eye className="w-4 h-4" />
                      {t('view') || 'View'}
                    </Button>
                    {booking.bookingStatus !== 'CANCELLED' && (
                      <Button 
                        variant="warning"
                        className="w-10 h-10 p-0 flex items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all duration-200"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="danger"
                      className="w-10 h-10 p-0 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-200"
                      onClick={() => handleDeleteClick(booking)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
};

export default BookingsPage;
