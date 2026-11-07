import { TempPayload } from './addTempData';
import { ClientPayload } from './clientData';
import { UserDetailPayload } from './userDetailData';

export const deleteConfirmationData = {
  urls: {
    tempList: '/temp',
    tempDetailPrefix: '/temp/',
    clientList: '/client',
    clientDetailPrefix: '/client/',
    userManager: '/admin/users',
    userDetailPrefix: '/admin/users/',
    apiTemps: '/api/temps',
    apiClients: '/api/clients',
    apiUsers: '/api/admin/users',
  },
  modal: {
    prompt: "Are you sure? This can't be undone.",
    tempHeading: 'Delete Temp',
    clientHeading: 'Delete Client',
    userHeading: 'Delete User',
    cancelButton: 'Cancel',
    deleteButton: 'Delete',
    role: 'dialog',
    ariaModal: 'true',
  },
  styles: {
    deleteButtonDangerClass: 'bg-red-600',
  },
  banners: {
    tempDeletedSuccess: 'Temp deleted successfully.',
    clientDeletedSuccess: 'Client deleted successfully.',
    userDeletedSuccess: 'User deleted successfully.',
    tempDeleteError: 'Failed to delete temp.',
    clientDeleteError: 'Failed to delete client.',
    userDeleteError: 'Failed to delete user.',
    selfDeletionError: 'You cannot delete your own account.',
  },
  mockErrors: {
    internalServerError: { message: 'Internal Server Error' },
    tempNotFound: { message: 'Temp not found' },
    clientNotFound: { message: 'Client not found' },
    userNotFound: { message: 'User not found' },
    selfDeleteGuard: { message: 'You cannot delete your own account.' },
  },
  generateTemp: (tag: string = 'del'): TempPayload => {
    const timestamp = Date.now();
    return {
      firstName: `DelFirst_${tag}`,
      lastName: `DelLast_${timestamp.toString().slice(-4)}`,
      cellPhone: '555-321-4321',
      email: `del.temp.${tag}.${timestamp}@testctmq.com`,
      address: '123 Removal Way',
      city: 'Albany',
      state: 'NY',
      zip: '12207',
      county: 'Albany County',
      status: 'Active',
      dateOfBirth: '1992-05-15',
      gender: 'Female',
      maritalStatus: 'Single',
    };
  },
  generateClient: (tag: string = 'del'): ClientPayload => {
    const timestamp = Date.now();
    return {
      fullName: `Del Client ${tag} ${timestamp.toString().slice(-4)}`,
      email: `del.client.${tag}.${timestamp}@testctmq.com`,
      address: '456 Elimination Blvd',
      city: 'Buffalo',
      state: 'NY',
      zip: '14201',
      county: 'Erie County',
      status: 'Active',
    };
  },
  generateUser: (tag: string = 'del'): UserDetailPayload => {
    const timestamp = Date.now();
    return {
      username: `del_user_${tag}_${timestamp.toString().slice(-4)}`,
      email: `del.user.${tag}.${timestamp}@testctmq.com`,
      fullName: `Del User ${tag}`,
      title: 'QA Deletion Verification Specialist',
      role: 'Staffing Admin',
      isActive: true,
      password: 'Password123!',
    };
  },
};
