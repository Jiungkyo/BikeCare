export interface Motor {
  motor_id?: number;
  nama_motor: string;
  tahun_motor?: number;
}

export interface Odometer {
  odometer_id?: number;
  motor_id: number;
  km_terakhir?: number;
  tanggal_update?: string;
}

export interface Perawatan {
  perawatan_id?: number;
  motor_id: number;
  jenis_perawatan: string;
  tanggal_terakhir?: string;
  interval_km?: number;
  interval_hari?: number;
}

export interface Reminder {
  reminder_id?: number;
  perawatan_id: number;
  tanggal_reminder?: string;
  status: 'Pending' | 'Done';
}

export interface HistoryPerawatan {
  history_id?: number;
  perawatan_id: number;
  tanggal_perawatan?: string;
  catatan?: string;
}

export interface MaintenanceType {
  name: string;
  defaultIntervalKm: number;
  defaultIntervalDays: number;
  description: string;
}