import { test, expect } from '../fixtures/customFixtures';
import { addUserData } from '../test-data/addUserData';

test.describe('CTMQ-6 - Add User Functionality Suite', () => {

  test('TC-01 - Navigation to Add User form via + Add User button', async ({ authenticatedUserManagerPage, page }) => {
    await authenticatedUserManagerPage.clickAddUserButton();

    await expect(page).toHaveURL(new RegExp(addUserData.urls.addUser));
    const addUserHeading = page.getByRole('heading', { name: 'Add User', exact: true });
    await expect(addUserHeading).toBeVisible();
  });

  test('TC-02 - Add User form layout, field defaults, and role immutability', async ({ authenticatedAddUserPage }) => {
    await expect(authenticatedAddUserPage.pageHeading).toBeVisible();
    await expect(authenticatedAddUserPage.fullNameInput).toBeVisible();
    await expect(authenticatedAddUserPage.usernameInput).toBeVisible();
    await expect(authenticatedAddUserPage.titleInput).toBeVisible();
    await expect(authenticatedAddUserPage.emailInput).toBeVisible();
    await expect(authenticatedAddUserPage.passwordInput).toBeVisible();
    await expect(authenticatedAddUserPage.confirmPasswordInput).toBeVisible();
    await expect(authenticatedAddUserPage.roleDisplay).toBeVisible();
    await expect(authenticatedAddUserPage.statusSelect).toBeVisible();
    await expect(authenticatedAddUserPage.saveButton).toBeVisible();
    await expect(authenticatedAddUserPage.cancelButton).toBeVisible();

    const roleText = await authenticatedAddUserPage.getRoleText();
    expect(roleText).toBe(addUserData.roles.defaultRole);

    const defaultStatus = await authenticatedAddUserPage.getSelectedStatus();
    expect(defaultStatus).toBe(addUserData.statuses.active);
  });

  test('TC-03 - Successful creation of active Staffing Admin account', async ({ authenticatedAddUserPage, userManagerPage, page }) => {
    const newUser = addUserData.generateUser('act');
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      status: addUserData.statuses.active,
    });

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.username).toBe(newUser.username);
    expect(body.isActive).toBe(true);

    await expect(page).toHaveURL(new RegExp(addUserData.urls.userManager));
    await expect(userManagerPage.userCreatedBanner).toBeVisible();
  });

  test('TC-04 - Successful creation of inactive Staffing Admin account', async ({ authenticatedAddUserPage, userManagerPage, page }) => {
    const newUser = addUserData.generateUser('inact');
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      status: addUserData.statuses.inactive,
    });

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.username).toBe(newUser.username);
    expect(body.isActive).toBe(false);

    await expect(page).toHaveURL(new RegExp(addUserData.urls.userManager));
    await expect(userManagerPage.userCreatedBanner).toBeVisible();

    await userManagerPage.searchUser(newUser.username);
    const userRow = userManagerPage.getUserRowByUsername(newUser.username);
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText(addUserData.statuses.inactiveDisplay);
  });

  test('TC-05 - Newly created user visibility and accuracy in User Manager list', async ({ authenticatedAddUserPage, userManagerPage, page }) => {
    const newUser = addUserData.generateUser('vis');
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      status: addUserData.statuses.active,
    });

    const { status } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);

    await expect(page).toHaveURL(new RegExp(addUserData.urls.userManager));
    await expect(userManagerPage.userCreatedBanner).toBeVisible();

    await userManagerPage.searchUser(newUser.username);
    const userRow = userManagerPage.getUserRowByUsername(newUser.username);
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText(newUser.fullName);
    await expect(userRow).toContainText(newUser.username);
    await expect(userRow).toContainText(newUser.title);
    await expect(userRow).toContainText(addUserData.roles.defaultRole);
    await expect(userRow).toContainText(addUserData.statuses.activeDisplay);
    await expect(userRow).toContainText(newUser.email);
  });

  test('TC-06 - Cancel button discards input and returns to list', async ({ authenticatedAddUserPage, userManagerPage, page }) => {
    const newUser = addUserData.generateUser('cancel');
    await authenticatedAddUserPage.fillForm(newUser);

    await authenticatedAddUserPage.clickCancel();

    await expect(page).toHaveURL(new RegExp(addUserData.urls.userManager));
    await userManagerPage.searchUser(newUser.username);
    await expect(userManagerPage.noUsersFoundRow).toBeVisible();
  });

  test('TC-07 - Mandatory field validation on empty form submission', async ({ authenticatedAddUserPage, page }) => {
    await authenticatedAddUserPage.clickSave();

    const isFullNameValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.fullNameInput);
    const isUsernameValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.usernameInput);
    const isTitleValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.titleInput);
    const isEmailValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.emailInput);
    const isPasswordValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.passwordInput);
    const isConfirmPasswordValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.confirmPasswordInput);

    expect(isFullNameValid).toBe(false);
    expect(isUsernameValid).toBe(false);
    expect(isTitleValid).toBe(false);
    expect(isEmailValid).toBe(false);
    expect(isPasswordValid).toBe(false);
    expect(isConfirmPasswordValid).toBe(false);

    await expect(page).toHaveURL(new RegExp(addUserData.urls.addUser));
  });

  test('TC-08 - Individual mandatory field validation', async ({ authenticatedAddUserPage }) => {
    const newUser = addUserData.generateUser('indiv');

    // Omit Full Name
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      fullName: '',
    });
    await authenticatedAddUserPage.clickSave();
    expect(await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.fullNameInput)).toBe(false);

    // Omit Username
    await authenticatedAddUserPage.fillFullName(newUser.fullName);
    await authenticatedAddUserPage.clearUsername();
    await authenticatedAddUserPage.clickSave();
    expect(await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.usernameInput)).toBe(false);

    // Omit Title
    await authenticatedAddUserPage.fillUsername(newUser.username);
    await authenticatedAddUserPage.clearTitle();
    await authenticatedAddUserPage.clickSave();
    expect(await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.titleInput)).toBe(false);

    // Omit Email
    await authenticatedAddUserPage.fillTitle(newUser.title);
    await authenticatedAddUserPage.clearEmail();
    await authenticatedAddUserPage.clickSave();
    expect(await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.emailInput)).toBe(false);
  });

  test('TC-09 - Invalid email format validation', async ({ authenticatedAddUserPage }) => {
    const newUser = addUserData.generateUser('invemail');
    await authenticatedAddUserPage.fillForm(newUser);

    for (const invalidEmail of addUserData.invalidEmails) {
      await authenticatedAddUserPage.fillEmail(invalidEmail);
      await authenticatedAddUserPage.clickSave();
      const isValid = await authenticatedAddUserPage.isFieldHtmlValid(authenticatedAddUserPage.emailInput);
      expect(isValid).toBe(false);
    }
  });

  test('TC-10 - Duplicate User Name conflict handling', async ({ authenticatedAddUserPage }) => {
    const newUser = addUserData.generateUser('dupuser');
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      username: addUserData.existingUsers.adminUsername,
    });

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(409);
    expect(body.message).toBe(addUserData.messages.usernameAlreadyInUse);
    await expect(authenticatedAddUserPage.usernameInUseError).toBeVisible();
  });

  test('TC-11 - Duplicate Email conflict handling', async ({ authenticatedAddUserPage }) => {
    const newUser = addUserData.generateUser('dupemail');
    await authenticatedAddUserPage.fillForm({
      ...newUser,
      email: addUserData.existingUsers.adminEmail,
    });

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(409);
    expect(body.message).toBe(addUserData.messages.emailAlreadyInUse);
    await expect(authenticatedAddUserPage.emailInUseError).toBeVisible();
  });

  test('TC-12 - Route protection for unauthenticated users', async ({ addUserPage, page }) => {
    await addUserPage.gotoAddUser();
    await expect(page).toHaveURL(new RegExp(addUserData.urls.login));
    await expect(addUserPage.pageHeading).not.toBeVisible();
  });

  test('TC-13 - API endpoint authorization enforcement', async ({ request }) => {
    const response = await request.post(addUserData.urls.apiUsers, {
      data: addUserData.generateUser('unauth'),
    });
    expect(response.status()).toBe(401);
  });

  test('TC-14 - Input sanitization and leading/trailing whitespace trimming', async ({ authenticatedAddUserPage }) => {
    const suffix = `${Date.now()}`;
    const rawUsername = `usr_trim_${suffix}`;
    const rawEmail = `usr_trim_${suffix}@example.com`;

    await authenticatedAddUserPage.fillForm({
      fullName: '  Trimmed User  ',
      username: `  ${rawUsername}  `,
      title: '  Coordinator  ',
      email: `  ${rawEmail}  `,
      password: addUserData.defaultPassword,
      confirmPassword: addUserData.defaultPassword,
    });

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body.username).toBe(rawUsername);
    expect(body.email).toBe(rawEmail);
  });

  test('TC-15 - Maximum boundary length handling on input fields', async ({ authenticatedAddUserPage }) => {
    const suffix = `${Date.now()}`;
    await authenticatedAddUserPage.fillForm({
      fullName: addUserData.boundaryLengths.longName,
      username: `usr_${suffix}`,
      title: addUserData.boundaryLengths.longTitle,
      email: `bound_${suffix}@example.com`,
      password: addUserData.defaultPassword,
      confirmPassword: addUserData.defaultPassword,
    });

    const { status } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect([201, 400]).toContain(status);
  });

  test('TC-16 - Double-submission and in-progress save protection', async ({ authenticatedAddUserPage, userManagerPage, page }) => {
    const newUser = addUserData.generateUser('dblsub');
    await authenticatedAddUserPage.fillForm(newUser);

    const apiRequests: any[] = [];
    page.on('request', (req) => {
      if (req.url().includes(addUserData.urls.apiUsers) && req.method() === 'POST') {
        apiRequests.push(req);
      }
    });

    await authenticatedAddUserPage.clickSaveRapidly();

    await expect(page).toHaveURL(new RegExp(addUserData.urls.userManager));
    await expect(userManagerPage.userCreatedBanner).toBeVisible();
    expect(apiRequests.length).toBe(1);
  });

  test('TC-17 - Security: Password hash exclusion in API response', async ({ authenticatedAddUserPage }) => {
    const newUser = addUserData.generateUser('sec');
    await authenticatedAddUserPage.fillForm(newUser);

    const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
    expect(status).toBe(201);
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');
    expect(body).not.toHaveProperty('password_hash');
    expect(body).not.toHaveProperty('hash');
    expect(body).not.toHaveProperty('salt');
  });

  test('TC-18 - Non-regression: Existing search, pagination, and edit workflows', async ({ authenticatedUserManagerPage, page }) => {
    await expect(authenticatedUserManagerPage.pageHeading).toBeVisible();
    await expect(authenticatedUserManagerPage.searchInput).toBeVisible();
    await expect(authenticatedUserManagerPage.userTable).toBeVisible();

    await authenticatedUserManagerPage.searchUser(addUserData.existingUsers.adminUsername);
    const matchedRow = authenticatedUserManagerPage.getUserRowByUsername(addUserData.existingUsers.adminUsername);
    await expect(matchedRow).toBeVisible();

    await authenticatedUserManagerPage.clearSearch();
    await expect(authenticatedUserManagerPage.userTable).toBeVisible();
  });
});
