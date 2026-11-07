import { specialtiesData } from './specialtiesData';
import { certificationsData } from './certificationsData';

export const editData = {
  routes: {
    specialties: specialtiesData.routes.specialties,
    certifications: certificationsData.routes.certifications,
    login: specialtiesData.routes.login,
  },
  specialties: {
    editTitle: specialtiesData.modal.editTitle,
    saveChangesButton: specialtiesData.modal.saveChangesButton,
    updateSuccess: specialtiesData.validationMessages.updateSuccess,
    mockErrorMessage: 'Failed to update specialty',
    generateUniqueName: (): string => `Spec-Edit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  },
  certifications: {
    editTitle: certificationsData.modal.editTitle,
    saveChangesButton: certificationsData.modal.saveChangesButton,
    updateSuccess: certificationsData.validationMessages.updateSuccess,
    mockErrorMessage: 'Failed to update certification',
    generateUniqueName: (): string => `Cert-Edit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  },
};

