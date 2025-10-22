import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import * as ExcelJS from 'exceljs';

import { Participation } from '../participations/entities/participation.entity';
import { ExportQueryDto } from './dto/export-query.dto';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
  ) {}

  /**
   * Exportar participaciones a Excel
   */
  async exportParticipationsToExcel(filters: ExportQueryDto): Promise<Buffer> {
    const participations = await this.getParticipationsWithFilters(filters);

    if (participations.length === 0) {
      throw new NotFoundException('No se encontraron participaciones con los filtros especificados');
    }

    // Crear nuevo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participaciones');

    // Configurar columnas
    worksheet.columns = [
      { header: 'ID Participación', key: 'id', width: 36 },
      { header: 'Usuario ID', key: 'userId', width: 36 },
      { header: 'Nombre Completo Usuario', key: 'userFullName', width: 30 },
      { header: 'Email Usuario', key: 'userEmail', width: 30 },
      { header: 'DNI Usuario', key: 'userDni', width: 15 },
      { header: 'Teléfono Usuario', key: 'userPhone', width: 15 },
      { header: 'Comercio ID', key: 'associateId', width: 36 },
      { header: 'Nombre Comercio', key: 'associateNombre', width: 25 },
      { header: 'Dirección Comercio', key: 'associateDireccion', width: 40 },
      { header: 'Número Ticket', key: 'numeroTicket', width: 20 },
      { header: 'Fecha Ticket', key: 'fechaTicket', width: 15 },
      { header: 'Importe Total', key: 'importeTotal', width: 15 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Agregar datos
    participations.forEach((participation, index) => {
      const row = worksheet.addRow({
        id: participation.id,
        userId: participation.userId,
        userFullName: participation.user?.fullName || '',
        userEmail: participation.user?.email || '',
        userDni: participation.user?.dni || '',
        userPhone: participation.user?.phone || '',
        associateId: participation.associateId,
        associateNombre: participation.associate?.nombre || '',
        associateDireccion: participation.associate?.direccion || '',
        numeroTicket: participation.numeroTicket,
        fechaTicket: participation.fechaTicket,
        importeTotal: participation.importeTotal,
        createdAt: participation.createdAt,
      });

      // Alternar colores de filas
      if (index % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F8F8' },
        };
      }
    });

    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Ajustar formato de fechas y números
    worksheet.getColumn('fechaTicket').numFmt = 'dd/mm/yyyy';
    worksheet.getColumn('createdAt').numFmt = 'dd/mm/yyyy hh:mm';
    worksheet.getColumn('importeTotal').numFmt = '#,##0.00" €"';

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exportar participaciones a CSV
   */
  async exportParticipationsToCSV(filters: ExportQueryDto): Promise<string> {
    const participations = await this.getParticipationsWithFilters(filters);

    if (participations.length === 0) {
      throw new NotFoundException('No se encontraron participaciones con los filtros especificados');
    }

    // Crear encabezados CSV
    const headers = [
      'ID Participación',
      'Usuario ID',
      'Nombre Completo Usuario',
      'Email Usuario',
      'DNI Usuario',
      'Teléfono Usuario',
      'Comercio ID',
      'Nombre Comercio',
      'Dirección Comercio',
      'Número Ticket',
      'Fecha Ticket',
      'Importe Total',
      'Fecha Registro',
    ];

    // Crear filas de datos
    const csvRows = participations.map(participation => [
      participation.id,
      participation.userId,
      participation.user?.fullName || '',
      participation.user?.email || '',
      participation.user?.dni || '',
      participation.user?.phone || '',
      participation.associateId,
      participation.associate?.nombre || '',
      participation.associate?.direccion || '',
      participation.numeroTicket,
      participation.fechaTicket.toISOString().split('T')[0], // Solo fecha
      participation.importeTotal.toString().replace('.', ','), // Formato europeo
      participation.createdAt.toISOString(),
    ]);

    // Combinar encabezados y datos
    const csvContent = [headers, ...csvRows]
      .map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
      .join('\n');

    return csvContent;
  }

  /**
   * Obtener participaciones con filtros aplicados
   */
  private async getParticipationsWithFilters(filters: ExportQueryDto) {
    const whereConditions: any = {};

    if (filters.userId) {
      whereConditions.userId = filters.userId;
    }

    if (filters.associateId) {
      whereConditions.associateId = filters.associateId;
    }

    if (filters.numeroTicket) {
      whereConditions.numeroTicket = Like(`%${filters.numeroTicket}%`);
    }

    // Filtros de fecha
    if (filters.fechaDesde || filters.fechaHasta) {
      const fechaDesde = filters.fechaDesde ? new Date(filters.fechaDesde) : undefined;
      const fechaHasta = filters.fechaHasta ? new Date(filters.fechaHasta) : undefined;
      
      if (fechaDesde && fechaHasta) {
        whereConditions.fechaTicket = Between(fechaDesde, fechaHasta);
      } else if (fechaDesde) {
        whereConditions.fechaTicket = MoreThanOrEqual(fechaDesde);
      } else if (fechaHasta) {
        whereConditions.fechaTicket = LessThanOrEqual(fechaHasta);
      }
    }

    const participations = await this.participationRepository.find({
      where: whereConditions,
      relations: ['user', 'associate'],
      order: { createdAt: 'DESC' },
    });

    return participations;
  }

  /**
   * Obtener estadísticas de exportación
   */
  async getExportStats(filters: ExportQueryDto): Promise<{
    totalParticipations: number;
    totalUsers: number;
    totalAssociates: number;
    dateRange: {
      desde: Date | null;
      hasta: Date | null;
    };
    totalAmount: number;
  }> {
    const participations = await this.getParticipationsWithFilters(filters);

    const uniqueUsers = new Set(participations.map(p => p.userId));
    const uniqueAssociates = new Set(participations.map(p => p.associateId));
    
    const dateRange = participations.length > 0 ? {
      desde: new Date(Math.min(...participations.map(p => new Date(p.fechaTicket).getTime()))),
      hasta: new Date(Math.max(...participations.map(p => new Date(p.fechaTicket).getTime()))),
    } : { desde: null, hasta: null };

    const totalAmount = participations.reduce((sum, p) => sum + Number(p.importeTotal), 0);

    return {
      totalParticipations: participations.length,
      totalUsers: uniqueUsers.size,
      totalAssociates: uniqueAssociates.size,
      dateRange,
      totalAmount,
    };
  }
}
