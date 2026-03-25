import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import Badge from '../../atoms/Badge/Badge';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import { Loader2 } from 'lucide-react';

const BookingTable = ({ bookings, loading }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t('loadingBookings')}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentBookings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('bookingId')}</TableHead>
                <TableHead>{t('customer')}</TableHead>
                <TableHead>{t('route')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.customer}</TableCell>
                  <TableCell>{booking.route}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status}>
                      {t(booking.status.toLowerCase())}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingTable;
