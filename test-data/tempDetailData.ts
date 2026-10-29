import { TempPayload } from './addTempData';

export const tempDetailData = {
  urls: {
    tempList: '/temp',
    addTemp: '/temp/new',
    login: '/login',
    apiTemps: '/api/temps',
  },
  headings: {
    viewTemp: 'View Temp',
    editTemp: 'Edit Temp',
    addTemp: 'Add Temp',
    tempList: 'Temp',
  },
  messages: {
    duplicateEmail: 'That email address is already in use.',
    notFound: 'This temp could not be found.',
    noCountyFound: 'No county found for this ZIP — please check the ZIP.',
  },
  testValues: {
    modifiedPhone: '555-987-6543',
    modifiedAddress: '456 Oak Avenue',
    secondModifiedAddress: '789 Pine Road',
    secondModifiedPhone: '555-444-3333',
    newZipBeverlyHills: '90210',
    newCountyBeverlyHills: 'Los Angeles County',
    invalidEmail: 'invalid-email-format',
    nonExistentId: '9999999',
  },
  viewports: {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 375, height: 667 },
  },
  generateTemp: (tag: string = 'detail'): TempPayload => {
    const timestamp = Date.now();
    return {
      firstName: `AutoFirst_${tag}`,
      lastName: `AutoLast_${tag}`,
      cellPhone: '555-234-5678',
      email: `temp_${tag}_${timestamp}@example.com`,
      address: '100 Initial Street',
      city: 'Agawam',
      state: 'MA',
      zip: '01001',
      county: 'Hampden County',
      status: 'Active',
      dateOfBirth: '1990-05-20',
      gender: 'Male',
      maritalStatus: 'Single',
    };
  },
};

