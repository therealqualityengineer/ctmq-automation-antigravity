export interface TempPayload {
  firstName: string;
  lastName: string;
  cellPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  status: 'Active' | 'Inactive';
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
}

export const addTempData = {
  urls: {
    addTemp: '/temp/new',
    tempList: '/temp',
    apiTemps: '/api/temps',
    login: '/login',
  },
  headings: {
    addTemp: 'Add Temp',
    tempList: 'Temp',
  },
  messages: {
    successCreated: 'Temp created successfully.',
    duplicateEmail: 'That email address is already in use.',
    noCountyFound: 'No county found for this ZIP — please check the ZIP.',
    serverError: 'Internal Server Error',
  },
  statuses: {
    active: 'Active' as const,
    inactive: 'Inactive' as const,
  },
  genders: {
    male: 'Male' as const,
    female: 'Female' as const,
    other: 'Other' as const,
  },
  maritalStatuses: {
    single: 'Single' as const,
    married: 'Married' as const,
    divorced: 'Divorced' as const,
    widowed: 'Widowed' as const,
  },
  zipLookups: {
    singleMatchHampden: {
      zip: '01001',
      state: 'MA',
      city: 'Agawam',
      county: 'Hampden County',
    },
    singleMatchBeverlyHills: {
      zip: '90210',
      state: 'CA',
      city: 'Beverly Hills',
      county: 'Los Angeles County',
    },
    unknownZip: '00000',
  },
  all50States: [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ],
  generateTemp: (tag: string = 'test'): TempPayload => {
    const timestamp = Date.now();
    return {
      firstName: `AutoFirst_${tag}`,
      lastName: `AutoLast_${tag}`,
      cellPhone: '555-234-5678',
      email: `temp_${tag}_${timestamp}@example.com`,
      address: '456 Automation Ave',
      city: 'Agawam',
      state: 'MA',
      zip: '01001',
      county: 'Hampden County',
      status: 'Active',
      dateOfBirth: '1992-06-15',
      gender: 'Female',
      maritalStatus: 'Single',
    };
  },
};

