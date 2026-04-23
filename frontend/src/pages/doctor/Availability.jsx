import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorAPI, userAPI } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FiPlus, FiTrash2, FiSave, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SLOT = {
  day: 'Monday',
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  isAvailable: true,
};

const DoctorAvailability = () => {
  const qc = useQueryClient();
  const [slots, setSlots] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['doctor-full-profile'],
    queryFn: userAPI.getProfile,
  });

  // Populate slots from fetched profile (only once)
  useEffect(() => {
    if (!initialized && profileData) {
      const availability = profileData?.data?.data?.profile?.availability || [];
      setSlots(availability);
      setInitialized(true);
    }
  }, [profileData, initialized]);

  const updateMutation = useMutation({
    mutationFn: (data) => doctorAPI.updateAvailability(data),
    onSuccess: () => {
      toast.success('Availability saved!');
      qc.invalidateQueries(['doctor-full-profile']);
    },
    onError: () => toast.error('Save failed.'),
  });

  const addSlot = () =>
    setSlots((prev) => [...prev, { ...DEFAULT_SLOT }]);

  const removeSlot = (i) =>
    setSlots((prev) => prev.filter((_, idx) => idx !== i));

  const updateSlot = (i, field, value) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSave = () => updateMutation.mutate({ availability: slots });

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="page-wrapper max-w-3xl">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Set Availability</h1>
          <p className="page-subtitle">Define when patients can book appointments</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary"
        >
          <FiSave /> {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="card text-center py-12 mb-4">
          <FiClock className="mx-auto text-5xl text-slate-200 mb-4" />
          <p className="text-slate-500 mb-4">No availability configured yet</p>
          <button onClick={addSlot} className="btn-primary btn-sm">
            <FiPlus /> Add First Slot
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in"
            >
              {/* Available toggle + day */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <input
                    type="checkbox"
                    checked={slot.isAvailable}
                    onChange={(e) => updateSlot(i, 'isAvailable', e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  Available
                </label>
                <select
                  value={slot.day}
                  onChange={(e) => updateSlot(i, 'day', e.target.value)}
                  className="select w-36"
                >
                  {DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Time range */}
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                  className="input w-32"
                />
                <span className="text-slate-400 text-sm">–</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                  className="input w-32"
                />
              </div>

              {/* Duration & delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={slot.slotDuration}
                  onChange={(e) => updateSlot(i, 'slotDuration', Number(e.target.value))}
                  className="select w-28"
                >
                  {[15, 20, 30, 45, 60].map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeSlot(i)}
                  className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-400 transition"
                  title="Remove slot"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={addSlot} className="btn-outline w-full">
        <FiPlus /> Add Another Day
      </button>
    </div>
  );
};

export default DoctorAvailability;
