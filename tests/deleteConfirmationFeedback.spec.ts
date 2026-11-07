import { test, expect } from '../fixtures/customFixtures';
import { deleteConfirmationData } from '../test-data/deleteConfirmationData';
import { userDetailData } from '../test-data/userDetailData';

test.describe('CTMQ-55 - Implement Delete functionality with confirmation modal for Temp, Client, and User', () => {

  test('TC-01 - Verify Delete button presence and danger styling on Temp, Client, and User detail pages', async ({
    authenticatedTempDetailPage,
    authenticatedClientDetailPage,
    authenticatedUserDetailPage,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc01_t')
    );
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc01_c')
    );
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      deleteConfirmationData.generateUser('tc01_u')
    );

    try {
      // 1. Temp Detail Page
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await expect(authenticatedTempDetailPage.deleteButton).toBeVisible();
      await expect(authenticatedTempDetailPage.deleteButton).toHaveClass(
        new RegExp(deleteConfirmationData.styles.deleteButtonDangerClass)
      );

      // 2. Client Detail Page
      await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
      await expect(authenticatedClientDetailPage.deleteButton).toBeVisible();
      await expect(authenticatedClientDetailPage.deleteButton).toHaveClass(
        new RegExp(deleteConfirmationData.styles.deleteButtonDangerClass)
      );

      // 3. User Detail Page
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await expect(authenticatedUserDetailPage.deleteButton).toBeVisible();
      await expect(authenticatedUserDetailPage.deleteButton).toHaveClass(
        new RegExp(deleteConfirmationData.styles.deleteButtonDangerClass)
      );
    } finally {
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
      await authenticatedClientDetailPage.deleteClientViaApi(seedClient.id);
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-02 - Verify clicking Delete opens confirmation modal with prompt and action buttons', async ({
    authenticatedTempDetailPage,
    authenticatedClientDetailPage,
    authenticatedUserDetailPage,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc02_t')
    );

    try {
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();

      await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();
      await expect(authenticatedTempDetailPage.modalPrompt).toHaveText(deleteConfirmationData.modal.prompt);
      await expect(authenticatedTempDetailPage.modalCancelButton).toBeVisible();
      await expect(authenticatedTempDetailPage.modalCancelButton).toHaveText(deleteConfirmationData.modal.cancelButton);
      await expect(authenticatedTempDetailPage.modalConfirmDeleteButton).toBeVisible();
      await expect(authenticatedTempDetailPage.modalConfirmDeleteButton).toHaveText(deleteConfirmationData.modal.deleteButton);

      await authenticatedTempDetailPage.cancelDeleteModal();
      await expect(authenticatedTempDetailPage.deleteModal).toBeHidden();
    } finally {
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
    }
  });

  test('TC-03 - Verify modal dismissal via Cancel button aborts deletion without network call', async ({
    authenticatedTempDetailPage,
    authenticatedClientDetailPage,
    authenticatedUserDetailPage,
    page,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc03_t')
    );
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc03_c')
    );
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      deleteConfirmationData.generateUser('tc03_u')
    );

    try {
      // 1. Temp Cancel
      let deleteCalled = false;
      const tempListener = (req: any) => {
        if (req.url().includes('/api/temps') && req.method() === 'DELETE') deleteCalled = true;
      };
      page.on('request', tempListener);

      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();
      await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();
      await authenticatedTempDetailPage.cancelDeleteModal();
      await expect(authenticatedTempDetailPage.deleteModal).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.tempDetailPrefix}${seedTemp.id}`));
      expect(deleteCalled).toBe(false);
      page.off('request', tempListener);

      // 2. Client Cancel
      let clientDeleteCalled = false;
      const clientListener = (req: any) => {
        if (req.url().includes('/api/clients') && req.method() === 'DELETE') clientDeleteCalled = true;
      };
      page.on('request', clientListener);

      await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
      await authenticatedClientDetailPage.clickDelete();
      await expect(authenticatedClientDetailPage.deleteModal).toBeVisible();
      await authenticatedClientDetailPage.cancelDeleteModal();
      await expect(authenticatedClientDetailPage.deleteModal).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.clientDetailPrefix}${seedClient.id}`));
      expect(clientDeleteCalled).toBe(false);
      page.off('request', clientListener);

      // 3. User Cancel
      let userDeleteCalled = false;
      const userListener = (req: any) => {
        if (req.url().includes('/api/admin/users') && req.method() === 'DELETE') userDeleteCalled = true;
      };
      page.on('request', userListener);

      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickDelete();
      await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();
      await authenticatedUserDetailPage.cancelDeleteModal();
      await expect(authenticatedUserDetailPage.deleteModal).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.userDetailPrefix}${seedUser.id}`));
      expect(userDeleteCalled).toBe(false);
      page.off('request', userListener);
    } finally {
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
      await authenticatedClientDetailPage.deleteClientViaApi(seedClient.id);
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-04 - Verify modal dismissal via Escape key and Close (X) button aborts deletion', async ({
    authenticatedTempDetailPage,
    authenticatedClientDetailPage,
    page,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc04_esc')
    );
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc04_close')
    );

    try {
      // 1. Escape key dismissal on Temp
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();
      await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(authenticatedTempDetailPage.deleteModal).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.tempDetailPrefix}${seedTemp.id}`));

      // 2. Close (X) button dismissal on Client
      await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
      await authenticatedClientDetailPage.clickDelete();
      await expect(authenticatedClientDetailPage.deleteModal).toBeVisible();

      await authenticatedClientDetailPage.closeDeleteModal();
      await expect(authenticatedClientDetailPage.deleteModal).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.clientDetailPrefix}${seedClient.id}`));
    } finally {
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
      await authenticatedClientDetailPage.deleteClientViaApi(seedClient.id);
    }
  });

  test('TC-05 - Verify confirming Delete for Temp record deletes record, redirects to /temp, and shows banner', async ({
    authenticatedTempDetailPage,
    authenticatedTempPage,
    page,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc05')
    );

    await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
    await authenticatedTempDetailPage.clickDelete();

    await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();
    await expect(authenticatedTempDetailPage.modalPrompt).toHaveText(deleteConfirmationData.modal.prompt);

    const { status } = await authenticatedTempDetailPage.deleteAndInterceptResponse();
    expect(status).toBe(200);

    await expect(page).toHaveURL(new RegExp(deleteConfirmationData.urls.tempList));
    await expect(authenticatedTempDetailPage.deleteSuccessBanner).toBeVisible();

    // Verify deleted record no longer appears in listing
    await authenticatedTempPage.searchInput.fill(seedTemp.email);
    await authenticatedTempPage.searchButton.click();
    await page.waitForTimeout(300);
    const rowCount = await authenticatedTempPage.getRowCount();
    expect(rowCount).toBe(0);
  });

  test('TC-06 - Verify confirming Delete for Client record deletes record, redirects to /client, and shows banner', async ({
    authenticatedClientDetailPage,
    authenticatedClientPage,
    page,
  }) => {
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc06')
    );

    await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
    await authenticatedClientDetailPage.clickDelete();

    await expect(authenticatedClientDetailPage.deleteModal).toBeVisible();
    await expect(authenticatedClientDetailPage.modalPrompt).toHaveText(deleteConfirmationData.modal.prompt);

    const { status } = await authenticatedClientDetailPage.deleteAndInterceptResponse();
    expect(status).toBe(200);

    await expect(page).toHaveURL(new RegExp(deleteConfirmationData.urls.clientList));
    await expect(authenticatedClientDetailPage.deleteSuccessBanner).toBeVisible();

    // Verify deleted record no longer appears in listing
    await authenticatedClientPage.search(seedClient.fullName);
    const rowCount = await authenticatedClientPage.getRowCount();
    expect(rowCount).toBe(0);
  });

  test('TC-07 - Verify confirming Delete for User record deletes record, redirects to /admin/users, and shows banner', async ({
    authenticatedUserDetailPage,
    authenticatedUserManagerPage,
    page,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      deleteConfirmationData.generateUser('tc07')
    );

    await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
    await authenticatedUserDetailPage.clickDelete();

    await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();
    await expect(authenticatedUserDetailPage.modalPrompt).toHaveText(deleteConfirmationData.modal.prompt);

    const { status } = await authenticatedUserDetailPage.deleteAndInterceptResponse();
    expect(status).toBe(200);

    await expect(page).toHaveURL(new RegExp(deleteConfirmationData.urls.userManager));
    await expect(authenticatedUserDetailPage.deleteSuccessBanner).toBeVisible();

    // Verify deleted user no longer appears in User Manager list
    await authenticatedUserManagerPage.searchUser(seedUser.username);
    await expect(authenticatedUserManagerPage.noUsersFoundRow).toBeVisible();
  });

  test('TC-08 - Verify self-deletion prevention guard (400 Bad Request) on active logged-in admin user', async ({
    authenticatedUserDetailPage,
    page,
  }) => {
    await authenticatedUserDetailPage.gotoUserDetail(userDetailData.adminUser.id);
    await authenticatedUserDetailPage.clickDelete();

    await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();

    const { status } = await authenticatedUserDetailPage.deleteAndInterceptResponse();
    expect(status).toBe(400);

    await expect(authenticatedUserDetailPage.deleteModal).toBeHidden();
    await expect(authenticatedUserDetailPage.selfDeletionError).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.userDetailPrefix}${userDetailData.adminUser.id}`));
  });

  test('TC-09 - Verify unauthenticated DELETE requests to /api/temps, /api/clients, /api/admin/users are rejected with 401', async ({
    playwright,
  }) => {
    const unauthenticatedContext = await playwright.request.newContext();

    const tempResponse = await unauthenticatedContext.delete('http://localhost:5173/api/temps/99999');
    expect(tempResponse.status()).toBe(401);

    const clientResponse = await unauthenticatedContext.delete('http://localhost:5173/api/clients/99999');
    expect(clientResponse.status()).toBe(401);

    const userResponse = await unauthenticatedContext.delete('http://localhost:5173/api/admin/users/99999');
    expect(userResponse.status()).toBe(401);
  });

  test('TC-10 - Verify confirmation modal accessibility attributes (role="dialog", aria-modal="true")', async ({
    authenticatedTempDetailPage,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc10_access')
    );

    try {
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();

      const modal = authenticatedTempDetailPage.deleteModal;
      await expect(modal).toBeVisible();
      await expect(modal).toHaveAttribute('role', deleteConfirmationData.modal.role);
      await expect(modal).toHaveAttribute('aria-modal', deleteConfirmationData.modal.ariaModal);

      await authenticatedTempDetailPage.cancelDeleteModal();
      await expect(modal).toBeHidden();
    } finally {
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
    }
  });
});

