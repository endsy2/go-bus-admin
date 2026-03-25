import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';

const ConfirmDialog = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{message}</p>
            <p className="text-sm italic text-muted-foreground">{t('actionCannotBeUndone')}</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            variant={type === 'danger' ? 'destructive' : type === 'warning' ? 'default' : 'default'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
