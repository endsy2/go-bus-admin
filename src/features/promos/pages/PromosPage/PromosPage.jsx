import React, { useState, useEffect } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Badge } from 'shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import promoService from '../../services/promoService';
import CreatePromoDialog from '../../components/CreatePromoDialog/CreatePromoDialog';
import EditPromoDialog from '../../components/EditPromoDialog/EditPromoDialog';

const PromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const result = await promoService.getAll();
      const promoData = result.data || result;
      setPromos(Array.isArray(promoData) ? promoData : []);
    } catch (error) {
      console.error('Failed to fetch promos:', error);
      setPromos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this promo code?')) {
      try {
        await promoService.delete(id);
        fetchPromos();
      } catch (error) {
        console.error('Failed to delete promo:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promo Codes</h1>
        <Button onClick={() => setShowCreateDialog(true)}>Create Promo</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No promo codes found</TableCell>
              </TableRow>
            ) : (
              promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono font-bold">{promo.code}</TableCell>
                  <TableCell>{promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue}`}</TableCell>
                  <TableCell>{promo.discountType}</TableCell>
                  <TableCell>{new Date(promo.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingPromo(promo)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(promo.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showCreateDialog && (
        <CreatePromoDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchPromos}
        />
      )}

      {editingPromo && (
        <EditPromoDialog
          open={!!editingPromo}
          promo={editingPromo}
          onClose={() => setEditingPromo(null)}
          onSuccess={fetchPromos}
        />
      )}
    </div>
  );
};

export default PromosPage;
