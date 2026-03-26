import React, { useState, useEffect } from 'react';
import { Card } from 'shared/components/ui/card';
import { Button } from 'shared/components/ui/button';
import { Input } from 'shared/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'shared/components/ui/table';
import scheduleService from '../../services/scheduleService';
import CreateScheduleDialog from '../../components/CreateScheduleDialog/CreateScheduleDialog';
import EditScheduleDialog from '../../components/EditScheduleDialog/EditScheduleDialog';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const result = await scheduleService.getAll();
      const scheduleData = result.data || result;
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this schedule?')) {
      try {
        await scheduleService.delete(id);
        fetchSchedules();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.busNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <Button onClick={() => setShowCreateDialog(true)}>Create Schedule</Button>
      </div>

      <Card className="p-4 mb-4">
        <Input
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No schedules found</TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.routeName}</TableCell>
                  <TableCell>{schedule.busNumber}</TableCell>
                  <TableCell>{new Date(schedule.departureTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(schedule.arrivalTime).toLocaleString()}</TableCell>
                  <TableCell>${schedule.price}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingSchedule(schedule)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {showCreateDialog && (
        <CreateScheduleDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchSchedules}
        />
      )}

      {editingSchedule && (
        <EditScheduleDialog
          open={!!editingSchedule}
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSuccess={fetchSchedules}
        />
      )}
    </div>
  );
};

export default SchedulesPage;
