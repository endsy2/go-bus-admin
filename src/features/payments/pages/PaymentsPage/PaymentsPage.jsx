import React, { useState } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import paymentService from '../../services/paymentService';

const PaymentsPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateKHQR = async () => {
    try {
      setLoading(true);
      const result = await paymentService.bakong.generateKHQR({
        bookingId,
        amount: parseFloat(amount),
      });
      setQrCode(result.data || result);
    } catch (error) {
      console.error('Failed to generate KHQR:', error);
      alert('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Bakong KHQR</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Booking ID</Label>
              <Input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter booking ID"
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <Button
              onClick={handleGenerateKHQR}
              disabled={loading || !bookingId || !amount}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </div>
        </Card>

        {qrCode && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generated QR Code</h2>
            <div className="flex justify-center">
              <img src={qrCode.qrCodeUrl} alt="KHQR Code" className="max-w-full" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Transaction ID: {qrCode.transactionId}</p>
              <p>Amount: ${qrCode.amount}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
