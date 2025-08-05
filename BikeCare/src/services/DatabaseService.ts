import SQLite from 'react-native-sqlite-storage';
import {
  Motor,
  Odometer,
  Perawatan,
  Reminder,
  HistoryPerawatan,
  MaintenanceType,
} from '../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'BikeCare.db';
const database_version = '1.0';
const database_displayname = 'BikeCare SQLite Database';
const database_size = 200000;

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDB(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: database_name,
        location: 'default',
      });
      console.log('Database opened successfully');
      await this.createTables();
      await this.insertDefaultMaintenanceTypes();
    } catch (error) {
      console.log('Error opening database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const tables = [
      `CREATE TABLE IF NOT EXISTS Motor (
        motor_id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_motor TEXT NOT NULL,
        tahun_motor INTEGER
      )`,
      `CREATE TABLE IF NOT EXISTS Odometer (
        odometer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        motor_id INTEGER NOT NULL,
        km_terakhir INTEGER,
        tanggal_update DATE,
        FOREIGN KEY (motor_id) REFERENCES Motor(motor_id)
      )`,
      `CREATE TABLE IF NOT EXISTS Perawatan (
        perawatan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        motor_id INTEGER NOT NULL,
        jenis_perawatan TEXT NOT NULL,
        tanggal_terakhir DATE,
        interval_km INTEGER,
        interval_hari INTEGER,
        FOREIGN KEY (motor_id) REFERENCES Motor(motor_id)
      )`,
      `CREATE TABLE IF NOT EXISTS Reminder (
        reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
        perawatan_id INTEGER NOT NULL,
        tanggal_reminder DATE,
        status TEXT CHECK(status IN ('Pending', 'Done')),
        FOREIGN KEY (perawatan_id) REFERENCES Perawatan(perawatan_id)
      )`,
      `CREATE TABLE IF NOT EXISTS History_Perawatan (
        history_id INTEGER PRIMARY KEY AUTOINCREMENT,
        perawatan_id INTEGER NOT NULL,
        tanggal_perawatan DATE,
        catatan TEXT,
        FOREIGN KEY (perawatan_id) REFERENCES Perawatan(perawatan_id)
      )`,
    ];

    for (const table of tables) {
      await this.db.executeSql(table);
    }
    console.log('All tables created successfully');
  }

  private async insertDefaultMaintenanceTypes(): Promise<void> {
    if (!this.db) return;

    // Check if we have any motors, if yes, add default maintenance types
    const result = await this.db.executeSql('SELECT COUNT(*) as count FROM Motor');
    if (result[0].rows.item(0).count === 0) {
      return; // No motors yet, don't add maintenance types
    }

    const defaultTypes: MaintenanceType[] = [
      {
        name: 'Ganti Oli Mesin',
        defaultIntervalKm: 3000,
        defaultIntervalDays: 90,
        description: 'Pergantian oli mesin secara berkala',
      },
      {
        name: 'Ganti Oli Gear',
        defaultIntervalKm: 10000,
        defaultIntervalDays: 180,
        description: 'Pergantian oli transmisi/gear',
      },
      {
        name: 'Cek Ban',
        defaultIntervalKm: 5000,
        defaultIntervalDays: 60,
        description: 'Pengecekan tekanan dan kondisi ban',
      },
      {
        name: 'Ganti Filter Udara',
        defaultIntervalKm: 5000,
        defaultIntervalDays: 120,
        description: 'Pergantian filter udara',
      },
      {
        name: 'Cek Rem',
        defaultIntervalKm: 8000,
        defaultIntervalDays: 120,
        description: 'Pengecekan kampas dan sistem rem',
      },
    ];

    // This will be called when motor is first added
  }

  // Motor CRUD operations
  async addMotor(motor: Motor): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      'INSERT INTO Motor (nama_motor, tahun_motor) VALUES (?, ?)',
      [motor.nama_motor, motor.tahun_motor || null],
    );
    
    const motorId = result[0].insertId;
    
    // Add default maintenance types for this motor
    await this.addDefaultMaintenanceForMotor(motorId);
    
    return motorId;
  }

  private async addDefaultMaintenanceForMotor(motorId: number): Promise<void> {
    if (!this.db) return;

    const defaultTypes: MaintenanceType[] = [
      {
        name: 'Ganti Oli Mesin',
        defaultIntervalKm: 3000,
        defaultIntervalDays: 90,
        description: 'Pergantian oli mesin secara berkala',
      },
      {
        name: 'Ganti Oli Gear',
        defaultIntervalKm: 10000,
        defaultIntervalDays: 180,
        description: 'Pergantian oli transmisi/gear',
      },
      {
        name: 'Cek Ban',
        defaultIntervalKm: 5000,
        defaultIntervalDays: 60,
        description: 'Pengecekan tekanan dan kondisi ban',
      },
      {
        name: 'Ganti Filter Udara',
        defaultIntervalKm: 5000,
        defaultIntervalDays: 120,
        description: 'Pergantian filter udara',
      },
      {
        name: 'Cek Rem',
        defaultIntervalKm: 8000,
        defaultIntervalDays: 120,
        description: 'Pengecekan kampas dan sistem rem',
      },
    ];

    for (const type of defaultTypes) {
      await this.db.executeSql(
        'INSERT INTO Perawatan (motor_id, jenis_perawatan, interval_km, interval_hari) VALUES (?, ?, ?, ?)',
        [motorId, type.name, type.defaultIntervalKm, type.defaultIntervalDays],
      );
    }
  }

  async getMotors(): Promise<Motor[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql('SELECT * FROM Motor');
    const motors: Motor[] = [];
    
    for (let i = 0; i < result[0].rows.length; i++) {
      motors.push(result[0].rows.item(i));
    }
    
    return motors;
  }

  async getMotorById(motorId: number): Promise<Motor | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      'SELECT * FROM Motor WHERE motor_id = ?',
      [motorId],
    );
    
    if (result[0].rows.length > 0) {
      return result[0].rows.item(0);
    }
    
    return null;
  }

  async deleteMotor(motorId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete related records first
    await this.db.executeSql('DELETE FROM History_Perawatan WHERE perawatan_id IN (SELECT perawatan_id FROM Perawatan WHERE motor_id = ?)', [motorId]);
    await this.db.executeSql('DELETE FROM Reminder WHERE perawatan_id IN (SELECT perawatan_id FROM Perawatan WHERE motor_id = ?)', [motorId]);
    await this.db.executeSql('DELETE FROM Perawatan WHERE motor_id = ?', [motorId]);
    await this.db.executeSql('DELETE FROM Odometer WHERE motor_id = ?', [motorId]);
    await this.db.executeSql('DELETE FROM Motor WHERE motor_id = ?', [motorId]);
  }

  // Odometer operations
  async updateOdometer(odometer: Odometer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if odometer record exists for this motor
    const existing = await this.db.executeSql(
      'SELECT * FROM Odometer WHERE motor_id = ?',
      [odometer.motor_id],
    );

    const currentDate = new Date().toISOString().split('T')[0];

    if (existing[0].rows.length > 0) {
      // Update existing record
      await this.db.executeSql(
        'UPDATE Odometer SET km_terakhir = ?, tanggal_update = ? WHERE motor_id = ?',
        [odometer.km_terakhir, currentDate, odometer.motor_id],
      );
    } else {
      // Insert new record
      await this.db.executeSql(
        'INSERT INTO Odometer (motor_id, km_terakhir, tanggal_update) VALUES (?, ?, ?)',
        [odometer.motor_id, odometer.km_terakhir, currentDate],
      );
    }
  }

  async getOdometerByMotorId(motorId: number): Promise<Odometer | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      'SELECT * FROM Odometer WHERE motor_id = ?',
      [motorId],
    );
    
    if (result[0].rows.length > 0) {
      return result[0].rows.item(0);
    }
    
    return null;
  }

  // Perawatan operations
  async getPerawatanByMotorId(motorId: number): Promise<Perawatan[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      'SELECT * FROM Perawatan WHERE motor_id = ?',
      [motorId],
    );
    
    const perawatan: Perawatan[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      perawatan.push(result[0].rows.item(i));
    }
    
    return perawatan;
  }

  async updatePerawatan(perawatan: Perawatan): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'UPDATE Perawatan SET tanggal_terakhir = ?, interval_km = ?, interval_hari = ? WHERE perawatan_id = ?',
      [
        perawatan.tanggal_terakhir,
        perawatan.interval_km,
        perawatan.interval_hari,
        perawatan.perawatan_id,
      ],
    );
  }

  // History operations
  async addHistoryPerawatan(history: HistoryPerawatan): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'INSERT INTO History_Perawatan (perawatan_id, tanggal_perawatan, catatan) VALUES (?, ?, ?)',
      [history.perawatan_id, history.tanggal_perawatan, history.catatan || ''],
    );
  }

  async getHistoryByPerawatanId(perawatanId: number): Promise<HistoryPerawatan[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(
      'SELECT * FROM History_Perawatan WHERE perawatan_id = ? ORDER BY tanggal_perawatan DESC',
      [perawatanId],
    );
    
    const history: HistoryPerawatan[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      history.push(result[0].rows.item(i));
    }
    
    return history;
  }

  async getAllHistory(): Promise<(HistoryPerawatan & { jenis_perawatan: string; nama_motor: string })[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.executeSql(`
      SELECT h.*, p.jenis_perawatan, m.nama_motor 
      FROM History_Perawatan h
      JOIN Perawatan p ON h.perawatan_id = p.perawatan_id
      JOIN Motor m ON p.motor_id = m.motor_id
      ORDER BY h.tanggal_perawatan DESC
    `);
    
    const history: (HistoryPerawatan & { jenis_perawatan: string; nama_motor: string })[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      history.push(result[0].rows.item(i));
    }
    
    return history;
  }

  // Reminder operations
  async getUpcomingReminders(motorId?: number): Promise<(Reminder & { jenis_perawatan: string; nama_motor: string })[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT r.*, p.jenis_perawatan, m.nama_motor, p.motor_id
      FROM Reminder r
      JOIN Perawatan p ON r.perawatan_id = p.perawatan_id
      JOIN Motor m ON p.motor_id = m.motor_id
      WHERE r.status = 'Pending'
    `;
    
    const params = [];
    if (motorId) {
      query += ' AND p.motor_id = ?';
      params.push(motorId);
    }
    
    query += ' ORDER BY r.tanggal_reminder ASC';

    const result = await this.db.executeSql(query, params);
    
    const reminders: (Reminder & { jenis_perawatan: string; nama_motor: string })[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      reminders.push(result[0].rows.item(i));
    }
    
    return reminders;
  }

  async updateReminderStatus(reminderId: number, status: 'Pending' | 'Done'): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.executeSql(
      'UPDATE Reminder SET status = ? WHERE reminder_id = ?',
      [status, reminderId],
    );
  }

  // Calculate and create reminders based on maintenance schedule
  async calculateAndCreateReminders(motorId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const odometer = await this.getOdometerByMotorId(motorId);
    const perawatan = await this.getPerawatanByMotorId(motorId);
    
    if (!odometer || !perawatan.length) return;

    const currentKm = odometer.km_terakhir || 0;
    const currentDate = new Date();

    for (const item of perawatan) {
      // Delete existing pending reminders for this maintenance
      await this.db.executeSql(
        'DELETE FROM Reminder WHERE perawatan_id = ? AND status = "Pending"',
        [item.perawatan_id],
      );

      let nextReminderDate: Date | null = null;

      // Calculate based on last maintenance date
      if (item.tanggal_terakhir && item.interval_hari) {
        const lastDate = new Date(item.tanggal_terakhir);
        nextReminderDate = new Date(lastDate.getTime() + (item.interval_hari * 24 * 60 * 60 * 1000));
      }

      // Calculate based on kilometers
      if (item.interval_km) {
        const kmBasedDate = new Date();
        // Estimate date based on average daily usage (assume 20km per day)
        const remainingKm = item.interval_km - (currentKm - (item.tanggal_terakhir ? 0 : 0));
        const estimatedDays = Math.max(1, Math.floor(remainingKm / 20));
        const kmBasedReminderDate = new Date(currentDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));

        if (!nextReminderDate || kmBasedReminderDate < nextReminderDate) {
          nextReminderDate = kmBasedReminderDate;
        }
      }

      // If no last maintenance date, use current date plus interval
      if (!nextReminderDate) {
        nextReminderDate = new Date();
        if (item.interval_hari) {
          nextReminderDate.setDate(nextReminderDate.getDate() + item.interval_hari);
        } else {
          nextReminderDate.setDate(nextReminderDate.getDate() + 30); // Default 30 days
        }
      }

      // Create reminder
      await this.db.executeSql(
        'INSERT INTO Reminder (perawatan_id, tanggal_reminder, status) VALUES (?, ?, ?)',
        [item.perawatan_id, nextReminderDate.toISOString().split('T')[0], 'Pending'],
      );
    }
  }

  async performMaintenance(perawatanId: number, catatan: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const currentDate = new Date().toISOString().split('T')[0];

    // Update perawatan with current date
    await this.db.executeSql(
      'UPDATE Perawatan SET tanggal_terakhir = ? WHERE perawatan_id = ?',
      [currentDate, perawatanId],
    );

    // Add to history
    await this.addHistoryPerawatan({
      perawatan_id: perawatanId,
      tanggal_perawatan: currentDate,
      catatan,
    });

    // Mark related reminders as done
    await this.db.executeSql(
      'UPDATE Reminder SET status = "Done" WHERE perawatan_id = ? AND status = "Pending"',
      [perawatanId],
    );

    // Get motor ID and recalculate reminders
    const result = await this.db.executeSql(
      'SELECT motor_id FROM Perawatan WHERE perawatan_id = ?',
      [perawatanId],
    );
    
    if (result[0].rows.length > 0) {
      const motorId = result[0].rows.item(0).motor_id;
      await this.calculateAndCreateReminders(motorId);
    }
  }

  async resetAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = ['History_Perawatan', 'Reminder', 'Perawatan', 'Odometer', 'Motor'];
    
    for (const table of tables) {
      await this.db.executeSql(`DELETE FROM ${table}`);
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Database closed');
    }
  }
}

export default new DatabaseService();