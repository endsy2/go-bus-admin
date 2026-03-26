import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import { Checkbox } from 'shared/components/ui/checkbox';
import promoService from '../../services/promoService';

const EditPromoDialog = ({ open, promo, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: promo.code || '',
    discountValue: promo.discountValue || '',
    validUntil: promo.validUntil?.split('T')[0] || '',
    maxUses: promo.maxUses || '',
    isActive: promo.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await promoService.update(promo.id, {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxUses: parseInt(formData.maxUses),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update promo:', error);
      alert('Failed to update promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Promo Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input value={formData.code} disabled />
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Max Uses</Label>
              <Input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPromoDialog;
