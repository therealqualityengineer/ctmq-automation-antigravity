# Application Knowledge Base & Domain Blueprint

This living document captures the application domain model, core workflows, entity lifecycles, and business rules across the CTMQ healthcare/staffing management system.

> [!IMPORTANT]
> **Continuous Learning Rule**:
> - **PlanAgent**: Must read this file before generating test scenarios to understand entity relationships, business constraints, and cross-feature impacts. At the end of planning, update this document with any newly discovered business rules.
> - **ScriptAgent**: Must consult this file to verify expected workflows, validation states, and API payload expectations.

---

## 1. System Overview & Core User Roles
CTMQ is a healthcare staffing and facility management platform managing temps (healthcare workers/contractors), clients (facilities/hospitals), admin settings, shifts, orders, and system users.

### User Roles & Access Hierarchy
- **Admin / QA Engineer (`qaengineer`)**: Full access to all modules including `/admin` (System configuration, Status Options, Shifts, Order Types, Certifications, Specialties, General Settings) and User Management (`/users`).
- **Staffing Coordinator / Recruiter**: Manages Temps (`/temps`), Clients (`/clients`), and Shifts/Orders.
- **Client Representative**: Access restricted to facility-specific shift requests and approved temps.
- **Temp / Contractor**: Profile, certifications, and assigned shifts.

---

## 2. Application Route Map & Modules

| Module | Route | Key Entities & Capabilities | Associated Page Objects |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/login` | Username/password login, session cookie storage (`.auth_cookies.json`), redirect to dashboard | `LoginPage.ts` |
| **Global Shell** | `/*` | Navigation drawer, top bar, user profile, logout, responsive sidebar collapse | `NavigationPage.ts`, `LayoutPage.ts` |
| **Temps (Workers)** | `/temps`<br>`/temps/add`<br>`/temps/:id` | Healthcare worker profiles, contact info, SSN/tax info, status tracking, active certifications, specialties | `TempPage.ts`<br>`AddTempPage.ts`<br>`TempDetailPage.ts`<br>`BaseTempFormPage.ts` |
| **Clients (Facilities)**| `/clients`<br>`/clients/add`<br>`/clients/:id` | Healthcare facilities, billing addresses, contact persons, contracted specialties, active status | `ClientPage.ts`<br>`ClientDetailPage.ts` |
| **User Manager** | `/users`<br>`/users/add`<br>`/users/:id` | System accounts, credentials, role assignments, activation/deactivation | `UserManagerPage.ts`<br>`AddUserPage.ts`<br>`UserDetailPage.ts` |
| **Admin Settings** | `/admin` | Hub for administrative masters & configurations | `AdminPage.ts` |
| **Admin Masters** | `/admin/status-options`<br>`/admin/certifications`<br>`/admin/specialties`<br>`/admin/shifts`<br>`/admin/order-types` | Configurable master lookup tables: Status codes for Temps/Clients, certification types, medical specialties, shift schedules, and order categorization | `StatusOptionsPage.ts`<br>`CertificationsPage.ts`<br>`SpecialtiesPage.ts`<br>`ShiftsPage.ts`<br>`OrderTypesPage.ts` |

---

## 3. Core Business Rules & Entity Lifecycles

### A. Temps Lifecycle & Validation
- **Required Fields**: First Name, Last Name, Email, Phone, Primary Specialty.
- **Unique Constraints**: Email and SSN/Tax ID must be unique across all temps.
- **Status Lifecycle**: `Applicant` $\rightarrow$ `Interviewing` $\rightarrow$ `Active` $\rightarrow$ `On Assignment` $\rightarrow$ `Inactive` $\rightarrow$ `Terminated`.
- **Certifications & Specialties**: A temp cannot be assigned to specialized clinical shifts without active, non-expired certifications matching the shift requirements.

### B. Clients Lifecycle & Validation
- **Required Fields**: Facility Name, Billing Address, Primary Contact Name, Phone, and Email.
- **Client Status**: `Lead` $\rightarrow$ `Active Contract` $\rightarrow$ `On Hold` $\rightarrow$ `Terminated`. Only `Active Contract` clients can request shifts.

### C. Admin Master Configurations (Status Options, Certifications, Specialties)
- **Status Options**: Can be tagged specifically for `Client` or `Temp`. Creating a duplicate status code/name within the same target type is blocked with a validation toast/error dialog.
- **Deletions / Cascades**: An admin option (e.g., Specialty or Certification) that is actively associated with existing Temps cannot be hard-deleted; it triggers a dependency warning or is soft-deactivated.
- **Certifications & Specialties Bidirectional Mapping**:
  - Certifications (`/admin/certifications`) and Specialties (`/admin/specialties`) maintain a Many-to-Many bidirectional correlation.
  - Mapped specialties configured on a certification record must immediately reflect under `MAPPED SPECIALTIES` in `/admin/certifications` and reciprocally under `CERTIFICATION MAPPING` in `/admin/specialties`.
  - When no mapping exists, both tables display a fallback hyphen (`-`).
  - Association and dissociation (unmapping) operations on either view must remain synchronized across both configuration tables and backend persistence.

---

## 4. Test Data & State Dependencies
- **Authentication**: All authenticated tests use `.auth_cookies.json` seeded via custom fixtures or probe scripts to bypass repetitive manual UI login.
- **Shared Form Components**: Temp Creation (`AddTempPage`) and Temp Details (`TempDetailPage`) share core form controls inherited from `BaseTempFormPage`.
- **Dynamic Entities**: Generated test entities (temps, clients, custom statuses) must use unique timestamped or random suffixes (`utils/`) to prevent conflict during parallel or consecutive test execution.
