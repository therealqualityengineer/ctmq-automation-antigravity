export const countyZipSyncData = {
  validZips: {
    suffolk: {
      zip: '02108',
      expectedCounty: 'Suffolk County',
    },
    hampden: {
      zip: '01001',
      expectedCounty: 'Hampden County',
    },
    beverlyHills: {
      zip: '90210',
      expectedCounty: 'Los Angeles County',
    },
  },
  invalidZips: {
    unknown: '00000',
    incomplete: '021',
  },
  defaultCountyOption: 'None',
  messages: {
    noCountyFound: 'No county found for this ZIP — please check the ZIP.',
  },
};

