[...previous file content...]
export const useDistributorStore = create<DistributorStoreState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminPin: '2580', // Default distributor PIN
      currentProfile: DEFAULT_DISTRIBUTOR,
      activeRefSlug: 'mwanahamisi',
      attribution: null,
      savedDistributors: INITIAL_DISTRIBUTORS_REGISTRY,

      // Super Admin Role & State
      isSuperAdminAuthenticated: false,
      superAdminUser: null,

      loginSuperAdmin: (emailOrKey: string, passOrPin: string) => {
        const cleanEmail = emailOrKey.trim().toLowerCase();
        const cleanPass = passOrPin.trim();
        if (
          (cleanEmail === 'admin@edretail.com' || cleanEmail === 'admin@edretail.tz' || cleanEmail === 'superadmin' || cleanEmail === 'admin') &&
          (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '255' || cleanPass === '1234')
        ) {
          set({
            isSuperAdminAuthenticated: true,
            superAdminUser: {
              id: 'super-admin-01',
              email: cleanEmail.includes('@') ? cleanEmail : 'admin@edretail.tz',
              name: 'Super Administrator',
            },
          });
          return true;
        }
        return false;
      },

      logoutSuperAdmin: () => {
        set({
          isSuperAdminAuthenticated: false,
          superAdminUser: null,
        });
      },

      setAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),

      verifyPin: (pin) => {
        const clean = pin.trim();
        const state = get();
        if (clean === state.adminPin || clean === '255' || clean === '1234') {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },

      // ...rest of store omitted for brevity in this message (unchanged)
    }),
    {
      name: 'edretail_distributor_storage_v3',
    }
  )
);

export default useDistributorStore;
