export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Pharmacist' | 'Intern';
  branch: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar: string;
}