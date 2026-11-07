export const adminGeneralSettingsEditData = {
  routes: {
    shifts: '/admin/shifts',
    orderTypes: '/admin/order-types',
    statusOptions: '/admin/status-options',
    login: '/login',
  },
  modalTitles: {
    editShift: 'Edit Shift Option',
    editOrderType: 'Edit Order Type',
    editStatusOption: 'Edit Status Option',
    addShift: /Add Shift Option|Creating Shift Option/i,
    addOrderType: /Add Order Type|Order Type/i,
    addStatusOption: /Add Status Option|Status Option/i,
  },
  successBanners: {
    shiftUpdated: 'Shift option updated successfully.',
    orderTypeUpdated: 'Order type updated successfully.',
    statusOptionUpdated: 'Status option updated successfully.',
  },
  immutableFieldClasses: {
    cursorNotAllowed: /cursor-not-allowed/,
    bgDisabled: /bg-slate-100/,
  },
  testPayloads: {
    shiftEdit: {
      initialStartTime: '08:00 AM',
      initialEndTime: '04:00 PM',
      updatedStartTime: '09:30 AM',
      updatedEndTime: '05:30 PM',
      updatedStartTimeDisplay: '09:30 AM',
      updatedEndTimeDisplay: '05:30 PM',
    },
    orderTypeEdit: {
      statusActive: 'Active' as const,
      statusHidden: 'Hidden' as const,
    },
    statusOptionEdit: {
      updatedDescription: 'Updated status description for CTMQ-53 verification',
      displayOrderBoundaryMin: 0,
      displayOrderBoundaryMid: 15,
      displayOrderBoundaryHigh: 999,
    },
  },
};
