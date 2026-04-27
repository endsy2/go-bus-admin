import React, { useState } from 'react';
import { usePromos } from '../../hooks/usePromos';
import { Card, CardContent, CardHeader, CardTitle } from 'shared/components/ui/card';
import { Badge } from 'shared/components/common/Badge';
import { Button } from 'shared/components/common/Button';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import { useToast } from 'shared/components/ui/toast';
import { 
  Tag, 
  Plus,
  Edit, 
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import CreatePromoDialog from '../../components/CreatePromoDialog/CreatePromoDialog';
import EditPromoDialog from '../../components/EditPromoDialog/EditPromoDialog';
import ConfirmDialog from 'shared/components/feedback/ConfirmDialog';
import promoService from '../../services/promoService';

const PromosPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const { addToast } = useToast();
  const { promos, loading, refetch } = usePromos();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    refetch();
  };

  const handleEditClick = (promo) => {
    setSelectedPromo(promo);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedPromo(null);
    refetch();
  };

  const handleDeleteClick = (promo) => {
    setSelectedPromo(promo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await promoService.deletePromo(selectedPromo.id);
      setDeleteDialogOpen(false);
      setSelectedPromo(null);
      refetch();
      addToast({ message: t('promoDeletedSuccess') || 'Promo code deleted successfully', type: 'success' });
    } catch (error) {
      addToast({ message: error.response?.data?.message || 'Failed to delete promo code', type: 'error' });
    }
  };

  const getStatusBadge = (promo) => {
    if (promo.status === 'INACTIVE') {
      return <Badge variant="default">INACTIVE</Badge>;
    }
    
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validTo = promo.validTo ? new Date(promo.validTo) : null;
    
    if (now < validFrom) {
      return <Badge variant="info">UPCOMING</Badge>;
    } else if (validTo && now > validTo) {
      return <Badge variant="default">EXPIRED</Badge>;
    } else if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return <Badge variant="danger">EXHAUSTED</Badge>;
    } else {
      return <Badge variant="success">ACTIVE</Badge>;
    }
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}%`;
    } else {
      return `$${promo.discountValue.toFixed(2)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Tag className="w-7 h-7 text-blue-500 dark:text-blue-400" />
            {t('promoManagement') || 'Promo Code Management'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            {t('managePromoCodes') || 'Manage promotional codes and discounts'}
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-5 h-5" />
          {t('newPromo') || 'New Promo'}
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {t('noPromosFound') || 'No promo codes found'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t('createFirstPromo') || 'Create your first promo code to get started'}
          </p>
          <Button 
            variant="primary" 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('createPromo') || 'Create Promo'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {promos.map(promo => (
            <Card 
              key={promo.id}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-blue-500/10 p-2.5 rounded-lg">
                      <Tag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {promo.code}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                {getStatusBadge(promo)}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Description */}
                {promo.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[40px]">
                    {promo.description}
                  </p>
                )}

                {/* Discount */}
                <div className="flex items-center gap-3 p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    {promo.discountType === 'PERCENTAGE' ? (
                      <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {t('discount') || 'Discount'}
                    </p>
                    <p className="font-bold text-xl text-green-600 dark:text-green-400">
                      {getDiscountDisplay(promo)}
                    </p>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {t('usage') || 'Usage'}
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {promo.usedCount || 0} / {promo.maxUses || '∞'}
                    </p>
                  </div>
                </div>

                {/* Valid Period */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(promo.validFrom).toLocaleDateString()} - {promo.validTo ? new Date(promo.validTo).toLocaleDateString() : 'No expiration'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button 
                    variant="secondary" 
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    onClick={() => handleEditClick(promo)}
                  >
                    <Edit className="w-4 h-4" />
                    {t('edit') || 'Edit'}
                  </Button>
                  <Button 
                    variant="danger"
                    className="w-11 h-11 p-0 flex items-center justify-center bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/20"
                    onClick={() => handleDeleteClick(promo)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePromoDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedPromo && (
        <EditPromoDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedPromo(null);
          }}
          promo={selectedPromo}
          onSuccess={handleEditSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedPromo(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('deletePromo') || 'Delete Promo Code'}
        message={`${t('confirmDeletePromo') || 'Are you sure you want to delete promo code'} "${selectedPromo?.code}"?`}
        type="danger"
      />
    </div>
  );
};

export default PromosPage;
