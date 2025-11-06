export interface StatCardData {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  bgColor: string;
}

export interface DealData {
  id: string;
  productName: string;
  productImage: string;
  location: string;
  dateTime: string;
  piece: number;
  amount: number;
  status: 'Delivered' | 'Pending' | 'Cancelled';
}

export interface ChartDataPoint {
  name: string;
  value: number;
}