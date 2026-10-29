export interface ClientPayload {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  status: string;
}

export const clientData = {
  urls: {
    client: '/client',
    clientNew: '/client/new',
    apiClients: '/api/clients',
    login: '/login',
  },
  headings: {
    client: 'Client',
    addClient: 'Add Client',
    viewClient: 'View Client',
    editClient: 'Edit Client',
  },
  tableHeaders: ['FULL NAME', 'EMAIL', 'STATUS'],
  statuses: {
    active: 'Active',
    inactive: 'Inactive',
  },
  messages: {
    createSuccess: 'Client created successfully.',
    saveSuccess: 'Client saved successfully.',
    noCountyFound: 'No county found for this ZIP — please check the ZIP.',
    noRecordsFound: 'No records found.',
  },
  zipLookups: {
    singleMatchNewYork: {
      zip: '10001',
      county: 'New York County',
      state: 'NY',
    },
    singleMatchBeverlyHills: {
      zip: '90210',
      county: 'Los Angeles County',
      state: 'CA',
    },
    unknownZip: '00000',
  },
  viewports: {
    desktop: { width: 1280, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
  generateClient: (tag: string = 'test'): ClientPayload => {
    const timestamp = Date.now();
    return {
      fullName: `Global Client ${tag} ${timestamp}`,
      email: `client.${tag}.${timestamp}@example.com`,
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'NY',
      zip: '10001',
      county: 'New York County',
      status: 'Active',
    };
  },
  invalidEmails: ['invalid-email', 'missing-domain@', '@no-local.com', 'spaces in@email.com'],
};

