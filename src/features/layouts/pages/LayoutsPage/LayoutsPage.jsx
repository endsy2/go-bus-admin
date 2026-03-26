import React, { useState, useEffect } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Badge } from 'shared/components/ui/badge';
import layoutService from '../../services/layoutService';
import CreateLayoutDialog from '../../components/CreateLayoutDialog/CreateLayoutDialog';
import EditLayoutDialog from '../../components/EditLayoutDialog/EditLayoutDialog';

const LayoutsPage = () => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const result = await layoutService.getAll();
      const layoutData = result.data || result;
      setLayouts(Array.isArray(layoutData) ? layoutData : []);
    } catch (error) {
      console.error('Failed to fetch layouts:', error);
      setLayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this layout?')) {
      try {
        await layoutService.delete(id);
        fetchLayouts();
      } catch (error) {
        console.error('Failed to delete layout:', error);
      }
    }
  };

  const renderLayoutPreview = (layout) => {
    const rows = Math.min(layout.rows || 0, 6);
    const cols = layout.columns || 0;
    const aisles = layout.seatConfiguration?.aisles || [2];

    return (
      <div className="space-y-1">
        <div className="flex justify-center mb-2">
          <div className="bg-gray-600 text-white px-3 py-1 rounded-t-xl text-[10px]">🚗</div>
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex justify-center gap-1">
            {Array.from({ length: cols }, (_, j) => (
              <React.Fragment key={j}>
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                {aisles.includes(j + 1) && j < cols - 1 && <div className="w-1" />}
              </React.Fragment>
            ))}
          </div>
        ))}
        {layout.rows > 6 && (
          <div className="text-center text-[10px] text-gray-400">+{layout.rows - 6} rows</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Seat Layouts</h1>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>Create Layout</Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">Loading layouts...</div>
        </Card>
      ) : layouts.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🪑</div>
            <div className="text-lg text-gray-600 mb-2">No seat layouts yet</div>
            <div className="text-sm text-gray-500 mb-4">Create your first layout to get started</div>
            <Button onClick={() => setShowCreateDialog(true)}>Create Layout</Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <Card key={layout.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{layout.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{layout.rows} rows</Badge>
                    <Badge variant="outline">{layout.columns} cols</Badge>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  {layout.totalSeats || (layout.rows * layout.columns)} seats
                </Badge>
              </div>

              {/* Visual Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {renderLayoutPreview(layout)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingLayout(layout)}
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(layout.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preview</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {layouts.map((layout) => (
                  <tr key={layout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{layout.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge variant="outline">{layout.rows}×{layout.columns}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{layout.totalSeats || (layout.rows * layout.columns)}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="scale-75 origin-left">
                        {renderLayoutPreview(layout)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditingLayout(layout)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(layout.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreateDialog && (
        <CreateLayoutDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchLayouts}
        />
      )}

      {editingLayout && (
        <EditLayoutDialog
          open={!!editingLayout}
          layout={editingLayout}
          onClose={() => setEditingLayout(null)}
          onSuccess={fetchLayouts}
        />
      )}
    </div>
  );
};

export default LayoutsPage;
