import React, { useState, useEffect, useCallback } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useMultiScheduleWebSocket } from '../../hooks/useMultiScheduleWebSocket';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { useToast } from 'shared/components/ui/toast';
import {
  Eye,
  Banknote,
  Plus,
  Ticket,
  Wifi,
  WifiOff,
} from 'lucide-react';
import BookingDetailsDialog from '../../components/BookingDetailsDialog/BookingDetailsDialog';
import CreateBookingDialog from '../../components/CreateBookingDialog/CreateBookingDialog';
import BookingFilters from '../../components/BookingFilters/BookingFilters';
import ConfirmDialog from 'shared/components/feedback/ConfirmDialog';
import { Pagination } from 'shared/components/feedback/Pagination';
import bookingService from '../../services/bookingService';

const BookingsPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  const { bookings, loading, pagination, updateFilters, resetFilters, goToPage, changePageSize, refetch } = useBookings();

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Get unique schedule IDs from current bookings
  const scheduleIds = [...new Set(bookings.map(b => b.scheduleId).filter(Boolean))];

  // Handle seat updates from WebSocket
  const handleSeatUpdate = useCallback((data) => {
    console.log('Seat update received:', data);
    
    // Show toast notification based on event type
    if (data.type === 'SEAT_BOOKED') {
      addToast({
        message: `Seat ${data.seatNumber} has been booked on schedule #${data.scheduleId}`,
        type: 'info'
      });
    } else if (data.type === 'SEAT_RELEASED') {
      addToast({
        message: `Seat ${data.seatNumber} is now available on schedule #${data.scheduleId}`,
        type: 'info'
      });
    }

    // Refetch bookings to get updated data
    refetch();
  }, [addToast, refetch]);

  // Subscribe to WebSocket for all schedules
  const { isConnected, subscribedSchedules } = useMultiScheduleWebSocket(
    scheduleIds,
    handleSeatUpdate,
    scheduleIds.length > 0 // Only enable if there are schedules
  );

  // Update connection status
  useEffect(() => {
    setWsConnected(isConnected);
  }, [isConnected]);

  // Log subscribed schedules for debugging
  useEffect(() => {
    if (subscribedSchedules.length > 0) {
      console.log('Subscribed to schedules:', subscribedSchedules);
    }
  }, [subscribedSchedules]);

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDetailsDialogOpen(true);
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
    resetFilters();
  };

  const handlePageChange = (newPage) => {
    goToPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    changePageSize(newSize);
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

  const getRowBackgroundColor = () => 'hover:bg-muted/50 transition-colors';

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1 flex items-center gap-2">
            <span>{t('bookingsManagement') || 'Bookings Management'}</span>
            {wsConnected ? (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-green-600 dark:text-green-400">
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <WifiOff className="w-3 h-3" />
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('manageAllBusTicketBookings') || 'Manage all bus ticket bookings'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('createBooking') || 'Create Booking'}</span>
        </Button>
      </div>

      {/* Filters */}
      <BookingFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Bookings Content */}
      {loading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {['Booking ID', 'Customer', 'Destination', 'Created Date', 'Status', 'Payment', 'Total', 'Actions'].map(col => (
                      <th key={col} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                        <td key={j} className="px-4 py-4">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg border border-border p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-card rounded-lg border border-border">
          <div className="bg-muted w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {t('noBookingsFound') || 'No bookings found'}
          </h3>
          <p className="text-sm text-muted-foreground px-4">
            {t('noBookingsMatchFilters') || 'No bookings match your current filters'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('bookingId') || 'Booking ID'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('customer') || 'Customer'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('route') || 'Destination'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('createdDate') || 'Created Date'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('status') || 'Status'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('payment') || 'Payment'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('totalAmount') || 'Total'}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map(booking => (
                    <tr key={booking.id} className={getRowBackgroundColor()}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground text-sm">#{booking.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground text-sm">{booking.fullName || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground text-sm">{booking.destination || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground text-sm">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
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
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-foreground text-sm">
                          ${booking.totalAmount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {booking.paymentStatus === 'PENDING' && booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleMarkPaidClick(booking)}
                              title="Force Mark as Paid"
                            >
                              <Banknote className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleViewDetails(booking.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">#{booking.id}</span>
                    <span className="font-medium text-foreground text-sm">${booking.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getStatusColor(booking.bookingStatus)}>
                      {booking.bookingStatus}
                    </Badge>
                    <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="text-foreground font-medium truncate ml-4">{booking.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="text-foreground font-medium truncate ml-4">{booking.destination || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 border-t border-border flex gap-2">
                  {booking.paymentStatus === 'PENDING' && booking.bookingStatus !== 'CANCELLED' && booking.bookingStatus !== 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => handleMarkPaidClick(booking)}
                    >
                      <Banknote className="w-4 h-4" />
                      Mark Paid
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleViewDetails(booking.id)}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {bookings.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.size}
              totalElements={pagination.totalElements}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
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
