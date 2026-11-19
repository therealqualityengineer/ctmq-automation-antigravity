import { TempPayload } from './addTempData';

export const tempMandatoryFieldsData = {
  mandatoryLabels: [
    'First Name',
    'Last Name',
    'Cell Phone',
    'Email',
    'Address',
    'City',
    'State',
    'ZIP',
    'Certification',
    'Specialty',
  ] as const,

  nonMarkedLabels: [
    'County',
    'Status',
    'Date of Birth',
    'Gender',
    'Marital Status',
  ] as const,

  messages: {
    tempCreated: 'Temp created successfully.',
    tempUpdated: 'Temp updated successfully.',
    requiredErrorPattern: /required|must be|missing|select|cannot be empty|invalid/i,
    certOrSpecialtyErrorPattern: /certification|specialty|required|mapped/i,
  },

  invalidValues: {
    empty: '',
    whitespace: '   ',
    unmappedFallbackSpecialty: 'NonExistent_Unmapped_Specialty_CTMQ78',
  },

  generateValidTemp: (tag: string, certification: string, specialty: string): TempPayload => {
    const unique = `${tag}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      firstName: `MandFirst_${tag}`,
      lastName: `MandLast_${tag}`,
      cellPhone: '555-345-6789',
      email: `ctmq78_${unique}@example.com`,
      address: '789 Mandatory Way',
      city: 'Agawam',
      state: 'MA',
      zip: '01001',
      county: 'Hampden County',
      status: 'Active',
      certification,
      specialty,
      dateOfBirth: '1991-04-12',
      gender: 'Female',
      maritalStatus: 'Single',
    };
  },
};
