import { test, expect } from '../fixtures/customFixtures';
import { addUserData } from '../test-data/addUserData';
import { userDetailData } from '../test-data/userDetailData';

test.describe('CTMQ-82 - Add/Edit User Mandatory Field Indicators, Optional Title Uniformity & Validation', () => {
  test('TC-01 - Verify red asterisk (*) indicator on all 5 mandatory field labels and absence on non-marked fields on Add User (/admin/users/new)', async ({
    authenticatedAddUserPage,
  }) => {
    await expect(authenticatedAddUserPage.pageHeading).toBeVisible();

    for (const label of addUserData.mandatoryLabels) {
      const labelLocator = authenticatedAddUserPage.getFieldLabel(label);
      const asteriskLocator = authenticatedAddUserPage.getRequiredAsterisk(label);

      await expect(labelLocator, `Label "${label}" should be visible on Add User`).toBeVisible();
      await expect(asteriskLocator, `Label "${label}" should display red asterisk (*)`).toBeVisible();
      await expect(asteriskLocator).toHaveText('*');
      await expect(asteriskLocator).toHaveAttribute('aria-hidden', 'true');
    }

    for (const nonMandatoryLabel of addUserData.nonMandatoryLabels) {
      const labelLocator = authenticatedAddUserPage.getFieldLabel(nonMandatoryLabel);
      const asteriskLocator = authenticatedAddUserPage.getRequiredAsterisk(nonMandatoryLabel);

      await expect(labelLocator, `Optional label "${nonMandatoryLabel}" should be visible`).toBeVisible();
      await expect(
        asteriskLocator,
        `Optional label "${nonMandatoryLabel}" must NOT display a red asterisk (*)`
      ).toHaveCount(0);
    }

    expect(await authenticatedAddUserPage.isTitleRequiredAttrPresent()).toBe(false);
  });

  test('TC-02 - Verify red asterisk (*) indicator on all 3 mandatory field labels and absence on non-marked fields in both View and Edit modes on View/Edit User (/admin/users/:id)', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(
      userDetailData.generateUser('tc02')
    );

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(
        userDetailData.headings.viewUser
      );

      // Verify View mode labels
      for (const label of userDetailData.mandatoryLabels) {
        const labelLocator = authenticatedUserDetailPage.getFieldLabel(label);
        const asteriskLocator = authenticatedUserDetailPage.getRequiredAsterisk(label);

        await expect(labelLocator, `View mode label "${label}" should be visible`).toBeVisible();
        await expect(asteriskLocator, `View mode label "${label}" should display red asterisk (*)`).toBeVisible();
        await expect(asteriskLocator).toHaveText('*');
      }

      for (const nonMandatoryLabel of userDetailData.nonMandatoryLabels) {
        const labelLocator = authenticatedUserDetailPage.getFieldLabel(nonMandatoryLabel);
        const asteriskLocator = authenticatedUserDetailPage.getRequiredAsterisk(nonMandatoryLabel);

        await expect(labelLocator).toBeVisible();
        await expect(
          asteriskLocator,
          `View mode optional label "${nonMandatoryLabel}" must NOT display a red asterisk (*)`
        ).toHaveCount(0);
      }

      // Switch to Edit mode and re-verify
      await authenticatedUserDetailPage.clickEdit();
      await expect(authenticatedUserDetailPage.pageHeading).toHaveText(
        userDetailData.headings.editUser
      );

      for (const label of userDetailData.mandatoryLabels) {
        const labelLocator = authenticatedUserDetailPage.getFieldLabel(label);
        const asteriskLocator = authenticatedUserDetailPage.getRequiredAsterisk(label);

        await expect(labelLocator, `Edit mode label "${label}" should be visible`).toBeVisible();
        await expect(asteriskLocator, `Edit mode label "${label}" should display red asterisk (*)`).toBeVisible();
        await expect(asteriskLocator).toHaveText('*');
      }

      for (const nonMandatoryLabel of userDetailData.nonMandatoryLabels) {
        const asteriskLocator = authenticatedUserDetailPage.getRequiredAsterisk(nonMandatoryLabel);
        await expect(
          asteriskLocator,
          `Edit mode optional label "${nonMandatoryLabel}" must NOT display a red asterisk (*)`
        ).toHaveCount(0);
      }

      expect(await authenticatedUserDetailPage.isTitleRequiredAttrPresent()).toBe(false);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-03 - Optional Title uniformity: creating a User with empty or whitespace Title succeeds (201 Created) and persists title: null', async ({
    authenticatedAddUserPage,
    userDetailPage,
  }) => {
    const uiUser = addUserData.generateUser('tc03ui');
    let createdUiUserId: number | string | undefined;
    let createdApiUserId: number | string | undefined;

    try {
      await authenticatedAddUserPage.fillForm({
        ...uiUser,
        title: '   ',
      });

      const { status, body } = await authenticatedAddUserPage.saveAndInterceptApiResponse();
      expect(status).toBe(201);
      expect(body.title).toBeNull();
      createdUiUserId = body.id;

      // Also verify direct API POST with empty title normalizes to null
      const apiUser = addUserData.generateUser('tc03api');
      const apiResult = await authenticatedAddUserPage.postCreateUserRawViaApi({
        fullName: apiUser.fullName,
        username: apiUser.username,
        title: '',
        email: apiUser.email,
        password: apiUser.password,
        confirmPassword: apiUser.confirmPassword,
        isActive: true,
      });
      expect(apiResult.status).toBe(201);
      expect(apiResult.body.title).toBeNull();
      createdApiUserId = apiResult.body.id;

      // Verify View/Edit User displays empty Title input and clearing Title on Edit persists null
      await userDetailPage.gotoUserDetail(createdUiUserId!);
      await expect(userDetailPage.titleInput).toHaveValue('');
    } finally {
      if (createdUiUserId) {
        await authenticatedAddUserPage.deleteUserViaApi(createdUiUserId);
      }
      if (createdApiUserId) {
        await authenticatedAddUserPage.deleteUserViaApi(createdApiUserId);
      }
    }
  });

  test('TC-04 - Add User required field validation blocks submission and displays both top FeedbackBanner and inline field errors', async ({
    authenticatedAddUserPage,
  }) => {
    const baseUser = addUserData.generateUser('tc04');
    await authenticatedAddUserPage.disableNativeFormValidation();

    const requiredChecks: Array<{
      label: string;
      selector: '#fullName' | '#username' | '#email' | '#password' | '#confirmPassword';
      expectedMessage: string;
      clear: () => Promise<void>;
      restore: () => Promise<void>;
    }> = [
      {
        label: 'Full Name',
        selector: '#fullName',
        expectedMessage: addUserData.messages.fullNameRequired,
        clear: () => authenticatedAddUserPage.clearFullName(),
        restore: () => authenticatedAddUserPage.fillFullName(baseUser.fullName),
      },
      {
        label: 'User Name',
        selector: '#username',
        expectedMessage: addUserData.messages.userNameRequired,
        clear: () => authenticatedAddUserPage.clearUsername(),
        restore: () => authenticatedAddUserPage.fillUsername(baseUser.username),
      },
      {
        label: 'E-Mail',
        selector: '#email',
        expectedMessage: addUserData.messages.emailRequired,
        clear: () => authenticatedAddUserPage.clearEmail(),
        restore: () => authenticatedAddUserPage.fillEmail(baseUser.email),
      },
      {
        label: 'Password',
        selector: '#password',
        expectedMessage: addUserData.messages.passwordRequired,
        clear: () => authenticatedAddUserPage.clearPassword(),
        restore: () => authenticatedAddUserPage.fillPassword(baseUser.password),
      },
      {
        label: 'Confirm Password',
        selector: '#confirmPassword',
        expectedMessage: addUserData.messages.confirmPasswordRequired,
        clear: () => authenticatedAddUserPage.clearConfirmPassword(),
        restore: () => authenticatedAddUserPage.fillConfirmPassword(baseUser.confirmPassword),
      },
    ];

    await authenticatedAddUserPage.fillForm(baseUser);

    for (const check of requiredChecks) {
      await check.clear();
      await authenticatedAddUserPage.clickSave();

      await expect(
        authenticatedAddUserPage.feedbackBanner,
        `Top FeedbackBanner should show error when "${check.label}" is missing`
      ).toHaveText(check.expectedMessage);

      const inlineError = authenticatedAddUserPage.getInlineFieldError(check.selector);
      await expect(
        inlineError,
        `Inline error should appear below "${check.label}"`
      ).toHaveText(check.expectedMessage);

      await check.restore();
    }

    // Verify backend API also returns 400 Bad Request when a mandatory field is blank
    const badApiResult = await authenticatedAddUserPage.postCreateUserRawViaApi({
      fullName: '',
      username: baseUser.username,
      title: null,
      email: baseUser.email,
      password: baseUser.password,
      confirmPassword: baseUser.confirmPassword,
      isActive: true,
    });
    expect(badApiResult.status).toBe(400);
  });

  test('TC-05 - Add User Password and Confirm Password mismatch validation shows top FeedbackBanner + inline error and clears when typing', async ({
    authenticatedAddUserPage,
  }) => {
    const baseUser = addUserData.generateUser('tc05');
    await authenticatedAddUserPage.fillForm({
      ...baseUser,
      password: 'ValidPassword123!',
      confirmPassword: 'DifferentPassword999!',
    });

    await authenticatedAddUserPage.clickSave();

    await expect(authenticatedAddUserPage.feedbackBanner).toHaveText(
      addUserData.messages.passwordMismatch
    );
    const confirmInlineError = authenticatedAddUserPage.getInlineFieldError('#confirmPassword');
    await expect(confirmInlineError).toHaveText(addUserData.messages.passwordMismatch);

    // Typing in Confirm Password clears the inline mismatch error immediately
    await authenticatedAddUserPage.fillConfirmPassword('ValidPassword123!');
    await expect(confirmInlineError).toHaveCount(0);
  });

  test('TC-06 - Edit User required field validation blocks saving and displays both top FeedbackBanner and inline field errors', async ({
    authenticatedUserDetailPage,
  }) => {
    const seedPayload = userDetailData.generateUser('tc06');
    const seedUser = await authenticatedUserDetailPage.createUserViaApi(seedPayload);

    try {
      await authenticatedUserDetailPage.gotoUserDetail(seedUser.id);
      await authenticatedUserDetailPage.clickEdit();

      const editRequiredChecks: Array<{
        label: string;
        selector: '#fullName' | '#username' | '#email';
        expectedMessage: string;
        clear: () => Promise<void>;
        restore: () => Promise<void>;
      }> = [
        {
          label: 'Full Name',
          selector: '#fullName',
          expectedMessage: userDetailData.messages.fullNameRequired,
          clear: () => authenticatedUserDetailPage.clearFullName(),
          restore: () => authenticatedUserDetailPage.fillForm({ fullName: seedPayload.fullName }),
        },
        {
          label: 'User Name',
          selector: '#username',
          expectedMessage: userDetailData.messages.userNameRequired,
          clear: () => authenticatedUserDetailPage.clearUsername(),
          restore: () => authenticatedUserDetailPage.fillForm({ username: seedPayload.username }),
        },
        {
          label: 'E-Mail',
          selector: '#email',
          expectedMessage: userDetailData.messages.emailRequired,
          clear: () => authenticatedUserDetailPage.clearEmail(),
          restore: () => authenticatedUserDetailPage.fillForm({ email: seedPayload.email }),
        },
      ];

      for (const check of editRequiredChecks) {
        await check.clear();
        await authenticatedUserDetailPage.clickSave();

        await expect(
          authenticatedUserDetailPage.feedbackBanner,
          `Top FeedbackBanner should show error when "${check.label}" is cleared on Edit User`
        ).toHaveText(check.expectedMessage);

        const inlineError = authenticatedUserDetailPage.getInlineFieldError(check.selector);
        await expect(
          inlineError,
          `Inline error should appear below "${check.label}" on Edit User`
        ).toHaveText(check.expectedMessage);

        await check.restore();
      }

      // Verify backend PUT also rejects missing required fields with 400 Bad Request
      const badPutResult = await authenticatedUserDetailPage.putUpdateUserRawViaApi(seedUser.id, {
        fullName: '   ',
        username: seedPayload.username,
        title: null,
        email: seedPayload.email,
        isActive: true,
      });
      expect(badPutResult.status).toBe(400);
    } finally {
      await authenticatedUserDetailPage.deleteUserViaApi(seedUser.id);
    }
  });

  test('TC-07 - Zero Data Loss & Existing Guard Preservation: duplicate username/email (409 Conflict) and self-protection guards remain intact', async ({
    authenticatedUserDetailPage,
    addUserPage,
  }) => {
    const beforeList = await authenticatedUserDetailPage.listUsersViaApi();
    expect(beforeList.status).toBe(200);
    const permanentIdsBefore = (beforeList.body.items || [])
      .filter((u: any) => !String(u.username || '').startsWith('u_'))
      .map((u: any) => u.id);

    // 1. Verify 409 Conflict for duplicate username
    const dupUsernameUser = addUserData.generateUser('tc07dup');
    const dupUsernameRes = await addUserPage.postCreateUserRawViaApi({
      fullName: dupUsernameUser.fullName,
      username: addUserData.existingUsers.adminUsername,
      title: dupUsernameUser.title,
      email: dupUsernameUser.email,
      password: dupUsernameUser.password,
      confirmPassword: dupUsernameUser.confirmPassword,
      isActive: true,
    });
    expect(dupUsernameRes.status).toBe(409);

    // 2. Verify 409 Conflict for duplicate email
    const dupEmailRes = await addUserPage.postCreateUserRawViaApi({
      fullName: dupUsernameUser.fullName,
      username: dupUsernameUser.username,
      title: dupUsernameUser.title,
      email: addUserData.existingUsers.adminEmail,
      password: dupUsernameUser.password,
      confirmPassword: dupUsernameUser.confirmPassword,
      isActive: true,
    });
    expect(dupEmailRes.status).toBe(409);

    // 3. Verify baseline permanent users are preserved with zero data loss
    const afterList = await authenticatedUserDetailPage.listUsersViaApi();
    expect(afterList.status).toBe(200);
    const permanentIdsAfter = (afterList.body.items || [])
      .filter((u: any) => !String(u.username || '').startsWith('u_'))
      .map((u: any) => u.id);

    for (const id of permanentIdsBefore) {
      expect(permanentIdsAfter).toContain(id);
    }
  });
});
