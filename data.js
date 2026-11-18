/* Onile prototype: sample data. Figures match the Onile Figma screens. Today is Thursday 17 December 2026. */
window.ONILE_SEED = function () {
  return {
    v: 4,
    role: 'owner',
    ui: { payTab: 'waiting', unitTab: 'All', unitPage: 1, unitQuery: '', taskTab: 'week', depTab: 'All', bookView: 'calendar', expTab: 'All' },

    landlords: {
      adebayo: { name: 'Mr Adebayo Johnson', bank: 'GTBank · ending 4417', status: 'Draft' },
      funke: { name: 'Mrs Funke Alade', bank: 'Access Bank · ending 2093', status: 'Sent', sent: 'Sent 16 Dec at the owner’s request' },
      okon: { name: 'Okon Properties', bank: 'Zenith Bank · ending 7781', status: 'Draft' },
      chidi: { name: 'Mr Chidi Eze', cycle: 'mid' },
      bisi: { name: 'Mrs Bisi Coker', cycle: 'mid' }
    },

    units: [
      { name: 'Lekki 2B', beds: '2 bed', landlord: 'adebayo', area: 'Lekki Phase 1', next: 'Today · 3:00 pm', rate: 85000, status: 'Ready', keeper: 'Blessing' },
      { name: 'Lekki 5A', beds: '3 bed', landlord: 'adebayo', area: 'Lekki Phase 1', next: '20 Dec', rate: 120000, status: 'Maintenance', keeper: 'Funmi' },
      { name: 'Ikoyi 4A', beds: '2 bed', landlord: 'adebayo', area: 'Ikoyi', next: 'Today · 2:00 pm', rate: 110000, status: 'Cleaning', keeper: 'Blessing' },
      { name: 'Ikoyi 6B', beds: '1 bed', landlord: 'funke', area: 'Ikoyi', next: '23 Dec', rate: 75000, status: 'Blocked', keeper: 'Blessing' },
      { name: 'VI 1C', beds: 'Studio', landlord: 'funke', area: 'Victoria Island', next: 'Today · 4:00 pm', rate: 65000, status: 'Ready', keeper: 'Amaka' },
      { name: 'VI 3A', beds: '2 bed', landlord: 'okon', area: 'Victoria Island', next: '19 Dec', rate: 95000, status: 'Occupied', keeper: 'Amaka' },
      { name: 'Yaba 3', beds: '1 bed', landlord: 'okon', area: 'Yaba', next: '21 Dec', rate: 45000, status: 'Ready', keeper: 'Amaka' },
      { name: 'Yaba 7', beds: 'Studio', landlord: 'okon', area: 'Yaba', next: '22 Dec', rate: 40000, status: 'Occupied', keeper: 'Amaka' },
      { name: 'Lekki 9C', beds: '2 bed', landlord: 'chidi', area: 'Lekki Phase 1', next: '18 Dec', rate: 90000, status: 'Occupied', keeper: 'Funmi' },
      { name: 'Ikoyi 2D', beds: '3 bed', landlord: 'chidi', area: 'Ikoyi', next: '24 Dec', rate: 150000, status: 'Occupied', keeper: 'Blessing' },
      { name: 'Yaba 12', beds: '2 bed', landlord: 'okon', area: 'Yaba', next: '19 Dec', rate: 55000, status: 'Occupied', keeper: 'Amaka' },
      { name: 'Lekki 11A', beds: '1 bed', landlord: 'chidi', area: 'Lekki Phase 1', next: '19 Dec', rate: 70000, status: 'Cleaning', keeper: 'Funmi' },
      { name: 'Ikoyi 8C', beds: '2 bed', landlord: 'chidi', area: 'Ikoyi', next: '21 Dec', rate: 115000, status: 'Occupied', keeper: 'Blessing' },
      { name: 'VI 5B', beds: '2 bed', landlord: 'bisi', area: 'Victoria Island', next: '20 Dec', rate: 100000, status: 'Occupied', keeper: 'Amaka' },
      { name: 'VI 7A', beds: '3 bed', landlord: 'bisi', area: 'Victoria Island', next: '22 Dec', rate: 140000, status: 'Occupied', keeper: 'Amaka' },
      { name: 'Lekki 14D', beds: 'Studio', landlord: 'bisi', area: 'Lekki Phase 1', next: '18 Dec', rate: 50000, status: 'Ready', keeper: 'Funmi' },
      { name: 'Yaba 9', beds: '1 bed', landlord: 'bisi', area: 'Yaba', next: '19 Dec', rate: 45000, status: 'Cleaning', keeper: 'Amaka' },
      { name: 'Ikoyi 3F', beds: '2 bed', landlord: 'bisi', area: 'Ikoyi', next: '23 Dec', rate: 120000, status: 'Occupied', keeper: 'Blessing' }
    ],

    /* December figures per unit, before anything confirmed in this session */
    fin: {
      'Lekki 2B': { revenue: 2160000, costs: 486000, nights: 24, bookings: 7 },
      'Lekki 5A': { revenue: 1620000, costs: 410000, nights: 14, bookings: 4 },
      'Ikoyi 4A': { revenue: 2880000, costs: 520000, nights: 26, bookings: 6 },
      'Ikoyi 6B': { revenue: 1875000, costs: 300000, nights: 25, bookings: 5 },
      'VI 1C': { revenue: 1625000, costs: 312500, nights: 25, bookings: 8 },
      'VI 3A': { revenue: 2470000, costs: 395000, nights: 26, bookings: 5 },
      'Yaba 3': { revenue: 1035000, costs: 245000, nights: 23, bookings: 6 },
      'Yaba 7': { revenue: 1000000, costs: 210000, nights: 25, bookings: 5 },
      'Yaba 12': { revenue: 1595000, costs: 299375, nights: 29, bookings: 4 }
    },
    extra: {},
    revenueBase: 8420000,
    confirmedMonth: 7435000,
    confirmedCount: 62,
    recordedWeek: 9,

    calendarUnits: ['Lekki 2B', 'Lekki 5A', 'Ikoyi 4A', 'Ikoyi 6B', 'VI 1C', 'VI 3A', 'Yaba 3', 'Yaba 7'],

    /* s and e are December days. Stays run from midday on s to midday on e. */
    bookings: [
      { id: 'BK 1038', guest: 'Ngozi Adeleke', unit: 'Lekki 2B', s: 14, e: 17, type: 'confirmed', total: 270000, paid: 270000, source: 'WhatsApp' },
      { id: 'BK 1042', guest: 'Adaeze Okafor', unit: 'Lekki 2B', s: 17, e: 20, type: 'confirmed', total: 255000, paid: 255000, source: 'Instagram DM', phone: '+234 803 555 0142', email: 'adaeze.o@mail.com', stays: '2nd stay', ref: '0042917', confirmedBy: 'Omoakin on 14 Dec', deposit: 50000 },
      { id: 'BK 1051', guest: 'Bola Kareem', unit: 'Lekki 2B', s: 22, e: 25, type: 'tentative', total: 351000, paid: 0, source: 'Instagram DM', phone: '+234 802 000 1144' },
      { id: 'BK 1040', guest: 'Kemi Adeyemi', unit: 'Lekki 5A', s: 15, e: 17, type: 'confirmed', total: 240000, paid: 240000, source: 'Phone call' },
      { id: 'CL 5A', label: 'Clean', unit: 'Lekki 5A', s: 17, e: 18, type: 'cleaning', task: 't3' },
      { id: 'MT 5A', label: 'Generator service', unit: 'Lekki 5A', s: 18, e: 20, type: 'maintenance', task: 't1' },
      { id: 'BK 1047', guest: 'Sola Thomas', unit: 'Lekki 5A', s: 20, e: 26, type: 'confirmed', total: 585000, paid: 0, source: 'Website enquiry' },
      { id: 'BK 1036', guest: 'Tunde Bakare', unit: 'Ikoyi 4A', s: 13, e: 17, type: 'confirmed', total: 440000, paid: 440000, source: 'WhatsApp', deposit: 50000 },
      { id: 'BK 1044', guest: 'Chiamaka Eze', unit: 'Ikoyi 4A', s: 17, e: 20, type: 'confirmed', total: 330000, paid: 330000, source: 'Instagram DM', ref: '0042551', confirmedBy: 'Omoakin on 15 Dec', deposit: 50000 },
      { id: 'BK 1049', guest: 'Kemi Adeyemi', unit: 'Ikoyi 4A', s: 22, e: 28, type: 'confirmed', total: 660000, paid: 330000, source: 'Phone call' },
      { id: 'BL 6B', label: 'Owner stay', unit: 'Ikoyi 6B', s: 15, e: 21, type: 'blocked' },
      { id: 'BK 1053', guest: 'Emeka Nwosu', unit: 'Ikoyi 6B', s: 23, e: 28, type: 'confirmed', total: 375000, paid: 0, source: 'Referral' },
      { id: 'BK 1045', guest: 'David Mensah', unit: 'VI 1C', s: 17, e: 19, type: 'confirmed', total: 130000, paid: 0, source: 'WhatsApp' },
      { id: 'BK 1052', guest: 'Ada Uzor', unit: 'VI 1C', s: 21, e: 24, type: 'tentative', total: 195000, paid: 0, source: 'Instagram DM' },
      { id: 'BK 1046', guest: 'Ife Ogunleye', unit: 'VI 3A', s: 19, e: 26, type: 'confirmed', total: 665000, paid: 665000, source: 'Referral' },
      { id: 'BK 1035', guest: 'Femi Ola', unit: 'Yaba 3', s: 12, e: 17, type: 'confirmed', total: 225000, paid: 225000, source: 'WhatsApp', deposit: 30000 },
      { id: 'CL Y3', label: 'Clean', unit: 'Yaba 3', s: 17, e: 18, type: 'cleaning', task: 't4' },
      { id: 'BK 1050', guest: 'Tobi Bankole', unit: 'Yaba 3', s: 21, e: 24, type: 'confirmed', total: 135000, paid: 135000, source: 'Instagram DM' },
      { id: 'BK 1039', guest: 'Musa Ibrahim', unit: 'Yaba 7', s: 15, e: 19, type: 'confirmed', total: 160000, paid: 160000, source: 'WhatsApp' },
      { id: 'BK 1063', guest: 'Grace Peters', unit: 'Yaba 7', s: 22, e: 28, type: 'confirmed', total: 240000, paid: 0, source: 'Instagram DM' }
    ],
    clash: null,

    waiting: [
      { id: 'p1', guest: 'Bola Kareem', booking: 'BK 1051', unit: 'Lekki 2B', dates: '22 to 25 Dec', bank: 'Access Bank', bankShort: 'Access', ref: '7781902', sent: '16 Dec · 7:40 am', sentShort: '16 Dec, 7:40 am', age: '26 hours', total: 351000, amount: 170000, receipt: 'receipt_0716.jpg', size: '240 KB' },
      { id: 'p2', guest: 'Sola Thomas', booking: 'BK 1047', unit: 'Lekki 5A', dates: '20 to 26 Dec', bank: 'GTBank', bankShort: 'GTBank', ref: '0049288', sent: '16 Dec · 2:15 pm', sentShort: '16 Dec, 2:15 pm', age: '20 hours', total: 585000, amount: 585000, receipt: 'receipt_sola.pdf', size: '310 KB' },
      { id: 'p3', guest: 'Emeka Nwosu', booking: 'BK 1053', unit: 'Ikoyi 6B', dates: '23 to 28 Dec', bank: 'Opay', bankShort: 'Opay', ref: '3320914', sent: '17 Dec · 8:02 am', sentShort: '17 Dec, 8:02 am', age: '2 hours', total: 375000, amount: 150000, receipt: 'receipt_emeka.jpg', size: '190 KB' },
      { id: 'p4', guest: 'David Mensah', booking: 'BK 1045', unit: 'VI 1C', dates: '17 to 19 Dec', bank: 'Kuda', bankShort: 'Kuda', ref: '5521087', sent: '17 Dec · 9:30 am', sentShort: '17 Dec, 9:30 am', age: '1 hour', total: 130000, amount: 80000, receipt: 'receipt_david.png', size: '160 KB' }
    ],
    confirmed: [
      { guest: 'Chiamaka Eze', by: 'Omoakin', unit: 'Ikoyi 4A', bankShort: 'GTBank', ref: '0042551', amount: 330000 },
      { guest: 'Adaeze Okafor', by: 'Omoakin', unit: 'Lekki 2B', bankShort: 'GTBank', ref: '0042917', amount: 255000 },
      { guest: 'Musa Ibrahim', by: 'Ngozi', unit: 'Yaba 7', bankShort: 'Moniepoint', ref: '1180342', amount: 160000 }
    ],

    deposits: [
      { id: 'd1', guest: 'Tunde Bakare', unit: 'Ikoyi 4A', out: 'Today · 10:00 am', amount: 50000, state: 'due', note: 'No damage. Keys and gate remote returned.' },
      { id: 'd2', guest: 'Kemi Adeyemi', unit: 'Lekki 5A', out: 'Today · 11:00 am', amount: 50000, state: 'due', note: 'Small stain on the sofa, cleaned. No charge.' },
      { id: 'd3', guest: 'Femi Ola', unit: 'Yaba 3', out: 'Today · 12:00 pm', amount: 30000, state: 'inspection' },
      { id: 'd4', guest: 'Ngozi Adeleke', unit: 'Lekki 2B', out: '17 Dec', amount: 50000, state: 'refunded' },
      { id: 'd5', guest: 'Kunle Ade', unit: 'Yaba 3', out: '10 Dec', amount: 50000, state: 'deducted', deducted: 35000 },
      { id: 'd6', guest: 'Adaeze Okafor', unit: 'Lekki 2B', out: 'Checks out 20 Dec', amount: 50000, state: 'held' },
      { id: 'd7', guest: 'Chiamaka Eze', unit: 'Ikoyi 4A', out: 'Checks out 20 Dec', amount: 50000, state: 'held' }
    ],
    heldNow: 1250000,

    tasks: [
      { id: 't1', title: 'Generator service', who: 'Sunday', unit: 'Lekki 5A', due: '24 Nov', cost: 45000, status: 'Overdue', notes: 'Service every 250 hours. Last done 10 October.' },
      { id: 't2', title: 'Turnover clean', who: 'Blessing', unit: 'Ikoyi 4A', due: 'Today · 1:30 pm', cost: 15000, status: 'In progress', started: '12:10 pm', nextGuest: 'Chiamaka Eze checks in at 2:00 pm', checklist: [['Strip and change beds', true], ['Bathroom and kitchen', true], ['Restock toiletries and water', false], ['Photo of each room', false]] },
      { id: 't3', title: 'Turnover clean', who: 'Funmi', unit: 'Lekki 5A', due: 'Today · 2:00 pm', cost: 15000, status: 'To do', nextGuest: 'Guest left at 11:00 am. Next guest 20 Dec.', checklist: [['Strip and change beds', false], ['Bathroom and kitchen', false], ['Restock toiletries and water', false], ['Photo of each room', false]] },
      { id: 't4', title: 'Turnover clean', who: 'Amaka', unit: 'Yaba 3', due: 'Today · 1:00 pm', cost: 12000, status: 'Done', doneAt: '12:40 pm', nextGuest: 'Next guest 21 Dec' },
      { id: 't5', title: 'AC gas refill', who: 'CoolFix Ltd', unit: 'Lekki 2B', due: '19 Dec', cost: 35000, status: 'To do' },
      { id: 't6', title: 'Water pump check', who: 'Sunday', unit: 'VI 3A', due: '21 Dec', cost: 20000, status: 'To do' },
      { id: 't7', title: 'Bathroom tap replaced', who: 'Sunday', unit: 'Lekki 2B', due: '12 Dec', cost: 18000, status: 'Done' }
    ],
    doneTotal: 12,

    expenses: [
      { id: 'e1', title: 'Cleaning supplies', who: 'Blessing', receipt: true, unit: 'Ikoyi 4A', date: 'Today', amount: 8500, status: 'Waiting approval' },
      { id: 'e2', title: 'Toiletries restock', who: 'Amaka', receipt: true, unit: 'Yaba 3', date: 'Today', amount: 6000, status: 'Waiting approval' },
      { id: 'e3', title: 'Diesel 50 litres', who: 'Sunday', receipt: true, unit: 'Lekki 5A', date: '16 Dec', amount: 62500, status: 'Waiting approval' },
      { id: 'e4', title: 'Diesel 120 litres', who: 'Tola', unit: 'Lekki 2B', date: '15 Dec', amount: 150000, status: 'Approved' },
      { id: 'e5', title: 'Electricity tokens', who: 'Tola', unit: 'VI 3A', date: '14 Dec', amount: 25000, status: 'Approved' },
      { id: 'e6', title: 'AC gas refill', who: 'CoolFix Ltd', unit: 'Lekki 2B', date: '12 Dec', amount: 35000, status: 'Approved' },
      { id: 'e7', title: 'Bathroom tap replaced', who: 'Sunday', unit: 'Lekki 2B', date: '12 Dec', amount: 18000, status: 'Approved' },
      { id: 'e8', title: 'Snacks for guests', who: 'Blessing', unit: 'Ikoyi 4A', date: '10 Dec', amount: 4000, status: 'Rejected' }
    ],

    team: [
      { name: 'Omoakin', initials: 'OM', role: 'Owner', contact: '+234 809 111 2040' },
      { name: 'Tola Bello', initials: 'TB', role: 'Manager', contact: '+234 806 330 1188' },
      { name: 'Ngozi Eze', initials: 'NE', role: 'Accountant', contact: '+234 813 902 4471' }
    ],
    delegation: null,
    log: []
  };
};