test.describe('CTMQ-57 - Delete Confirmation Error Feedback & State Transition', () => {

  test('TC-11 - Verify Temp delete failure (500) closes modal and displays prominent red error banner', async ({
    authenticatedTempDetailPage,
    page,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc11')
    );

    try {
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();
      await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();

      await page.route(`**/api/temps/${seedTemp.id}`, async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify(deleteConfirmationData.mockErrors.internalServerError),
          });
        } else {
          await route.continue();
        }
      });

      await authenticatedTempDetailPage.confirmDelete();

      await expect(authenticatedTempDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedTempDetailPage.deleteErrorBanner).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.tempDetailPrefix}${seedTemp.id}`));
    } finally {
      await page.unroute(`**/api/temps/${seedTemp.id}`);
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
    }
  });

  test('TC-12 - Verify Client delete failure (500) closes modal and displays prominent red error banner', async ({
    authenticatedClientDetailPage,
    page,
  }) => {
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc12')
    );

    try {
      await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
      await authenticatedClientDetailPage.clickDelete();
      await expect(authenticatedClientDetailPage.deleteModal).toBeVisible();

      await page.route(`**/api/clients/${seedClient.id}`, async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify(deleteConfirmationData.mockErrors.internalServerError),
          });
        } else {
          await route.continue();
        }
      });

      await authenticatedClientDetailPage.confirmDelete();

      await expect(authenticatedClientDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedClientDetailPage.deleteErrorBanner).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.clientDetailPrefix}${seedClient.id}`));
    } finally {
      await page.unroute(`**/api/clients/${seedClient.id}`);
      await authenticatedClientDetailPage.deleteClientViaApi(seedClient.id);
    }
  });

  test('TC-13 - Verify User delete failure (500) closes modal and displays prominent red error banner', async ({
    authenticatedUserDetailPage,
    page,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      deleteConfirmationData.generateUser('tc13')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickDelete();
      await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();

      await page.route(`**/api/admin/users/${seedUser.id}`, async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify(deleteConfirmationData.mockErrors.internalServerError),
          });
        } else {
          await route.continue();
        }
      });

      await authenticatedUserDetailPage.confirmDelete();

      await expect(authenticatedUserDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedUserDetailPage.errorBanner).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${deleteConfirmationData.urls.userDetailPrefix}${seedUser.id}`));
    } finally {
      await page.unroute(`**/api/admin/users/${seedUser.id}`);
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-14 - Verify Temp delete 404 Not Found displays error banner', async ({
    authenticatedTempDetailPage,
    page,
  }) => {
    const seedTemp = await authenticatedTempDetailPage.createTempViaApi(
      deleteConfirmationData.generateTemp('tc14')
    );

    try {
      await authenticatedTempDetailPage.gotoTempDetail(seedTemp.id);
      await authenticatedTempDetailPage.clickDelete();
      await expect(authenticatedTempDetailPage.deleteModal).toBeVisible();

      await page.route(`**/api/temps/${seedTemp.id}`, async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify(deleteConfirmationData.mockErrors.tempNotFound),
          });
        } else {
          await route.continue();
        }
      });

      await authenticatedTempDetailPage.confirmDelete();

      await expect(authenticatedTempDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedTempDetailPage.deleteErrorBanner).toBeVisible();
    } finally {
      await page.unroute(`**/api/temps/${seedTemp.id}`);
      await authenticatedTempDetailPage.deleteTempViaApi(seedTemp.id);
    }
  });

  test('TC-15 - Verify Client delete 404 Not Found displays error banner', async ({
    authenticatedClientDetailPage,
    page,
  }) => {
    const seedClient = await authenticatedClientDetailPage.createClientViaApi(
      deleteConfirmationData.generateClient('tc15')
    );

    try {
      await authenticatedClientDetailPage.gotoClientDetail(seedClient.id);
      await authenticatedClientDetailPage.clickDelete();
      await expect(authenticatedClientDetailPage.deleteModal).toBeVisible();

      await page.route(`**/api/clients/${seedClient.id}`, async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify(deleteConfirmationData.mockErrors.clientNotFound),
          });
        } else {
          await route.continue();
        }
      });

      await authenticatedClientDetailPage.confirmDelete();

      await expect(authenticatedClientDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedClientDetailPage.deleteErrorBanner).toBeVisible();
    } finally {
      await page.unroute(`**/api/clients/${seedClient.id}`);
      await authenticatedClientDetailPage.deleteClientViaApi(seedClient.id);
    }
  });
});
