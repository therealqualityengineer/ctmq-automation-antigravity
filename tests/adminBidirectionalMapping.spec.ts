import { test, expect } from '../fixtures/customFixtures';
import { adminBidirectionalMappingData as data } from '../test-data/adminBidirectionalMappingData';

test.describe('CTMQ-72 - Admin General Settings Certification and Specialty Bidirectional Mapping', () => {

  // ==========================================
  // Layout & Table Structure Verification
  // ==========================================

  test('TC-01 - Verify presence and labeling of mapping columns in both Admin tables', async ({
    authenticatedCertificationsPage,
    authenticatedSpecialtiesPage,
  }) => {
    // 1. Verify Certifications table column headers
    await authenticatedCertificationsPage.gotoCertifications();
    await expect(authenticatedCertificationsPage.table).toBeVisible();
    await expect(authenticatedCertificationsPage.tableHeaders.first()).toBeVisible();
    const certHeaders = await authenticatedCertificationsPage.tableHeaders.allInnerTexts();
    const normalizedCertHeaders = certHeaders.map((h) => h.trim().toUpperCase());
    expect(normalizedCertHeaders).toContain('MAPPED SPECIALTIES');

    // 2. Verify Specialties table column headers
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await expect(authenticatedSpecialtiesPage.table).toBeVisible();
    await expect(authenticatedSpecialtiesPage.tableHeaders.first()).toBeVisible();
    const specHeaders = await authenticatedSpecialtiesPage.tableHeaders.allInnerTexts();
    const normalizedSpecHeaders = specHeaders.map((h) => h.trim().toUpperCase());
    expect(normalizedSpecHeaders).toContain('CERTIFICATION MAPPING');
  });

  // ==========================================
  // Bidirectional Reflection on Creation
  // ==========================================

  test('TC-02 - Verify reciprocal mapping reflection on Specialties table when mapping via Certification creation', async ({
    authenticatedCertificationsPage,
    authenticatedSpecialtiesPage,
  }) => {
    const testCert = data.generators.generateCertName('TC02-CERT');
    const targetSpecialty = data.baseEntities.cardiology;

    // 1. Create Certification mapped to Cardiology
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(testCert, [targetSpecialty], data.status.active);

    // Verify mapped specialty in Certifications table
    const mappedSpecialties = await authenticatedCertificationsPage.getMappedSpecialtiesFor(testCert);
    expect(mappedSpecialties).toContain(targetSpecialty);

    // 2. Navigate to Specialties table and verify Cardiology displays the new certification
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const certMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(targetSpecialty);
    expect(certMapping).toContain(testCert);
  });

  test('TC-03 - Verify reciprocal mapping reflection on Certifications table when mapping via Specialty creation', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const testSpec = data.generators.generateSpecName('TC03-SPEC');
    const targetCert = data.baseEntities.bls;

    // 1. Create Specialty mapped to BLS
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(testSpec, [targetCert], data.status.active);

    // Verify mapped certification in Specialties table
    const certMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(testSpec);
    expect(certMapping).toContain(targetCert);

    // 2. Navigate to Certifications table and verify BLS displays the new specialty
    await authenticatedCertificationsPage.gotoCertifications();
    const mappedSpecs = await authenticatedCertificationsPage.getMappedSpecialtiesFor(targetCert);
    expect(mappedSpecs).toContain(testSpec);
  });

  // ==========================================
  // Many-to-Many Multi-Mapping Scenarios
  // ==========================================

  test('TC-04 - Verify multi-mapping (Many-to-Many) display on Specialties view', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const testSpec = data.generators.generateSpecName('TC04-MULTI-SPEC');
    const certA = data.generators.generateCertName('TC04-CERTA');
    const certB = data.generators.generateCertName('TC04-CERTB');

    // 1. Create unique target specialty first
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(testSpec, [], data.status.active);

    // 2. Create two certifications both mapped to this specialty
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(certA, [testSpec], data.status.active);
    await authenticatedCertificationsPage.createCertification(certB, [testSpec], data.status.active);

    // 3. Inspect Specialties view: specialty should list both certifications
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const mapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(testSpec);
    expect(mapping).toContain(certA);
    expect(mapping).toContain(certB);
  });

  test('TC-05 - Verify multi-mapping (Many-to-Many) display on Certifications view', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const spec1 = data.generators.generateSpecName('TC05-SPEC1');
    const spec2 = data.generators.generateSpecName('TC05-SPEC2');
    const testCert = data.generators.generateCertName('TC05-MULTI-CERT');

    // 1. Create two target specialties
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(spec1, [], data.status.active);
    await authenticatedSpecialtiesPage.createSpecialty(spec2, [], data.status.active);

    // 2. Create certification mapped to both specialties
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(testCert, [spec1, spec2], data.status.active);

    // 3. Inspect Certifications view: certification should list both specialties
    const mappedSpecs = await authenticatedCertificationsPage.getMappedSpecialtiesFor(testCert);
    expect(mappedSpecs).toContain(spec1);
    expect(mappedSpecs).toContain(spec2);
  });

  // ==========================================
  // Bidirectional Synchronization on Edit
  // ==========================================

  test('TC-06 - Verify bidirectional synchronization when updating / editing Certification mappings', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const specOrig = data.generators.generateSpecName('TC06-ORIG');
    const specNew = data.generators.generateSpecName('TC06-NEW');
    const testCert = data.generators.generateCertName('TC06-CERT');

    // 1. Create specialties
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(specOrig, [], data.status.active);
    await authenticatedSpecialtiesPage.createSpecialty(specNew, [], data.status.active);

    // 2. Create certification mapped initially to specOrig
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(testCert, [specOrig], data.status.active);

    // 3. Edit certification: deselect specOrig and select specNew
    await authenticatedCertificationsPage.openEditCertModal(testCert);
    await authenticatedCertificationsPage.deselectSpecialty(specOrig);
    await authenticatedCertificationsPage.selectSpecialty(specNew);
    await authenticatedCertificationsPage.saveEditChanges();

    // Verify Certifications view reflects updated mapping
    const updatedCertMapping = await authenticatedCertificationsPage.getMappedSpecialtiesFor(testCert);
    expect(updatedCertMapping).toContain(specNew);
    expect(updatedCertMapping).not.toContain(specOrig);

    // 4. Verify Specialties view: specNew has testCert, specOrig does not
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const newSpecMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(specNew);
    expect(newSpecMapping).toContain(testCert);

    const origSpecMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(specOrig);
    expect(origSpecMapping).not.toContain(testCert);
  });

  test('TC-07 - Verify bidirectional synchronization when updating / editing Specialty mappings', async ({
    authenticatedCertificationsPage,
    authenticatedSpecialtiesPage,
  }) => {
    const certOrig = data.generators.generateCertName('TC07-CERT-ORIG');
    const certNew = data.generators.generateCertName('TC07-CERT-NEW');
    const testSpec = data.generators.generateSpecName('TC07-SPEC');

    // 1. Create certifications
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(certOrig, [], data.status.active);
    await authenticatedCertificationsPage.createCertification(certNew, [], data.status.active);

    // 2. Create specialty mapped initially to certOrig
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(testSpec, [certOrig], data.status.active);

    // 3. Edit specialty: deselect certOrig and select certNew
    await authenticatedSpecialtiesPage.openEditSpecialtyModal(testSpec);
    await authenticatedSpecialtiesPage.deselectCertification(certOrig);
    await authenticatedSpecialtiesPage.selectCertification(certNew);
    await authenticatedSpecialtiesPage.saveEditChanges();

    // Verify Specialties view reflects updated mapping
    const updatedSpecMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(testSpec);
    expect(updatedSpecMapping).toContain(certNew);
    expect(updatedSpecMapping).not.toContain(certOrig);

    // 4. Verify Certifications view: certNew has testSpec, certOrig does not
    await authenticatedCertificationsPage.gotoCertifications();
    const newCertMapping = await authenticatedCertificationsPage.getMappedSpecialtiesFor(certNew);
    expect(newCertMapping).toContain(testSpec);

    const origCertMapping = await authenticatedCertificationsPage.getMappedSpecialtiesFor(certOrig);
    expect(origCertMapping).not.toContain(testSpec);
  });

  // ==========================================
  // Fallback Placeholder & Unmapping Scenarios
  // ==========================================

  test('TC-08 - Verify unmapped records display fallback placeholder hyphen ("-")', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const unmappedSpec = data.generators.generateSpecName('TC08-UNMAPPED-SPEC');
    const unmappedCert = data.generators.generateCertName('TC08-UNMAPPED-CERT');

    // 1. Create standalone unmapped specialty
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(unmappedSpec, [], data.status.active);
    const specMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(unmappedSpec);
    expect(specMapping).toBe(data.fallbackPlaceholder);

    // 2. Create standalone unmapped certification
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(unmappedCert, [], data.status.active);
    const certMapping = await authenticatedCertificationsPage.getMappedSpecialtiesFor(unmappedCert);
    expect(certMapping).toBe(data.fallbackPlaceholder);
  });

  test('TC-09 - Verify dissociation/unmapping resets reciprocal view to fallback hyphen ("-")', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const soloSpec = data.generators.generateSpecName('TC09-SOLO-SPEC');
    const soloCert = data.generators.generateCertName('TC09-SOLO-CERT');

    // 1. Create specialty and mapped certification
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(soloSpec, [], data.status.active);

    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(soloCert, [soloSpec], data.status.active);

    // Verify initial mapping on Specialties table
    await authenticatedSpecialtiesPage.gotoSpecialties();
    expect(await authenticatedSpecialtiesPage.getCertificationMappingFor(soloSpec)).toContain(soloCert);

    // 2. Edit certification and unmap the specialty
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.openEditCertModal(soloCert);
    await authenticatedCertificationsPage.deselectSpecialty(soloSpec);
    await authenticatedCertificationsPage.saveEditChanges();

    // 3. Verify reciprocal view resets cleanly to hyphen '-'
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const updatedMapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(soloSpec);
    expect(updatedMapping).toBe(data.fallbackPlaceholder);
  });

  // ==========================================
  // Persistence & Lifecycle States
  // ==========================================

  test('TC-10 - Verify mapping persistence across browser reload and re-navigation', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const persistSpec = data.generators.generateSpecName('TC10-PERSIST-SPEC');
    const persistCert = data.generators.generateCertName('TC10-PERSIST-CERT');

    // 1. Create mapping
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(persistSpec, [], data.status.active);

    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(persistCert, [persistSpec], data.status.active);

    // 2. Hard reload on Certifications page and verify persistence
    await authenticatedCertificationsPage.reloadPage();
    expect(await authenticatedCertificationsPage.getMappedSpecialtiesFor(persistCert)).toContain(persistSpec);

    // 3. Re-navigate to Specialties page, reload, and verify persistence
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.reloadPage();
    expect(await authenticatedSpecialtiesPage.getCertificationMappingFor(persistSpec)).toContain(persistCert);
  });

  test('TC-11 - Verify inactive Specialty/Certification mapping handling in data tables', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const inactiveSpec = data.generators.generateSpecName('TC11-INACTIVE-SPEC');
    const inactiveCert = data.generators.generateCertName('TC11-INACTIVE-CERT');

    // 1. Create specialty
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(inactiveSpec, [], data.status.active);

    // 2. Create certification mapped to specialty with Inactive status
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(inactiveCert, [inactiveSpec], data.status.inactive);

    // Verify Certifications view displays Inactive pill and mapped specialty
    const statusPill = await authenticatedCertificationsPage.getStatusPillFor(inactiveCert);
    await expect(statusPill).toHaveText(data.status.inactive);
    expect(await authenticatedCertificationsPage.getMappedSpecialtiesFor(inactiveCert)).toContain(inactiveSpec);

    // 3. Verify Specialties table displays mapped certification without error
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const mapping = await authenticatedSpecialtiesPage.getCertificationMappingFor(inactiveSpec);
    expect(mapping).toContain(inactiveCert);
  });

  // ==========================================
  // Security & Route Protection
  // ==========================================

  test('TC-12 - Verify unauthenticated access protection for Admin mapping pages', async ({
    page,
    specialtiesPage,
    certificationsPage,
  }) => {
    // 1. Attempt unauthenticated navigation to /admin/certifications
    await certificationsPage.gotoCertifications();
    await expect(page).toHaveURL(new RegExp(data.routes.login));

    // 2. Attempt unauthenticated navigation to /admin/specialties
    await specialtiesPage.gotoSpecialties();
    await expect(page).toHaveURL(new RegExp(data.routes.login));
  });

  // ==========================================
  // Boundary, Search & State Concurrency
  // ==========================================

  test('TC-13 - Verify UI handling of long entity names in mapping columns', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const longCert = data.generators.generateLongName('TC13-LONG-CERT');
    const testSpec = data.generators.generateSpecName('TC13-BOUND-SPEC');

    // 1. Create specialty
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(testSpec, [], data.status.active);

    // 2. Create certification with long name mapped to specialty
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(longCert, [testSpec], data.status.active);

    // 3. Inspect Specialties view row and verify mapping cell renders without overflow failure
    await authenticatedSpecialtiesPage.gotoSpecialties();
    const mappingLoc = await authenticatedSpecialtiesPage.getCertificationMappingLocatorFor(testSpec);
    await expect(mappingLoc).toBeVisible();
    const mappingText = await mappingLoc.innerText();
    expect(mappingText).toContain(longCert);
  });

  test('TC-14 - Verify search and filtering compatibility with mapped values', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const searchCert = data.generators.generateCertName('TC14-SEARCH-CERT');
    const searchSpec = data.generators.generateSpecName('TC14-SEARCH-SPEC');

    // 1. Create specialty
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(searchSpec, [], data.status.active);

    // 2. Create certification mapped to specialty
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(searchCert, [searchSpec], data.status.active);

    // 3. On Certifications page, search by mapped specialty name
    await authenticatedCertificationsPage.search(searchSpec);
    const certRow = authenticatedCertificationsPage.getCertRow(searchCert);
    await expect(certRow).toBeVisible();
    await authenticatedCertificationsPage.clearSearch();

    // 4. On Specialties page, search by mapped certification name
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.search(searchCert);
    const specRow = authenticatedSpecialtiesPage.getSpecialtyRow(searchSpec);
    await expect(specRow).toBeVisible();
    await authenticatedSpecialtiesPage.clearSearch();
  });

  test('TC-15 - Verify rapid sequential mapping updates maintain state consistency', async ({
    authenticatedSpecialtiesPage,
    authenticatedCertificationsPage,
  }) => {
    const rapidSpec1 = data.generators.generateSpecName('TC15-RAPID-SPEC1');
    const rapidSpec2 = data.generators.generateSpecName('TC15-RAPID-SPEC2');
    const rapidCert = data.generators.generateCertName('TC15-RAPID-CERT');

    // 1. Create two specialties
    await authenticatedSpecialtiesPage.gotoSpecialties();
    await authenticatedSpecialtiesPage.createSpecialty(rapidSpec1, [], data.status.active);
    await authenticatedSpecialtiesPage.createSpecialty(rapidSpec2, [], data.status.active);

    // 2. Create cert mapped to rapidSpec1
    await authenticatedCertificationsPage.gotoCertifications();
    await authenticatedCertificationsPage.createCertification(rapidCert, [rapidSpec1], data.status.active);

    // 3. Edit cert: add rapidSpec2
    await authenticatedCertificationsPage.openEditCertModal(rapidCert);
    await authenticatedCertificationsPage.selectSpecialty(rapidSpec2);
    await authenticatedCertificationsPage.saveEditChanges();

    // 4. Edit cert again: remove rapidSpec1
    await authenticatedCertificationsPage.openEditCertModal(rapidCert);
    await authenticatedCertificationsPage.deselectSpecialty(rapidSpec1);
    await authenticatedCertificationsPage.saveEditChanges();

    // 5. Final state verification across both pages
    const finalCertMapping = await authenticatedCertificationsPage.getMappedSpecialtiesFor(rapidCert);
    expect(finalCertMapping).toContain(rapidSpec2);
    expect(finalCertMapping).not.toContain(rapidSpec1);

    await authenticatedSpecialtiesPage.gotoSpecialties();
    expect(await authenticatedSpecialtiesPage.getCertificationMappingFor(rapidSpec2)).toContain(rapidCert);
    expect(await authenticatedSpecialtiesPage.getCertificationMappingFor(rapidSpec1)).not.toContain(rapidCert);
  });
});
