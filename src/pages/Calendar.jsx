import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalIcon } from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showBlock, setShowBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({ fecha: '', horaInicio: '08:00', horaFin: '09:00', motivo: '' });
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useNotification();

  useEffect(() => { loadEvents(); }, [currentDate]);

  const loadEvents = async () => {
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      const data = await api.get(`/calendario/eventos?inicio=${start}&fin=${end}`);
      setEvents(data);
    } catch (e) { showError(e.message); }
    finally { setLoading(false); }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getDayEvents = (date) => {
    const str = date.toISOString().split('T')[0];
    return events.filter(e => e.start?.startsWith(str));
  };

  const generateDays = () => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const days = [];

    for (let i = startDay - 1; i >= 0; i--) days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), -i), current: false });
    for (let i = 1; i <= last.getDate(); i++) days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), current: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i), current: false });

    return days;
  };

  const blockTime = async () => {
    if (!blockForm.fecha || !blockForm.horaInicio || !blockForm.horaFin) { showError('Completa todos los campos'); return; }
    try {
      await api.post('/calendario/bloquear', blockForm);
      success('Horario bloqueado');
      setShowBlock(false);
      setBlockForm({ fecha: '', horaInicio: '08:00', horaFin: '09:00', motivo: '' });
      loadEvents();
    } catch (e) { showError(e.message); }
  };

  const unblockTime = async (id) => {
    try {
      await api.del(`/calendario/bloquear/${id}`);
      success('Horario desbloqueado');
      loadEvents();
    } catch (e) { showError(e.message); }
  };

  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  const days = generateDays();
  const today = new Date();

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Calendario</h1>
        <button onClick={() => setShowBlock(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Bloquear horario
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500" /> Clase confirmada</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500" /> Pendiente</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500" /> No disponible</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold capitalize min-w-48 text-center">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-surface-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
        <button onClick={goToday} className="btn-secondary ml-2 text-sm py-1.5 px-4">Hoy</button>
      </div>

      {/* Monthly grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden mb-8">
          <div className="grid grid-cols-7">
            {DAYS.map(d => <div key={d} className="p-3 text-center text-sm font-semibold text-surface-500 bg-surface-50 border-b">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayEvents = getDayEvents(day.date);
              const isToday = day.date.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`calendar-day min-h-[80px] sm:min-h-[100px] ${!day.current ? 'calendar-day-other' : ''} ${isToday ? 'calendar-day-today' : ''}`}
                  onClick={() => dayEvents.length > 0 && setSelectedDay({ date: day.date, events: dayEvents })}
                >
                  <span className={`text-sm font-medium ${isToday ? 'bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-surface-700'}`}>
                    {day.date.getDate()}
                  </span>
                  {dayEvents.slice(0, 2).map((ev, j) => (
                    <div key={j} className={`event-chip event-${ev.tipo}`}>{ev.title.length > 18 ? ev.title.substring(0, 18) + '...' : ev.title}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-surface-400 font-medium">+{dayEvents.length - 2} mas</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly view */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-surface-100">
          <h3 className="font-semibold flex items-center gap-2"><CalIcon className="w-5 h-5 text-surface-400" /> Vista semanal</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-xs text-surface-400" />
              {DAYS.map(d => <div key={d} className="p-2 text-center text-xs font-semibold text-surface-500 bg-surface-50">{d}</div>)}
            </div>
            {HOURS.map(hour => {
              const weekStart = new Date(currentDate);
              const dow = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
              weekStart.setDate(weekStart.getDate() - dow);

              return (
                <div key={hour} className="grid grid-cols-8 border-b border-surface-50">
                  <div className="p-2 text-xs text-surface-400 text-right pr-3">{`${hour}:00`}</div>
                  {[0, 1, 2, 3, 4, 5, 6].map(col => {
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(dayDate.getDate() + col);
                    const dateStr = dayDate.toISOString().split('T')[0];
                    const ev = events.find(e => {
                      const parts = e.start?.split('T') || [];
                      return parts[0] === dateStr && parseInt(parts[1]?.split(':')[0]) === hour;
                    });
                    return (
                      <div key={col} className={`p-1 min-h-[40px] border-l border-surface-50 ${ev ? `bg-${ev.tipo === 'ocupado' ? 'emerald' : ev.tipo === 'pendiente' ? 'amber' : 'red'}-50/50` : ''}`}>
                        {ev && (
                          <div className={`event-chip event-${ev.tipo} text-[9px]`}>
                            {ev.title.length > 10 ? ev.title.substring(0, 10) + '...' : ev.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold capitalize">
                {selectedDay.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
            </div>
            <div className="modal-body space-y-3">
              {selectedDay.events.map((ev, i) => (
                <div key={i} className={`p-4 rounded-xl bg-${ev.tipo === 'ocupado' ? 'emerald' : ev.tipo === 'pendiente' ? 'amber' : 'red'}-50 border border-${ev.tipo === 'ocupado' ? 'emerald' : ev.tipo === 'pendiente' ? 'amber' : 'red'}-100`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-surface-800">{ev.title}</h4>
                    <span className={`event-chip event-${ev.tipo}`}>{ev.tipo}</span>
                  </div>
                  <p className="text-sm text-surface-600">{ev.start?.split('T')[1]?.substring(0, 5)} - {ev.end?.split('T')[1]?.substring(0, 5)}</p>
                  {ev.ubicacion && <p className="text-sm text-surface-500 mt-1">{ev.ubicacion}</p>}
                  {ev.extendProps?.cliente && <p className="text-sm text-surface-500">Cliente: {ev.extendProps.cliente}</p>}
                  {ev.extendProps?.observaciones && <p className="text-sm text-surface-500">{ev.extendProps.observaciones}</p>}
                  {ev.bloqueadoId && (
                    <button onClick={() => { unblockTime(ev.bloqueadoId); setSelectedDay(null); }} className="btn-danger mt-2 text-sm">Desbloquear</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Block time modal */}
      {showBlock && (
        <div className="modal-overlay" onClick={() => setShowBlock(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold">Bloquear horario</h3>
              <button onClick={() => setShowBlock(false)} className="p-1 hover:bg-surface-100 rounded-lg"><X className="w-5 h-5 text-surface-500" /></button>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="input-label">Fecha</label>
                <input type="date" value={blockForm.fecha} onChange={e => setBlockForm(p => ({ ...p, fecha: e.target.value }))} className="input-field" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Hora inicio</label>
                  <select value={blockForm.horaInicio} onChange={e => setBlockForm(p => ({ ...p, horaInicio: e.target.value }))} className="input-field">
                    {HOURS.map(h => <option key={h} value={`${h}:00`}>{`${h}:00`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Hora fin</label>
                  <select value={blockForm.horaFin} onChange={e => setBlockForm(p => ({ ...p, horaFin: e.target.value }))} className="input-field">
                    {HOURS.map(h => <option key={h} value={`${h + 1}:00`}>{`${h + 1}:00`}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Motivo (opcional)</label>
                <input type="text" value={blockForm.motivo} onChange={e => setBlockForm(p => ({ ...p, motivo: e.target.value }))} className="input-field" placeholder="Vacaciones, compromiso..." />
              </div>
              <button onClick={blockTime} className="btn-primary w-full">Bloquear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
