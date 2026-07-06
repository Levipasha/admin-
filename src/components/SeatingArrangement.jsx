import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, artDistrictAPI } from '../services/api';
import {
  Users, Search, Printer, RefreshCw,
  LayoutGrid, Trash2, Shuffle, CheckCircle,
  Palette, Scissors, Move, Armchair, UserMinus,
  ChevronLeft, Calendar, MapPin, ArrowRight,
  X, Instagram, Mail, CreditCard, QrCode,
  Clock, Star, BadgeCheck, User, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Participant Detail Modal ─────────────────────────────────────────────────
const ParticipantModal = ({ participant, onClose }) => {
  if (!participant) return null;

  const cat = (participant.category || '').toLowerCase();
  const isArt = cat.includes('art');
  const isCraft = cat.includes('craft');

  const accentColor = isArt
    ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
    : isCraft
      ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
      : { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInScale_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header strip */}
        <div className={`${accentColor.bg} ${accentColor.border} border-b p-5 flex items-start justify-between`}>
          <div className="flex items-center gap-3">
            {/* Avatar / Initials */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm border-2 ${accentColor.border} bg-white ${accentColor.text}`}>
              {participant.initials || participant.fullName?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">{participant.fullName}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${accentColor.badge}`}>
                  {isArt ? <Palette size={9} /> : isCraft ? <Scissors size={9} /> : <Star size={9} />}
                  {participant.category || 'Unknown'}
                </span>
                {participant.hasArtProfile && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1">
                    <BadgeCheck size={9} /> Art Profile
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-2">
            <InfoRow icon={<Mail size={14} />} label="Email" value={participant.email} />
            {participant.insta && (
              <InfoRow icon={<Instagram size={14} />} label="Instagram" value={participant.insta} />
            )}
            {participant.memberId && (
              <InfoRow icon={<BadgeCheck size={14} />} label="Member ID" value={participant.memberId} mono />
            )}
          </div>

          {/* Pass / Art Profile Details */}
          {participant.hasArtProfile && (
            <div className={`${accentColor.bg} ${accentColor.border} border rounded-xl p-4 space-y-2 mt-1`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${accentColor.text} mb-2`}>
                {isArt ? '🎨' : '✂️'} Art District Profile
              </p>
              <div className="grid grid-cols-2 gap-2">
                {participant.passType && (
                  <SmallStat label="Pass Type" value={participant.passType} />
                )}
                {participant.price && (
                  <SmallStat label="Price" value={participant.price} />
                )}
                {participant.paymentMethod && (
                  <SmallStat label="Payment" value={participant.paymentMethod} />
                )}
                {participant.source && (
                  <SmallStat label="Source" value={participant.source === 'manual' ? 'Admin Desk' : 'Online'} />
                )}
              </div>
              {(participant.validFrom || participant.validThru) && (
                <div className="flex gap-2 pt-1 mt-1 border-t border-current/10">
                  {participant.validFrom && <SmallStat label="Valid From" value={participant.validFrom} />}
                  {participant.validThru && <SmallStat label="Valid Thru" value={participant.validThru} />}
                </div>
              )}
            </div>
          )}

          {/* Registration status */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs">
            <span className="text-gray-500 font-semibold">Registration Status</span>
            <span className={`font-bold uppercase ${participant.status === 'attended' ? 'text-green-600' : participant.status === 'cancelled' ? 'text-red-500' : 'text-blue-600'}`}>
              {participant.status || 'Registered'}
            </span>
          </div>

          {/* QR Code */}
          {participant.qrCodeUrl && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">QR Code</p>
              <img
                src={participant.qrCodeUrl}
                alt="QR Code"
                className="w-28 h-28 border-2 border-gray-200 rounded-xl p-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, mono }) => (
  <div className="flex items-center gap-2.5 text-sm">
    <span className="text-gray-400 shrink-0">{icon}</span>
    <span className="text-gray-500 text-xs font-semibold w-20 shrink-0">{label}</span>
    <span className={`text-gray-800 font-medium truncate ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
  </div>
);

const SmallStat = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-bold text-current/50 uppercase tracking-wider">{label}</p>
    <p className="text-xs font-bold text-current mt-0.5 truncate">{value}</p>
  </div>
);

// ─── Event Selection Screen ───────────────────────────────────────────────────
const EventSelector = ({ onSelect }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getEvents({ limit: 50 });
        setEvents(res.events || []);
      } catch (e) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s) => {
    if (s === 'published') return 'text-green-600 bg-green-50 border-green-200';
    if (s === 'completed') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (s === 'cancelled') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl text-white p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
            Admin Venue Operations
          </span>
          <h1 className="text-3xl font-black mt-2 tracking-tight">Seating Arrangement Map</h1>
          <p className="text-red-100 text-sm mt-1">Select an event to manage seating for its registered attendees.</p>
        </div>
      </div>

      {/* Event list */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-4">
          <Calendar size={20} className="text-red-600" />
          <h2 className="font-bold text-gray-800">Select an Event</h2>
          <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{events.length} events</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 text-gray-200" />
            <p className="font-bold">No events found</p>
            <p className="text-xs mt-1">Create events first from the Events section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(event => {
              const img = event.images?.[0]?.url;
              const attendeeCount = event.attendees?.length || event.capacity?.current || 0;
              const startDate = event.date?.start ? new Date(event.date.start) : null;

              return (
                <button
                  key={event._id}
                  onClick={() => onSelect(event)}
                  className="text-left group border border-gray-200 hover:border-red-400 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                >
                  {/* Event image or placeholder */}
                  <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {img ? (
                      <img src={img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={32} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm truncate group-hover:text-red-700 transition-colors">{event.title}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar size={11} />
                      <span>{startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={11} />
                        <span className="font-semibold">{attendeeCount} registered</span>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Seating Arrangement Component ──────────────────────────────────────
const SeatingArrangement = () => {
  // Phase: 'select' | 'arrange'
  const [phase, setPhase] = useState('select');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Participants (registered for the selected event)
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Layout parameters
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [seatsPerTable, setSeatsPerTable] = useState(6);

  // Active Seating State: maps tableIndex -> Array of size seatsPerTable
  const [assignments, setAssignments] = useState({});

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverSeat, setDragOverSeat] = useState(null);

  // Selected participant for detail modal
  const [detailParticipant, setDetailParticipant] = useState(null);

  // ─── Load event participants ────────────────────────────────────
  const loadEventParticipants = useCallback(async (event) => {
    try {
      setLoading(true);
      const data = await adminAPI.getEventRegisteredParticipants(event._id);
      const regs = data.participants || [];

      if (regs.length === 0) {
        toast('No registered participants found for this event.', { icon: 'ℹ️' });
        setParticipants([]);
      } else {
        setParticipants(regs);
        toast.success(`Loaded ${regs.length} registered participant${regs.length !== 1 ? 's' : ''}`);
      }
    } catch (e) {
      console.error('Load event participants error:', e);
      toast.error('Failed to load participants. Please try again.');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setPhase('arrange');
    setAssignments({});
    setSearchQuery('');
    setSidebarFilter('all');
    await loadEventParticipants(event);
  };

  const handleBackToEvents = () => {
    setPhase('select');
    setSelectedEvent(null);
    setParticipants([]);
    setAssignments({});
  };

  // ─── LocalStorage key per event ────────────────────────────────
  const getStorageKey = (eventId) => `seating_arrangement_event_${eventId}`;

  // Restore saved arrangement when participants load
  useEffect(() => {
    if (!selectedEvent || participants.length === 0) return;

    const key = getStorageKey(selectedEvent._id);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cols) setCols(parsed.cols);
        if (parsed.rows) setRows(parsed.rows);
        if (parsed.seatsPerTable) setSeatsPerTable(parsed.seatsPerTable);

        const validatedAssignments = {};
        const activeIds = new Set(participants.map(p => p._id || p.memberId));
        const numTables = (parsed.cols || cols) * (parsed.rows || rows);

        for (let t = 0; t < numTables; t++) {
          validatedAssignments[t] = Array(parsed.seatsPerTable || 6).fill(null);
          if (parsed.assignments && parsed.assignments[t]) {
            parsed.assignments[t].forEach((seat, idx) => {
              if (seat && idx < (parsed.seatsPerTable || 6)) {
                const pId = seat._id || seat.memberId;
                if (activeIds.has(pId)) {
                  const freshP = participants.find(p => (p._id || p.memberId) === pId);
                  if (freshP) validatedAssignments[t][idx] = freshP;
                }
              }
            });
          }
        }

        setAssignments(validatedAssignments);
        return;
      } catch (err) {
        console.warn('Error parsing saved seating:', err);
      }
    }

    // Default empty
    initializeEmptyAssignments(cols, rows, seatsPerTable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, selectedEvent]);

  const saveToLocalStorage = (newCols, newRows, newSeats, newAssignments) => {
    if (!selectedEvent) return;
    const key = getStorageKey(selectedEvent._id);
    localStorage.setItem(key, JSON.stringify({
      cols: newCols, rows: newRows, seatsPerTable: newSeats, assignments: newAssignments
    }));
  };

  const initializeEmptyAssignments = (c, r, s) => {
    const empty = {};
    const totalTables = c * r;
    for (let t = 0; t < totalTables; t++) {
      empty[t] = Array(s).fill(null);
    }
    setAssignments(empty);
    saveToLocalStorage(c, r, s, empty);
  };

  // ─── Helpers ───────────────────────────────────────────────────
  const getAssignedIds = useCallback(() => {
    const ids = new Set();
    Object.values(assignments).forEach(tableSeats => {
      if (Array.isArray(tableSeats)) {
        tableSeats.forEach(seat => {
          if (seat) ids.add(seat._id || seat.memberId);
        });
      }
    });
    return ids;
  }, [assignments]);

  const unassignedParticipants = participants.filter(p => {
    const assignedIds = getAssignedIds();
    return !assignedIds.has(p._id || p.memberId);
  });

  const getCategoryColor = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('art')) return 'bg-red-50 text-red-700 border-red-200';
    if (cat.includes('craft')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('art')) return <Palette size={12} className="inline mr-1" />;
    if (cat.includes('craft')) return <Scissors size={12} className="inline mr-1" />;
    return null;
  };

  // ─── Layout Changes ────────────────────────────────────────────
  const handleLayoutChange = (newCols, newRows, newSeats) => {
    const oldSeats = seatsPerTable;
    setCols(newCols);
    setRows(newRows);
    setSeatsPerTable(newSeats);

    const newNumTables = newCols * newRows;
    const adjusted = {};
    for (let t = 0; t < newNumTables; t++) {
      adjusted[t] = Array(newSeats).fill(null);
      if (assignments[t]) {
        for (let s = 0; s < newSeats; s++) {
          if (s < oldSeats && assignments[t][s]) adjusted[t][s] = assignments[t][s];
        }
      }
    }

    setAssignments(adjusted);
    saveToLocalStorage(newCols, newRows, newSeats, adjusted);
    toast.success(`Layout updated to ${newCols}×${newRows} (${newNumTables} tables)`);
  };

  // ─── Auto Assignment ───────────────────────────────────────────
  const runAutoAssignment = (mode) => {
    const totalTables = cols * rows;
    const newAssignments = {};
    for (let t = 0; t < totalTables; t++) {
      newAssignments[t] = Array(seatsPerTable).fill(null);
    }

    const artPool = participants.filter(p => (p.category || '').toLowerCase().includes('art'));
    const craftPool = participants.filter(p => (p.category || '').toLowerCase().includes('craft'));

    if (mode === 'art') {
      let idx = 0;
      for (let t = 0; t < totalTables; t++) {
        for (let s = 0; s < seatsPerTable; s++) {
          if (idx < artPool.length) newAssignments[t][s] = artPool[idx++];
        }
      }
      toast.success(`Seated ${Math.min(artPool.length, totalTables * seatsPerTable)} Art participants`);
    } else if (mode === 'craft') {
      let idx = 0;
      for (let t = 0; t < totalTables; t++) {
        for (let s = 0; s < seatsPerTable; s++) {
          if (idx < craftPool.length) newAssignments[t][s] = craftPool[idx++];
        }
      }
      toast.success(`Seated ${Math.min(craftPool.length, totalTables * seatsPerTable)} Craft participants`);
    } else if (mode === 'alternate') {
      let artIdx = 0;
      let craftIdx = 0;
      for (let t = 0; t < totalTables; t++) {
        for (let s = 0; s < seatsPerTable; s++) {
          const globalSeatIdx = t * seatsPerTable + s;
          if (globalSeatIdx % 2 === 0) {
            if (craftIdx < craftPool.length) newAssignments[t][s] = craftPool[craftIdx++];
            else if (artIdx < artPool.length) newAssignments[t][s] = artPool[artIdx++];
          } else {
            if (artIdx < artPool.length) newAssignments[t][s] = artPool[artIdx++];
            else if (craftIdx < craftPool.length) newAssignments[t][s] = craftPool[craftIdx++];
          }
        }
      }
      toast.success('Generated alternating arrangement (Craft ⇆ Art)');
    } else if (mode === 'manual') {
      initializeEmptyAssignments(cols, rows, seatsPerTable);
      toast.success('Cleared all seating assignments');
      return;
    }

    setAssignments(newAssignments);
    saveToLocalStorage(cols, rows, seatsPerTable, newAssignments);
  };

  // ─── Drag & Drop ───────────────────────────────────────────────
  const handleDragStart = (e, participant, source) => {
    setDraggedItem({ participant, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', participant._id || participant.memberId);
  };

  const handleDragOver = (e, tableIndex, seatIndex) => {
    e.preventDefault();
    setDragOverSeat({ tableIndex, seatIndex });
  };

  const handleDragLeave = () => setDragOverSeat(null);

  const handleDrop = (e, targetTableIndex, targetSeatIndex) => {
    e.preventDefault();
    setDragOverSeat(null);
    if (!draggedItem) return;

    const { participant, source } = draggedItem;
    const newAssignments = { ...assignments };
    const targetOccupied = newAssignments[targetTableIndex][targetSeatIndex];

    if (source.type === 'unassigned') {
      newAssignments[targetTableIndex][targetSeatIndex] = participant;
    } else if (source.type === 'table') {
      const { tableIndex: srcTable, seatIndex: srcSeat } = source;
      newAssignments[srcTable][srcSeat] = targetOccupied;
      newAssignments[targetTableIndex][targetSeatIndex] = participant;
    }

    setAssignments(newAssignments);
    saveToLocalStorage(cols, rows, seatsPerTable, newAssignments);
    setDraggedItem(null);
  };

  const handleDropToUnassigned = (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { source } = draggedItem;
    if (source.type === 'table') {
      const { tableIndex, seatIndex } = source;
      const newAssignments = { ...assignments };
      newAssignments[tableIndex][seatIndex] = null;
      setAssignments(newAssignments);
      saveToLocalStorage(cols, rows, seatsPerTable, newAssignments);
      toast.success('Removed participant from seat');
    }
    setDraggedItem(null);
  };

  const handleRemoveSeatManual = (tableIndex, seatIndex) => {
    const newAssignments = { ...assignments };
    newAssignments[tableIndex][seatIndex] = null;
    setAssignments(newAssignments);
    saveToLocalStorage(cols, rows, seatsPerTable, newAssignments);
  };

  const triggerPrint = () => window.print();

  // ─── Sidebar Filter ────────────────────────────────────────────
  const filteredSidebarParticipants = unassignedParticipants.filter(p => {
    const matchesSearch =
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.memberId && p.memberId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const cat = (p.category || '').toLowerCase();
    let matchesCategory = true;
    if (sidebarFilter === 'art') matchesCategory = cat.includes('art');
    if (sidebarFilter === 'craft') matchesCategory = cat.includes('craft');

    return matchesSearch && matchesCategory;
  });

  const getStats = () => {
    const totalSeats = cols * rows * seatsPerTable;
    const assignedCount = getAssignedIds().size;
    let artCount = 0, craftCount = 0;
    participants.forEach(p => {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('art')) artCount++;
      else if (cat.includes('craft')) craftCount++;
    });
    return { totalSeats, assignedCount, artCount, craftCount };
  };

  const stats = getStats();

  // ─── Event Selection Phase ─────────────────────────────────────
  if (phase === 'select') {
    return <EventSelector onSelect={handleSelectEvent} />;
  }

  // ─── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        <p className="text-sm text-gray-500 font-medium">Loading registered participants...</p>
      </div>
    );
  }

  const eventStartDate = selectedEvent?.date?.start ? new Date(selectedEvent.date.start) : null;

  return (
    <div className="space-y-6">
      {/* Participant detail modal */}
      {detailParticipant && (
        <ParticipantModal
          participant={detailParticipant}
          onClose={() => setDetailParticipant(null)}
        />
      )}

      {/* Printable Area */}
      <div className="hidden print:block print-container font-sans bg-white text-black p-6">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Hall Seating Arrangement Map</h1>
            <p className="text-sm font-medium mt-1">Event: {selectedEvent?.title}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Printed: {new Date().toLocaleString()}</p>
            <p>Layout: {cols} × {rows} Grid ({cols * rows} Tables)</p>
            <p>Total Capacity: {stats.totalSeats} seats</p>
            <p>Seated: {stats.assignedCount}</p>
          </div>
        </div>
        <div className="text-center font-bold border-2 border-black bg-gray-100 py-2.5 mb-6 text-sm rounded tracking-widest uppercase">
          ▲ FRONT OF HALL / STAGE AREA ▲
        </div>
        <div className="grid grid-cols-2 gap-6 print-grid">
          {Array.from({ length: cols * rows }).map((_, tableIdx) => {
            const tableSeats = assignments[tableIdx] || Array(seatsPerTable).fill(null);
            const occupiedSeats = tableSeats.filter(s => s !== null).length;
            return (
              <div key={tableIdx} className="border-2 border-black rounded-lg p-4 print-table-card">
                <div className="flex justify-between items-center border-b border-black pb-1.5 mb-3">
                  <span className="text-lg font-black">TABLE #{tableIdx + 1}</span>
                  <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">{occupiedSeats}/{seatsPerTable} Seated</span>
                </div>
                <div className="space-y-1.5">
                  {tableSeats.map((seat, seatIdx) => (
                    <div key={seatIdx} className="flex justify-between items-center text-xs py-1 border-b border-dashed border-gray-300">
                      <span className="font-mono text-gray-500 font-bold">Seat {seatIdx + 1}:</span>
                      {seat ? (
                        <div className="flex justify-between flex-1 pl-4">
                          <span className="font-bold text-gray-900">{seat.fullName}</span>
                          <div className="flex items-center gap-2">
                            {seat.memberId && <span className="font-mono text-gray-500 text-[10px]">ID: {seat.memberId}</span>}
                            <span className="font-bold text-[10px] uppercase border border-black px-1.5 rounded">{seat.category || 'N/A'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic font-mono">— Empty —</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center font-bold border-2 border-black bg-gray-100 py-2.5 mt-8 text-sm rounded tracking-widest uppercase">
          ▼ BACK OF HALL / MAIN ENTRANCE ▼
        </div>
      </div>

      {/* Screen Dashboard */}
      <div className="flex flex-col xl:flex-row gap-6 no-print">
        {/* Main Work Area */}
        <div className="flex-1 space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl text-white p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              {/* Back button */}
              <button
                onClick={handleBackToEvents}
                className="flex items-center gap-1.5 text-red-100 hover:text-white text-xs font-bold mb-3 group transition-colors"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Events
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                    Admin Venue Operations
                  </span>
                  <h1 className="text-2xl font-black mt-2 tracking-tight truncate">{selectedEvent?.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-red-100 text-xs">
                    {eventStartDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {eventStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {selectedEvent?.location?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {selectedEvent.location.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {participants.length} registered
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={triggerPrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
                  >
                    <Printer size={18} />
                    Print Seating Map
                  </button>
                  <button
                    onClick={() => loadEventParticipants(selectedEvent)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/10 active:scale-95 transition-all"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <p className="text-xs text-red-200 font-semibold tracking-wider uppercase">Seating Capacity</p>
                  <p className="text-xl font-bold mt-0.5">{stats.assignedCount} / {stats.totalSeats} <span className="text-xs font-normal opacity-85">Filled</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <p className="text-xs text-red-200 font-semibold tracking-wider uppercase">Total Registered</p>
                  <p className="text-xl font-bold mt-0.5">{participants.length} <span className="text-xs font-normal opacity-85">Attendees</span></p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <p className="text-xs text-red-200 font-semibold tracking-wider uppercase">Art Category</p>
                  <p className="text-xl font-bold mt-0.5 flex items-center gap-1"><Palette size={16} />{stats.artCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <p className="text-xs text-red-200 font-semibold tracking-wider uppercase">Craft Category</p>
                  <p className="text-xl font-bold mt-0.5 flex items-center gap-1"><Scissors size={16} />{stats.craftCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Config & Auto Seating */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <LayoutGrid size={20} className="text-red-600" />
              <h3 className="font-bold text-gray-800 text-base">Layout Grid & Auto-Assignment Generator</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Grid Builder */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Table Arrangement Grid</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">Columns</span>
                    <select
                      value={cols}
                      onChange={e => handleLayoutChange(parseInt(e.target.value), rows, seatsPerTable)}
                      className="w-full border border-gray-300 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {[2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c} Columns</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">Rows</span>
                    <select
                      value={rows}
                      onChange={e => handleLayoutChange(cols, parseInt(e.target.value), seatsPerTable)}
                      className="w-full border border-gray-300 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Rows ({cols * r} Tables)</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seats per table */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Seats per Table</label>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Capacity</span>
                  <select
                    value={seatsPerTable}
                    onChange={e => handleLayoutChange(cols, rows, parseInt(e.target.value))}
                    className="w-full border border-gray-300 bg-white px-3 py-1.5 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {[1, 2, 4, 6, 8, 10].map(s => <option key={s} value={s}>{s} Seat{s > 1 ? 's' : ''} per Table</option>)}
                  </select>
                </div>
              </div>

              {/* Auto Seating Modes */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Seating Mode Generator</label>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">Select Seating Mode</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => runAutoAssignment('art')} className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors border border-red-200 text-left flex items-center gap-1.5">
                      <Palette size={14} /> Art Only
                    </button>
                    <button onClick={() => runAutoAssignment('craft')} className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors border border-amber-200 text-left flex items-center gap-1.5">
                      <Scissors size={14} /> Craft Only
                    </button>
                    <button onClick={() => runAutoAssignment('alternate')} className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200 text-left flex items-center gap-1.5">
                      <Shuffle size={14} /> Alternate (C ⇄ A)
                    </button>
                    <button onClick={() => runAutoAssignment('manual')} className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200 text-left flex items-center gap-1.5">
                      <Trash2 size={14} /> Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {participants.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Users size={14} className="text-amber-600" />
                <span>No registered participants found for this event. Registrations will appear here once attendees sign up.</span>
              </div>
            )}
          </div>

          {/* Interactive Seating Map */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col min-h-[500px]">
            <div className="text-center py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold tracking-widest text-gray-500 uppercase">
              ▲ FRONT OF HALL / STAGE ▲
            </div>

            <div className="flex-1 my-6">
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {Array.from({ length: cols * rows }).map((_, tableIdx) => {
                  const tableSeats = assignments[tableIdx] || Array(seatsPerTable).fill(null);
                  const occupiedSeats = tableSeats.filter(s => s !== null).length;

                  return (
                    <div key={tableIdx} className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-shadow flex flex-col">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                        <span className="text-sm font-black text-gray-800 tracking-wide uppercase">Table {tableIdx + 1}</span>
                        <span className="text-[10px] font-extrabold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          {occupiedSeats}/{seatsPerTable} Seated
                        </span>
                      </div>

                      <div className="space-y-2">
                        {tableSeats.map((seat, seatIdx) => {
                          const isOver = dragOverSeat?.tableIndex === tableIdx && dragOverSeat?.seatIndex === seatIdx;

                          return (
                            <div
                              key={seatIdx}
                              onDragOver={e => handleDragOver(e, tableIdx, seatIdx)}
                              onDragLeave={handleDragLeave}
                              onDrop={e => handleDrop(e, tableIdx, seatIdx)}
                              className={`group min-h-[54px] rounded-xl border p-2 flex items-center justify-between text-xs transition-all duration-200 relative ${isOver
                                ? 'border-red-500 bg-red-50 border-dashed scale-102 shadow'
                                : seat
                                  ? 'border-gray-200 bg-white hover:border-red-400 hover:shadow-sm'
                                  : 'border-dashed border-gray-300 bg-white/40 hover:bg-white text-gray-400 italic'
                              }`}
                            >
                              {seat ? (
                                <div
                                  draggable
                                  onDragStart={e => handleDragStart(e, seat, { type: 'table', tableIndex: tableIdx, seatIndex: seatIdx })}
                                  className="flex items-center justify-between w-full cursor-grab active:cursor-grabbing"
                                >
                                  <div
                                    className="min-w-0 pr-2 flex-1 cursor-pointer"
                                    onClick={() => setDetailParticipant(seat)}
                                    title="Click to view profile"
                                  >
                                    <div className="flex items-center gap-1">
                                      <Armchair size={12} className="text-gray-400 shrink-0" />
                                      <p className="font-bold text-gray-850 truncate hover:text-red-600 transition-colors">{seat.fullName}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                                      Seat {seatIdx + 1}{seat.memberId ? ` • ${seat.memberId}` : ''}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex items-center ${getCategoryColor(seat.category)}`}>
                                      {getCategoryIcon(seat.category)}
                                      {seat.category || 'Other'}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveSeatManual(tableIdx, seatIdx)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-all"
                                      title="Unassign seat"
                                    >
                                      <UserMinus size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Armchair size={12} />
                                  <span className="font-medium text-[11px]">Seat {seatIdx + 1} Empty</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-xs font-bold tracking-widest text-gray-500 uppercase">
              ▼ BACK OF HALL / MAIN ENTRANCE ▼
            </div>
          </div>
        </div>

        {/* Sidebar — Participant list */}
        <div className="w-full xl:w-96 flex flex-col space-y-6">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropToUnassigned}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col h-[700px] overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="text-red-600" size={20} />
                <h3 className="font-bold text-gray-800 text-base">Registered Attendees</h3>
              </div>
              <span className="bg-red-50 text-red-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-red-200">
                {filteredSidebarParticipants.length} left
              </span>
            </div>

            {/* Search */}
            <div className="my-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Segment filters */}
            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
              {[{ id: 'all', label: 'All' }, { id: 'art', label: 'Art' }, { id: 'craft', label: 'Craft' }].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setSidebarFilter(btn.id)}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${sidebarFilter === btn.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Drag instruction */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex gap-2.5 items-start text-xs text-red-800 mb-3">
              <Move size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>Drag attendees onto table slots. Click a name to view their art/craft profile. Drag occupied seats to swap or back here to unassign.</span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredSidebarParticipants.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <CheckCircle size={36} className="text-gray-300 mb-2" />
                  <p className="font-bold text-sm">
                    {participants.length === 0 ? 'No registered attendees' : 'All seated!'}
                  </p>
                  <p className="text-xs mt-1">
                    {participants.length === 0
                      ? 'No one has registered for this event yet.'
                      : 'All attendees have been assigned to seats.'}
                  </p>
                </div>
              ) : (
                filteredSidebarParticipants.map(p => (
                  <div
                    key={p._id || p.memberId}
                    draggable
                    onDragStart={e => handleDragStart(e, p, { type: 'unassigned' })}
                    className="p-3 border border-gray-200 hover:border-red-300 rounded-xl bg-white hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 group"
                  >
                    <div className="flex justify-between items-start">
                      {/* Left — info, clickable for profile */}
                      <div
                        className="min-w-0 pr-2 flex-1 cursor-pointer"
                        onClick={() => setDetailParticipant(p)}
                        title="Click to view profile"
                      >
                        <p className="font-bold text-gray-850 truncate group-hover:text-red-700 transition-colors text-sm">
                          {p.fullName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                          {p.memberId ? `ID: ${p.memberId}` : p.email}
                        </p>
                        {/* Art/craft data preview */}
                        {p.passType && (
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                            🎫 {p.passType}
                          </p>
                        )}
                        {p.insta && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            📷 {p.insta}
                          </p>
                        )}
                      </div>
                      {/* Right — category badge */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex items-center ${getCategoryColor(p.category)}`}>
                          {getCategoryIcon(p.category)}
                          {p.category || 'Other'}
                        </span>
                        {p.hasArtProfile && (
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <BadgeCheck size={9} /> Profile
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.12); }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.93) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media print {
          body * { visibility: hidden !important; }
          .print-container, .print-container * { visibility: visible !important; }
          .print-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; }
          .print-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px !important; }
          .print-table-card { border: 2px solid #000 !important; padding: 15px !important; border-radius: 8px !important; background: transparent !important; page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}} />
    </div>
  );
};

export default SeatingArrangement;
