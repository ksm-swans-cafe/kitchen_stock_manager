export interface Employee {
  employee_id: string;
  employee_username: string;
  employee_firstname: string;
  employee_lastname: string;
  employee_pin: number;
  employee_role?: string;
  employee_roles?: string[];
}
