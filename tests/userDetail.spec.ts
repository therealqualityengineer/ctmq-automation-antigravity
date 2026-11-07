import { test, expect } from '../fixtures/customFixtures';
import { userDetailData } from '../test-data/userDetailData';

test.describe('CTMQ-56 - Align User Profile page with Temp and Client View/Edit mode pattern', () => {

  test('TC-01 - Default View Mode Verification', async ({
    authenticatedUserDetailPage,
    page,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc01')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);

      await expect(page).toHaveURL(new RegExp(`${userDetailData.urls.userDetailPrefix}${seedUser.id}`));
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
      await expect(authenticatedUserDetailPage.editButton).toBeVisible();
      await expect(authenticatedUserDetailPage.deleteButton).toBeVisible();
      await expect(authenticatedUserDetailPage.saveButton).toBeHidden();
      await expect(authenticatedUserDetailPage.cancelButton).toBeHidden();

      const allDisabled = await authenticatedUserDetailPage.areAllFieldsDisabled();
      expect(allDisabled).toBe(true);

      await expect(authenticatedUserDetailPage.roleDisplay).toHaveText(userDetailData.roles.defaultRole);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-02 - Mode Transition to Edit', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc02')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.editUser);
      await expect(authenticatedUserDetailPage.saveButton).toBeVisible();
      await expect(authenticatedUserDetailPage.cancelButton).toBeVisible();
      await expect(authenticatedUserDetailPage.deleteButton).toBeVisible();
      await expect(authenticatedUserDetailPage.editButton).toBeHidden();

      const allEnabled = await authenticatedUserDetailPage.areAllFieldsEnabled();
      expect(allEnabled).toBe(true);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-03 - Cancel Discards Changes and Restores View Mode', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc03')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await authenticatedUserDetailPage.fillForm({
        fullName: 'Modified Pending Cancel',
        title: 'Temporary Modified Title',
      });

      await authenticatedUserDetailPage.clickCancel();

      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
      await expect(authenticatedUserDetailPage.fullNameInput).toHaveValue(seedUser.fullName);
      await expect(authenticatedUserDetailPage.titleInput).toHaveValue(seedUser.title);

      const allDisabled = await authenticatedUserDetailPage.areAllFieldsDisabled();
      expect(allDisabled).toBe(true);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-04 - Save User Changes with In-Page Feedback', async ({
    authenticatedUserDetailPage,
    page,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc04')
    );
    const updatedTitle = 'Senior Staffing Director';

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await authenticatedUserDetailPage.fillForm({
        title: updatedTitle,
      });

      const { status, body } = await authenticatedUserDetailPage.saveAndInterceptPutResponse();
      expect(status).toBe(200);
      expect(body.title).toBe(updatedTitle);

      await expect(page).toHaveURL(new RegExp(`${userDetailData.urls.userDetailPrefix}${seedUser.id}`));
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
      await expect(authenticatedUserDetailPage.titleInput).toHaveValue(updatedTitle);
      await expect(authenticatedUserDetailPage.saveSuccessBanner).toBeVisible();

      const allDisabled = await authenticatedUserDetailPage.areAllFieldsDisabled();
      expect(allDisabled).toBe(true);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-05 - Validation Error on Required Fields in Edit Mode', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc05')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await authenticatedUserDetailPage.fullNameInput.clear();
      await authenticatedUserDetailPage.clickSave();

      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.editUser);
      await expect(authenticatedUserDetailPage.fullNameRequiredError).toBeVisible();
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-06 - Duplicate Username Conflict (409) in Edit Mode', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc06')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await authenticatedUserDetailPage.fillForm({
        username: userDetailData.adminUser.username,
      });

      const { status } = await authenticatedUserDetailPage.saveAndInterceptPutResponse();
      expect(status).toBe(409);

      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.editUser);
      await expect(authenticatedUserDetailPage.duplicateUsernameError).toBeVisible();
      await expect(authenticatedUserDetailPage.usernameInput).toHaveValue(userDetailData.adminUser.username);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-07 - Self-Deactivation Prevention Guard (400)', async ({
    authenticatedUserDetailPage,
  }) => {
    await authenticatedUserDetailPage.gotoUserDetail(userDetailData.adminUser.id);
    await authenticatedUserDetailPage.clickEdit();

    await authenticatedUserDetailPage.fillForm({
      isActive: false,
    });

    const { status } = await authenticatedUserDetailPage.saveAndInterceptPutResponse();
    expect(status).toBe(400);

    await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.editUser);
    await expect(authenticatedUserDetailPage.selfDeactivationError).toBeVisible();

    await authenticatedUserDetailPage.clickCancel();
    await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
  });

  test('TC-08 - Delete Modal Triggered from View Mode and Dismissed', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc08')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickDelete();

      await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();
      await expect(authenticatedUserDetailPage.modalTitle).toHaveText(userDetailData.modal.title);
      await expect(authenticatedUserDetailPage.modalPrompt).toHaveText(userDetailData.modal.prompt);

      await authenticatedUserDetailPage.cancelDeleteModal();
      await expect(authenticatedUserDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-09 - Delete Modal Triggered from Edit Mode and Dismissed', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc09')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      await authenticatedUserDetailPage.clickDelete();

      await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();
      await expect(authenticatedUserDetailPage.modalTitle).toHaveText(userDetailData.modal.title);
      await expect(authenticatedUserDetailPage.modalPrompt).toHaveText(userDetailData.modal.prompt);

      await authenticatedUserDetailPage.cancelDeleteModal();
      await expect(authenticatedUserDetailPage.deleteModal).toBeHidden();
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.editUser);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-10 - Delete User Execution and Redirection to User Manager', async ({
    authenticatedUserDetailPage,
    userManagerPage,
    page,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc10')
    );

    await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
    await authenticatedUserDetailPage.clickDelete();

    await expect(authenticatedUserDetailPage.deleteModal).toBeVisible();
    const { status } = await authenticatedUserDetailPage.deleteAndInterceptResponse();
    expect(status).toBe(200);

    await expect(page).toHaveURL(new RegExp(userDetailData.urls.userManager));
    await expect(authenticatedUserDetailPage.deleteSuccessBanner).toBeVisible();

    await userManagerPage.searchUser(seedUser.username);
    await expect(userManagerPage.noUsersFoundRow).toBeVisible();
  });

  test('TC-11 - Self-Deletion Prevention Guard (400)', async ({
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
    await expect(authenticatedUserDetailPage.pageHeading).toHaveText(userDetailData.headings.viewUser);
    await expect(page).toHaveURL(new RegExp(`${userDetailData.urls.userDetailPrefix}${userDetailData.adminUser.id}`));
  });
});
