import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Label } from 'shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shared/components/ui/select';
import { Skeleton } from 'shared/components/ui/skeleton';
import { useLocale } from 'shared/context/LocaleContext';
import { translations } from 'shared/locales/translations';
import walletService from '../../services/walletService';
import { Wallet, User, CheckCircle, AlertCircle } from 'lucide-react';

const CreateWalletDialog = ({ open, onClose, onSuccess }) => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedUserId('');
      setSubmitError(null);
      setSuccess(false);
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const response = await walletService.getWallets({ status: 'ACTIVE' }, 0, 100);
      
      // Extract users from response - handle different response structures
      let userData = [];
      if (response?.data?.content) {
        userData = response.data.content;
      } else if (response?.content) {
        userData = response.content;
      } else if (response?.data) {
        userData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        userData = response;
      }
      
      // Get unique users who don't have wallets yet
      const usersWithWallets = new Set(userData.map(w => w.userId).filter(Boolean));
      
      // Fetch all users
      const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
      const usersResponse = await fetch(
        `${BASE_URL}/api/users/specification?pageStart=1&pageSize=100&isEmployee=false`,
        {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      
      const usersData = await usersResponse.json();
      const allUsers = usersData?.data?.content ?? usersData?.content ?? usersData?.data ?? usersData ?? [];
      
      // Filter out users who already have wallets
      const availableUsers = Array.isArray(allUsers) 
        ? allUsers.filter(user => !usersWithWallets.has(user.id))
        : [];
      
      setUsers(availableUsers);
      
      if (availableUsers.length === 0) {
        setUsersError('All users already have wallets');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      await walletService.createWallet(selectedUserId);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            Create wallet
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="bg-green-500/10 p-4 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Wallet created successfully!
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-purple-400" />
                Select user
              </Label>

              {usersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : usersError ? (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {usersError}
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-slate-500">
                        No users available
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.fullName || user.userName || user.email || `User #${user.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {submitError}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedUserId || submitting || usersLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {submitting ? 'Creating...' : 'Create wallet'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWalletDialog;
