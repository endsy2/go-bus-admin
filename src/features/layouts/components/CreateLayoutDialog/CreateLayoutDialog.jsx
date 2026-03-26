import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'shared/components/ui/dialog';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Label } from 'shared/components/ui/label';
import { Card } from 'shared/components/ui/card';
import layoutService from '../../services/layoutService';

const CreateLayoutDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    rows: '10',
    columns: '4',
    aisles: '2',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const aisleArray = formData.aisles.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));
      await layoutService.create({
        name: formData.name,
        rows: parseInt(formData.rows),
        columns: parseInt(formData.columns),
        seatConfiguration: { aisles: aisleArray },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create layout:', error);
      alert('Failed to create layout');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    const rows = parseInt(formData.rows) || 0;
    const cols = parseInt(formData.columns) || 0;
    const aisleArray = formData.aisles.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));
    
    if (rows === 0 || cols === 0 || rows > 20 || cols > 10) {
      return <div className="text-center text-gray-400 py-8">Preview will appear here</div>;
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-700 text-white px-4 py-2 rounded-t-2xl text-xs">🚗 Driver</div>
        </div>
        {Array.from({ length: Math.min(rows, 8) }, (_, i) => (
          <div key={i} className="flex justify-center gap-1">
            {Array.from({ length: cols }, (_, j) => (
              <React.Fragment key={j}>
                <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center text-[8px]">
                  {String.fromCharCode(65 + i)}{j + 1}
                </div>
                {aisleArray.includes(j + 1) && j < cols - 1 && (
                  <div className="w-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        ))}
        {rows > 8 && (
          <div className="text-center text-xs text-gray-400">... {rows - 8} more rows</div>
        )}
      </div>
    );
  };

  const totalSeats = (parseInt(formData.rows) || 0) * (parseInt(formData.columns) || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Seat Layout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <Label>Layout Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Standard 40-seater"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Columns</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.columns}
                    onChange={(e) => setFormData({ ...formData, columns: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Aisle After Column(s)</Label>
                <Input
                  value={formData.aisles}
                  onChange={(e) => setFormData({ ...formData, aisles: e.target.value })}
                  placeholder="2 (or 2,4 for multiple)"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated column numbers</p>
              </div>
              
              <Card className="p-3 bg-blue-50 border-blue-200">
                <div className="text-sm font-semibold text-blue-900">Total Seats</div>
                <div className="text-2xl font-bold text-blue-700">{totalSeats}</div>
              </Card>
            </div>

            {/* Preview Section */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <Card className="p-4 bg-gray-50 max-h-96 overflow-auto">
                {renderPreview()}
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Layout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLayoutDialog;
