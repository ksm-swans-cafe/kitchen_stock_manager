export interface SearchBoxProps {
  apiUrl?: string;
  dataSource?: string[];
  minLength?: number;
  onSelect?: (value: string) => void;
};
