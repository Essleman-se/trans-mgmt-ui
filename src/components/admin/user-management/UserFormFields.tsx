export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export type UserFormMode = 'create' | 'edit';

interface UserFormFieldsProps {
  mode: UserFormMode;
  values: UserFormValues;
  onChange: (field: keyof UserFormValues, value: string) => void;
  onEmailBlur?: () => void;
  idPrefix?: string;
  status?: string;
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

const UserFormFields = ({
  mode,
  values,
  onChange,
  onEmailBlur,
  idPrefix = 'user-form',
  status,
}: UserFormFieldsProps) => {
  const field = (name: keyof UserFormValues) => `${idPrefix}-${name}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={field('firstName')} className="mb-1 block text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            type="text"
            id={field('firstName')}
            name="firstName"
            value={values.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={field('lastName')} className="mb-1 block text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            type="text"
            id={field('lastName')}
            name="lastName"
            value={values.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            required
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={field('email')} className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          id={field('email')}
          name="email"
          value={values.email}
          onChange={(e) => onChange('email', e.target.value)}
          onBlur={onEmailBlur}
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={field('phone')} className="mb-1 block text-sm font-medium text-slate-700">
          Phone
        </label>
        <input
          type="tel"
          id={field('phone')}
          name="phone"
          value={values.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          required
          autoComplete="tel"
          className={inputClass}
          placeholder="+1 555 123 4567"
        />
      </div>

      {mode === 'create' && (
        <div>
          <label htmlFor={field('password')} className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            id={field('password')}
            name="password"
            value={values.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
        </div>
      )}

      {mode === 'edit' && status !== undefined && (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {status}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserFormFields;

export const emptyUserFormValues = (): UserFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
});

export const userToFormValues = (user: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): UserFormValues => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  password: '',
});
