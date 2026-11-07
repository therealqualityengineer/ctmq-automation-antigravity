export const adminModalSubmitResetData = {
  routes: {
    shifts: '/admin/shifts',
    orderTypes: '/admin/order-types',
    statusOptions: '/admin/status-options',
    certifications: '/admin/certifications',
    specialties: '/admin/specialties',
  },
  submitButtonText: {
    shifts: /Save Shift|Save/i,
    orderTypes: /Save Order Type|Save/i,
    statusOptions: /Save/i,
    certifications: /Save/i,
    specialties: /Save/i,
  },
  savingStatePattern: /Saving\.\.\./i,
  testPayloads: {
    shifts: {
      first: {
        namePrefix: 'Shift-Rst-A-',
        startTime: '08:00 AM',
        endTime: '04:00 PM',
      },
      second: {
        namePrefix: 'Shift-Rst-B-',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
      },
    },
    orderTypes: {
      first: {
        namePrefix: 'OT-Rst-A-',
        status: 'Active' as const,
        isDefault: 'No' as const,
      },
      second: {
        namePrefix: 'OT-Rst-B-',
        status: 'Active' as const,
        isDefault: 'No' as const,
      },
    },
    statusOptions: {
      first: {
        namePrefix: 'SO-Rst-A-',
        description: 'First status option description',
      },
      second: {
        namePrefix: 'SO-Rst-B-',
        description: 'Second status option description',
      },
    },
    certifications: {
      first: {
        namePrefix: 'Cert-Rst-A-',
      },
      second: {
        namePrefix: 'Cert-Rst-B-',
      },
    },
    specialties: {
      first: {
        namePrefix: 'Spec-Rst-A-',
      },
      second: {
        namePrefix: 'Spec-Rst-B-',
      },
    },
  },
};
