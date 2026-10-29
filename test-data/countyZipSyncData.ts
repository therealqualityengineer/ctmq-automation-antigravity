import { addTempData } from './addTempData';

export const countyZipSyncData = {
  validZips: {
    suffolk: {
      zip: '02108',
      expectedCounty: 'Suffolk County',
    },
    hampden: {
      zip: addTempData.zipLookups.singleMatchHampden.zip,
      expectedCounty: addTempData.zipLookups.singleMatchHampden.county,
    },
    beverlyHills: {
      zip: addTempData.zipLookups.singleMatchBeverlyHills.zip,
      expectedCounty: addTempData.zipLookups.singleMatchBeverlyHills.county,
    },
  },
  invalidZips: {
    unknown: addTempData.zipLookups.unknownZip,
    incomplete: '021',
  },
  defaultCountyOption: 'None',
  messages: {
    noCountyFound: addTempData.messages.noCountyFound,
  },
};

